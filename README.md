# Lovie P2P Payment Request

Interview-ready P2P money request app built with a spec-driven workflow. The
app lets a sender create shareable payment requests, lets the intended
recipient pay or decline them, and keeps lifecycle state synchronized across
incoming and outgoing dashboards.

## Project Overview

- Request creation with recipient email or phone, amount, and optional note
- Outgoing and incoming dashboards with search and status filters
- Request detail view with live expiration countdown
- Simulated payment processing with synchronized `Paid`, `Declined`,
  `Cancelled`, and `Expired` states
- Share links with limited public summary access for non-recipients
- Mock email auth, integer-cent money handling, and Playwright video evidence

## Live Demo

- Public URL: not set in this workspace yet
- After deploying to Vercel, add your production URL here and set
  `NEXT_PUBLIC_APP_URL` to the same value

## Spec-Kit Artifacts

- Feature spec:
  [`specs/001-p2p-payment-request-flow/spec.md`](specs/001-p2p-payment-request-flow/spec.md)
- Implementation plan:
  [`specs/001-p2p-payment-request-flow/plan.md`](specs/001-p2p-payment-request-flow/plan.md)
- Task breakdown:
  [`specs/001-p2p-payment-request-flow/tasks.md`](specs/001-p2p-payment-request-flow/tasks.md)
- Quickstart and reviewer validation:
  [`specs/001-p2p-payment-request-flow/quickstart.md`](specs/001-p2p-payment-request-flow/quickstart.md)

## Tech Stack

- Next.js App Router + React 19 + TypeScript 5
- Drizzle ORM + postgres-js + Neon PostgreSQL
- Tailwind CSS + shadcn/ui primitives
- Zod validation
- Playwright E2E + Vitest unit coverage
- Bun for package management and scripts

## AI-Native Workflow

- Spec-Kit was used to drive the feature from `spec -> plan -> tasks -> implementation`
- Implementation work in this workspace was executed with OpenAI Codex acting
  as the agentic coding tool
- The active implementation skill chain in this repo lives under
  [`.agents/skills`](.agents/skills)
- Current repo guidelines are captured in
  [`AGENTS.md`](AGENTS.md) and
  [`.specify/memory/constitution.md`](.specify/memory/constitution.md)

## Local Setup

1. Install dependencies with `bun install`.
2. Copy values from [`.env.example`](.env.example) into a local `.env`.
3. Set `DATABASE_URL`, `SESSION_SECRET`, and `NEXT_PUBLIC_APP_URL`.
4. Apply the schema with `bun run db:migrate`.
5. Seed demo data with `bun run db:seed`.
6. Start the app with `bun run dev`.
7. Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

- `sender@example.com`
- `recipient@example.com`
- `recipient-phone@example.com`

The seeded phone-matched recipient profile is used to validate phone-addressed
requests in the incoming dashboard.

## Development Commands

- `bun run dev`
- `bun run build`
- `bun run lint`
- `bun run test`
- `bun run test:unit`
- `bun run test:e2e`
- `bun run playwright:report`
- `bun run db:migrate`
- `bun run db:seed`

## How To Run E2E Tests

1. Ensure the database is migrated and seeded.
2. Run `bun run test:e2e`.
3. Open the HTML report with `bun run playwright:report`.
4. Review captured videos under `test-results/`.

The suite covers:

- sender creates and shares a request
- recipient opens details and pays
- recipient matched by phone declines
- sender cancels a request
- expired requests remain non-payable
- dashboard search and filter flows

## Deployment Notes

Deploy this repo to Vercel with a Neon database attached.

1. Import the Git repository into Vercel.
2. Add these environment variables in Vercel for Preview and Production:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_APP_URL`
3. Set `NEXT_PUBLIC_APP_URL` to the final production domain.
4. Run `bun run db:migrate` against the production database before final demo
   verification.
5. Run `bun run db:seed` if you want the hosted demo to include the same review
   accounts used locally.

## Public URL Verification

After production deploy:

1. Open the public URL in an incognito window.
2. Sign in as `sender@example.com` and create a request.
3. Open the share link in a second session and confirm non-recipient access is
   summary-only.
4. Sign in as `recipient@example.com` and confirm the request appears in
   incoming.
5. Complete a `Pay`, `Decline`, and `Cancel` flow.
6. Re-run `bun run test:e2e` against the deployed app by setting
   `PLAYWRIGHT_BASE_URL` to the public URL.

## Reviewer Notes

- All money values are parsed, stored, and asserted as integer cents
- Authentication is intentionally mock email auth to keep the assignment
  focused
- Terminal request states remain visible to both participants
- Playwright videos are part of the deliverable, not optional polish
