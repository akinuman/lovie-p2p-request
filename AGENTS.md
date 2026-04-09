# lovie-p2p-request Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-09

## Active Technologies
- TypeScript 5.x on Node.js LTS + Next.js App Router, React, Prisma ORM, Neon PostgreSQL, Zod, Tailwind CSS, Playwright (001-p2p-payment-request-flow)
- Neon PostgreSQL accessed through Prisma (001-p2p-payment-request-flow)

## Project Structure

```text
app/
components/
lib/
prisma/
tests/
```

## Constitutional Guardrails

- Keep scope tight to the take-home P2P payment request feature.
- Store and test all money values as integer cents, never floating point values.
- Prefer simple, testable architecture and allow mock email auth when auth is needed.
- Maintain responsive UX for both mobile and desktop critical flows.
- Require Playwright end-to-end coverage and video artifacts for critical flows.

## Commands

- `pnpm install`
- `pnpm dev`
- `pnpm prisma migrate dev`
- `pnpm prisma db seed`
- `pnpm playwright test`
- `pnpm test`

## Code Style

TypeScript/Next.js: Prefer Server Components for reads, Server Actions for
mutations, Zod for server validation, and integer-cents money helpers for all
currency parsing and formatting boundaries.

## Recent Changes
- 001-p2p-payment-request-flow: Added TypeScript 5.x on Node.js LTS + Next.js App Router, React, Prisma ORM, Neon PostgreSQL, Zod, Tailwind CSS, Playwrigh
- 001-p2p-payment-request-flow: Added a monolithic Next.js App Router plan with Neon, Prisma, mock auth, Playwright video coverage, and Vercel deployment

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
