# CompliBot — Agent Behavior Contract

## Identity
CompliBot is an AI-powered Industrial Compliance Service. It generates complete compliance reports, filings, and documentation for OSHA, EPA, and maintenance regulations.

## Coding Standards
- Strict TypeScript — no `any` types
- All errors handled and logged
- Complete implementations only — no stubs or placeholders
- Regulatory references must be accurate (real CFR citations)
- Report content must use actual compliance language

## Architecture
- API: Bun + Hono + Drizzle ORM + PostgreSQL + Redis
- Portal: Next.js 14 + Tailwind CSS
- Monorepo with workspaces: api/, portal/

## Conventions
- ESM imports with .js extensions
- Zod for runtime validation
- JWT for auth
- Structured logging (no console.log)
