# lovie-p2p-request Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-09

## Active Technologies
- TypeScript 5.x on Node.js LTS + Next.js App Router, React, Drizzle ORM, postgres-js, Neon PostgreSQL, Zod, Tailwind CSS, shadcn/ui, Playwright (001-p2p-payment-request-flow)
- Neon PostgreSQL accessed through Drizzle ORM with postgres-js (001-p2p-payment-request-flow)

## Project Structure

```text
app/
components/
drizzle/
lib/
tests/
```

## Constitutional Guardrails

- Keep scope tight to the take-home P2P payment request feature.
- Store and test all money values as integer cents, never floating point values.
- Prefer simple, testable architecture and allow mock email auth when auth is needed.
- Maintain responsive UX for both mobile and desktop critical flows.
- Require Playwright end-to-end coverage and video artifacts for critical flows.

## Commands

- `bun install`
- `bun run dev`
- `bun run db:migrate`
- `bun run db:seed`
- `bun run test:e2e`
- `bun run test`

## Code Style

TypeScript/Next.js: Prefer Server Components for reads, Server Actions for
mutations, Zod for server validation, integer-cents money helpers for all
currency parsing and formatting boundaries, and inline Tailwind composition
with shared shadcn/ui primitives for UI consistency.

## Recent Changes
- 001-p2p-payment-request-flow: Adopted Drizzle ORM with postgres-js across implementation, setup scripts, and planning artifacts
- 001-p2p-payment-request-flow: Added TypeScript 5.x on Node.js LTS + Next.js App Router, React, Drizzle ORM, postgres-js, Neon PostgreSQL, Zod, Tailwind CSS, shadcn/ui, Playwright
- 001-p2p-payment-request-flow: Added a monolithic Next.js App Router plan with Neon, Drizzle, mock auth, Playwright video coverage, and Vercel deployment

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
