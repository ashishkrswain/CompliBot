import { Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware } from "../middleware/auth.js";
import { extractDocumentData, validateExtractedData } from "../services/document-processor.js";
import { generateCompletion } from "../lib/llm.js";
import * as schema from "../db/schema.js";

const DATABASE_URL = process.env["DATABASE_URL"] ?? "postgresql://complibot:complibot@localhost:5432/complibot";
const client = postgres(DATABASE_URL);
const db = drizzle(client);

const documentsRouter = new Hono();
documentsRouter.use("*", authMiddleware);

documentsRouter.post("/upload", async (c) => {
  const orgId = c.get("orgId") as string;
  const formData = await c.req.formData();

  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;
  const documentType = formData.get("documentType") as string | null;

  if (!file) {
    return c.json({ error: "File is required" }, 400);
  }

  const rawContent = await file.text();
  const documentId = uuidv4();

  await db.insert(schema.documents).values({
    id: documentId,
    orgId,
    projectId: projectId ?? null,
    filename: file.name,
    mimeType: file.type || "text/plain",
    size: file.size,
    status: "processing",
    rawContent,
  });

  // Process document asynchronously
  processDocumentAsync(documentId, rawContent, documentType).catch((err: unknown) => {
    console.error(`Document processing failed for ${documentId}:`, err);
  });

  return c.json({
    document: {
      id: documentId,
      filename: file.name,
      size: file.size,
      status: "processing",
    },
  }, 201);
});

async function processDocumentAsync(documentId: string, rawContent: string, hint: string | null): Promise<void> {
  try {
    const extracted = await extractDocumentData(rawContent, hint ?? undefined);
    const validation = validateExtractedData(extracted);

    await db.insert(schema.extractedData).values({
      id: uuidv4(),
      documentId,
      dataType: extracted.dataType,
      structured: extracted.records as unknown as Record<string, unknown>,
      confidence: String(extracted.confidence),
    });

    await db
      .update(schema.documents)
      .set({ status: validation.valid ? "extracted" : "extracted" })
      .where(eq(schema.documents.id, documentId));
  } catch (err: unknown) {
    console.error(`Extraction failed for document ${documentId}:`, err);
    await db.update(schema.documents).set({ status: "failed" }).where(eq(schema.documents.id, documentId));
  }
}

documentsRouter.get("/", async (c) => {
  const orgId = c.get("orgId") as string;
  const projectId = c.req.query("projectId");

  let docs;
  if (projectId) {
    docs = await db
      .select()
      .from(schema.documents)
      .where(and(eq(schema.documents.orgId, orgId), eq(schema.documents.projectId, projectId)));
  } else {
    docs = await db.select().from(schema.documents).where(eq(schema.documents.orgId, orgId));
  }

  return c.json({ documents: docs });
});

documentsRouter.get("/:id", async (c) => {
  const orgId = c.get("orgId") as string;
  const documentId = c.req.param("id");

  const docs = await db
    .select()
    .from(schema.documents)
    .where(and(eq(schema.documents.id, documentId), eq(schema.documents.orgId, orgId)))
    .limit(1);

  const doc = docs[0];
  if (!doc) {
    return c.json({ error: "Document not found" }, 404);
  }

  const extracted = await db
    .select()
    .from(schema.extractedData)
    .where(eq(schema.extractedData.documentId, documentId));

  return c.json({ document: doc, extractedData: extracted });
});

// ─── Text Upload (JSON body) ─────────────────────────────────────────────────

const textUploadSchema = z.object({
  content: z.string().min(1),
  filename: z.string().min(1),
  standard: z.string().min(1),
  projectId: z.string().uuid().optional(),
});

documentsRouter.post("/upload-text", async (c) => {
  const orgId = c.get("orgId") as string;
  const body = await c.req.json();
  const parsed = textUploadSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const { content, filename, standard, projectId } = parsed.data;
  const documentId = uuidv4();

  await db.insert(schema.documents).values({
    id: documentId,
    orgId,
    projectId: projectId ?? null,
    filename,
    mimeType: "text/plain",
    size: Buffer.byteLength(content, "utf-8"),
    status: "extracted",
    rawContent: content,
  });

  // Store the standard association as extracted data
  await db.insert(schema.extractedData).values({
    id: uuidv4(),
    documentId,
    dataType: "compliance_document",
    structured: { standard, filename, contentLength: content.length } as unknown as Record<string, unknown>,
    confidence: "1.0000",
  });

  return c.json({
    document: {
      id: documentId,
      filename,
      size: Buffer.byteLength(content, "utf-8"),
      status: "extracted",
      standard,
    },
  }, 201);
});

