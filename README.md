# CompliBot — AI-Powered Industrial Compliance Service

CompliBot generates complete compliance reports, filings, and documentation for OSHA, EPA, and maintenance regulations. AI handles 90% of the work autonomously; human reviewers verify the final 10%.

## Quick Start

```bash
# Start infrastructure
docker compose up postgres redis -d

# Install dependencies
cd api && bun install
cd ../portal && npm install

# Run migrations and seed
cd ../api
bun run src/db/migrate.ts
bun run src/db/seed.ts

# Start services
bun run --bun src/index.ts &
cd ../portal && npm run dev
```

## Full Docker Setup

```bash
cp .env.example .env
# Edit .env with your OPENAI_API_KEY
docker compose up --build
```

API: http://localhost:3001
Portal: http://localhost:3000

## Architecture

- **API**: Bun + Hono + Drizzle ORM + PostgreSQL + Redis
- **Portal**: Next.js 14 + Tailwind CSS + Recharts
- **AI Engine**: OpenAI GPT-4 for report generation with regulatory knowledge base

## Supported Report Types

- OSHA 300 Log (Injury/Illness Records)
- OSHA 300A Annual Summary
- EPA Tier II Chemical Inventory
- Maintenance Compliance Audits
- Safety Inspection Reports