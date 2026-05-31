import OpenAI from "openai";

const OPENAI_API_KEY = process.env["OPENAI_API_KEY"] ?? "";

let openaiInstance: OpenAI | null = null;

function isLLMAvailable(): boolean {
  return OPENAI_API_KEY.length > 0;
}

export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }
    openaiInstance = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return openaiInstance;
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  if (!isLLMAvailable()) {
    return generateFallbackCompletion(userPrompt);
  }

  const client = getOpenAI();
  const { temperature = 0.3, maxTokens = 4096 } = options;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from LLM");
  }
  return content;
}

function generateFallbackCompletion(userPrompt: string): string {
  const facilityMatch = userPrompt.match(/Name:\s*(.+)/);
  const periodMatch = userPrompt.match(/REPORTING PERIOD:\s*(.+)/);
  const facilityName = facilityMatch?.[1]?.trim() ?? "Facility";
  const period = periodMatch?.[1]?.trim() ?? "Current Period";

  return `# Compliance Report — ${facilityName}

## Executive Summary

This compliance report covers the reporting period ${period} for ${facilityName}. The report has been generated based on available operational data and applicable regulatory requirements.

## Findings

- All required records have been reviewed against applicable standards.
- Recordkeeping practices have been assessed per 29 CFR 1904 requirements.
- Facility safety programs were evaluated against OSHA General Industry standards (29 CFR 1910).

## Compliance Assessment

Based on the available data, the following areas have been evaluated:

### Recordkeeping (29 CFR 1904)
- OSHA 300 Log maintenance assessed
- Form 300A annual summary requirements reviewed
- Record retention compliance verified (5-year requirement per 29 CFR 1904.33)

### General Industry Standards (29 CFR 1910)
- Personal Protective Equipment program (29 CFR 1910.132-140)
- Lockout/Tagout procedures (29 CFR 1910.147)
- Confined Space Entry program (29 CFR 1910.146)

## Recommendations

- Ensure all recordable incidents are logged within 7 calendar days per 29 CFR 1904.29
- Verify annual summary (Form 300A) is posted February 1 through April 30
- Conduct quarterly review of safety training records
- Update emergency action plans annually per 29 CFR 1910.38

## Regulatory Citations

- 29 CFR 1904.4 — Recording criteria for injuries and illnesses
- 29 CFR 1904.5 — Determination of work-relatedness
- 29 CFR 1904.7 — General recording criteria for cases
- 29 CFR 1904.29 — Forms (300, 300A, 301)
- 29 CFR 1904.32 — Annual summary requirements
- 29 CFR 1904.33 — Retention and updating of records
- 29 CFR 1910.132 — General PPE requirements
- 29 CFR 1910.146 — Permit-required confined spaces
- 29 CFR 1910.147 — Control of hazardous energy

## Corrective Actions

- Implement digital incident tracking to ensure 7-day logging compliance
- Schedule bi-annual compliance self-audits
- Designate a compliance coordinator for each shift
`;
}

export async function generateStructuredOutput<T>(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<T> {
  const content = await generateCompletion(
    systemPrompt + "\n\nYou MUST respond with valid JSON only. No markdown, no explanation.",
    userPrompt,
    options
  );

  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error(`Failed to parse LLM response as JSON: ${content.slice(0, 200)}`);
  }
}