// ─── Gap Analysis ────────────────────────────────────────────────────────────

interface GapFinding {
  requirement: string;
  status: "compliant" | "partial" | "non_compliant" | "not_addressed";
  finding: string;
}

interface GapAnalysisResult {
  gaps: GapFinding[];
  score: number;
  recommendations: string[];
}

documentsRouter.post("/:id/analyze", async (c) => {
  const orgId = c.get("orgId") as string;
  const documentId = c.req.param("id");

  const docs = await db
    .select()
    .from(schema.documents)
    .where(and(eq(schema.documents.id, documentId), eq(schema.documents.orgId, orgId)))
    .limit(1);

  const doc = docs[0];
  if (!doc) {
    return c.json({ error: "Document not found" }, 404);
  }

  if (!doc.rawContent) {
    return c.json({ error: "Document has no text content to analyze" }, 400);
  }

  // Retrieve the standard from extracted data
  const extractedRecords = await db
    .select()
    .from(schema.extractedData)
    .where(eq(schema.extractedData.documentId, documentId));

  let standard = "General Compliance";
  for (const record of extractedRecords) {
    const structured = record.structured as Record<string, unknown> | null;
    if (structured && typeof structured === "object" && "standard" in structured) {
      standard = String(structured.standard);
      break;
    }
  }

  const systemPrompt = `You are a compliance gap analysis expert. Analyze documents against regulatory standards and identify gaps.
You MUST respond with valid JSON only. No markdown, no explanation, no code blocks.
The JSON must match this exact structure:
{
  "gaps": [{"requirement": "string", "status": "compliant|partial|non_compliant|not_addressed", "finding": "string"}],
  "score": <number 0-100>,
  "recommendations": ["string"]
}`;

  const userPrompt = `Analyze the following document against ${standard} requirements. List all gaps found.

DOCUMENT CONTENT:
${doc.rawContent.slice(0, 12000)}

Identify specific requirements from ${standard} that are addressed, partially addressed, or missing.
Provide a compliance score (0-100) and actionable recommendations.`;

  try {
    const rawResponse = await generateCompletion(systemPrompt, userPrompt, {
      temperature: 0.2,
      maxTokens: 4096,
    });

    let analysisResult: GapAnalysisResult;
    try {
      analysisResult = JSON.parse(rawResponse) as GapAnalysisResult;
    } catch {
      // If the LLM returns non-JSON, wrap into a structured fallback
      analysisResult = {
        gaps: [{
          requirement: `${standard} General Requirements`,
          status: "partial" as const,
          finding: "Document requires manual review — automated analysis could not parse structured results.",
        }],
        score: 50,
        recommendations: [
          "Conduct a manual compliance review against the full standard.",
          "Ensure all required policy sections are present and up-to-date.",
        ],
      };
    }

    // Validate and clamp score
    const score = Math.max(0, Math.min(100, Math.round(analysisResult.score ?? 50)));
    const gaps: GapFinding[] = Array.isArray(analysisResult.gaps)
      ? analysisResult.gaps.map((g) => ({
          requirement: String(g.requirement ?? "Unknown requirement"),
          status: (["compliant", "partial", "non_compliant", "not_addressed"].includes(g.status) ? g.status : "partial") as GapFinding["status"],
          finding: String(g.finding ?? ""),
        }))
      : [];
    const recommendations: string[] = Array.isArray(analysisResult.recommendations)
      ? analysisResult.recommendations.map(String)
      : [];

    return c.json({
      documentId,
      standard,
      gaps,
      score,
      recommendations,
    });
  } catch (err: unknown) {
    console.error(`Gap analysis failed for document ${documentId}:`, err);
    return c.json({ error: "Gap analysis failed" }, 500);
  }
});

export { documentsRouter };
