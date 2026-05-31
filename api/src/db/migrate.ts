import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env["DATABASE_URL"] ?? "postgresql://complibot:complibot@localhost:5432/complibot";

async function migrate(): Promise<void> {
  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  console.log("Running migrations...");

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE project_type AS ENUM ('OSHA_300', 'EPA_TIER2', 'MAINTENANCE_AUDIT', 'SAFETY_INSPECTION');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'review', 'complete', 'archived');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE report_status AS ENUM ('generating', 'draft', 'review', 'approved', 'revision_requested', 'final');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE gap_severity AS ENUM ('critical', 'high', 'medium', 'low', 'informational');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE document_status AS ENUM ('uploaded', 'processing', 'extracted', 'failed');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS organizations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      industry TEXT,
      size TEXT,
      locations INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS facilities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      facility_type TEXT,
      employee_count INTEGER,
      naics_code TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id),
      facility_id UUID REFERENCES facilities(id),
      name TEXT NOT NULL,
      type project_type NOT NULL,
      status project_status NOT NULL DEFAULT 'draft',
      description TEXT,
      date_range_start TIMESTAMP,
      date_range_end TIMESTAMP,
      due_date TIMESTAMP,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id),
      project_id UUID REFERENCES projects(id),
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      status document_status NOT NULL DEFAULT 'uploaded',
      raw_content TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS extracted_data (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID NOT NULL REFERENCES documents(id),
      data_type TEXT NOT NULL,
      structured JSONB NOT NULL,
      confidence DECIMAL(5,4),
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id),
      project_id UUID NOT NULL REFERENCES projects(id),
      facility_id UUID REFERENCES facilities(id),
      report_type project_type NOT NULL,
      title TEXT NOT NULL,
      status report_status NOT NULL DEFAULT 'generating',
      date_range_start TIMESTAMP,
      date_range_end TIMESTAMP,
      summary TEXT,
      compliance_score INTEGER,
      metadata JSONB,
      approved_by UUID REFERENCES users(id),
      approved_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS report_sections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL REFERENCES reports(id),
      section_order INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      citations JSONB,
      findings JSONB,
      recommendations JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS compliance_gaps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id),
      project_id UUID REFERENCES projects(id),
      report_id UUID REFERENCES reports(id),
      facility_id UUID REFERENCES facilities(id),
      standard TEXT NOT NULL,
      requirement TEXT NOT NULL,
      current_state TEXT NOT NULL,
      severity gap_severity NOT NULL,
      recommended_action TEXT NOT NULL,
      deadline TIMESTAMP,
      resolved BOOLEAN NOT NULL DEFAULT false,
      resolved_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS regulatory_requirements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      standard TEXT NOT NULL,
      section TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      applicability TEXT,
      frequency TEXT,
      penalties TEXT,
      metadata JSONB
    );
  `);

  console.log("Migrations complete.");
  await client.end();
}

migrate().catch((err: unknown) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
