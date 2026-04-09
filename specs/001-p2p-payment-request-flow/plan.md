# Implementation Plan: P2P Payment Request Flow

**Branch**: `001-p2p-payment-request-flow` | **Date**: 2026-04-09 | **Spec**: `/Users/akin/Codes/lovie-p2p-request/specs/001-p2p-payment-request-flow/spec.md`
**Input**: Feature specification from `/specs/001-p2p-payment-request-flow/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a single-repo monolithic Next.js App Router application for the P2P
payment request assignment. The app uses mock email auth, Neon PostgreSQL,
Drizzle ORM with postgres-js, shadcn/ui, and Vercel deployment to optimize for interview-ready
clarity, fast execution, responsive UX, and strong Playwright evidence. The
feature centers on a single canonical `payment_requests` lifecycle with clear
authorization rules, integer-cent money handling, a live expiration countdown
on request details, and URL-driven dashboard search/filter.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js LTS  
**Primary Dependencies**: Next.js App Router, React, Drizzle ORM, postgres-js, Neon PostgreSQL, Zod, Tailwind CSS, shadcn/ui, Playwright  
**Storage**: Neon PostgreSQL accessed through Drizzle ORM with postgres-js  
**Testing**: Playwright E2E with video recording for critical flows; Vitest for targeted domain and validation helpers  
**Target Platform**: Public Vercel-hosted web application for modern mobile and desktop browsers  
**Project Type**: Single-repo monolithic Next.js web app  
**Performance Goals**: Fast demo-grade interactions; dashboard and detail reads should feel near-instant on assignment-sized data; simulated pay intentionally waits 2-3 seconds  
**Constraints**: Integer cents only, mock email auth, no distributed services, minimal schema, requests expire after 7 days, responsive UX, public deployment required  
**Scale/Scope**: Interview-focused MVP for low-volume demo usage covering create, share, search/filter, pay, decline, cancel, expire, and visible detail countdown behavior

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: The architecture is intentionally monolithic and interview-friendly,
  avoiding unnecessary services and distributed complexity.
- PASS: Money is modeled as integer cents only and validated at the server
  boundary before persistence.
- PASS: Authentication is implemented as simple mock email auth with a signed
  cookie, which is explicitly allowed by the constitution.
- PASS: Responsive mobile and desktop behavior is part of route design,
  component strategy, and Playwright verification.
- PASS: Playwright with always-on video recording is included as a first-class
  quality gate for critical flows.
- PASS: Scope remains tight to the assignment's core request lifecycle and
  reviewability, with search/filter and countdown added only as explicit user
  requirements.

Post-design re-check: PASS. Research, schema, route design, action strategy,
deployment planning, and countdown presentation all stay within constitution
limits and reinforce speed, clarity, and testability.

## Project Structure

### Documentation (this feature)

```text
specs/001-p2p-payment-request-flow/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── web-routes-and-actions.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── layout.tsx
├── page.tsx
├── sign-in/page.tsx
├── (app)/layout.tsx
├── (app)/dashboard/outgoing/page.tsx
├── (app)/dashboard/incoming/page.tsx
├── (app)/requests/new/page.tsx
├── (app)/requests/[requestId]/page.tsx
├── r/[requestId]/page.tsx
└── actions/
    ├── auth.ts
    └── requests.ts

components/
├── auth/
├── dashboard/
├── requests/
└── ui/

lib/
├── auth/
│   ├── session.ts
│   └── current-user.ts
├── db.ts
├── money/
│   ├── format-amount.ts
│   └── parse-amount.ts
├── requests/
│   ├── queries.ts
│   ├── mutations.ts
│   ├── status.ts
│   └── expiry.ts
└── validation/
    ├── auth.ts
    └── requests.ts

drizzle/
├── schema.ts
└── seed.ts

drizzle.config.ts

tests/
└── e2e/
```

**Structure Decision**: Use a single Next.js codebase with App Router pages,
Server Actions, local domain helpers, one Drizzle schema, and owned shadcn/ui
primitives under `components/ui`. This keeps the implementation easy to follow
while still showing full-stack competence.

## Architecture Decisions

### 1. Monolithic Next.js App Router architecture

- One codebase handles routes, data access, auth, and UI.
- Server Components render dashboard and detail views directly from the
  database.
- Server Actions handle mutations and revalidate affected routes.
- A small client-only `ExpirationCountdown` component is embedded in the
  request detail page where live time updates are required.
- Route and component styling uses inline Tailwind utility classes, while
  `app/globals.css` stays limited to theme tokens and base resets.

### 2. Chosen tech stack and why

- **Next.js App Router**: best fit for a Vercel-hosted monolith with server
  rendering, dynamic routes, and form-driven mutations.
- **TypeScript**: keeps lifecycle and validation logic explicit and safer.
- **Drizzle ORM + postgres-js + Neon PostgreSQL**: schema-in-code, typed
  queries, and a lightweight relational setup that fits a focused Next.js
  monolith without extra client generation steps.
- **Zod**: simple server-side input validation with reusable schemas.
- **Tailwind CSS**: fastest path to responsive UI using inline utility classes
  instead of custom per-page stylesheet classes.
- **shadcn/ui**: provides accessible, interview-friendly, source-owned UI
  primitives that keep forms, cards, buttons, and badges consistent without
  locking the project into a heavyweight component dependency.
- **Playwright**: strongest browser-level proof for critical flows and video
  evidence.
- **Vitest**: lightweight helper-level tests for money parsing and lifecycle
  guards.

### 3. Data model

- Persist only `users` and `payment_requests`.
- No separate session table; mock auth uses a signed cookie.
- `payment_requests` holds the full canonical lifecycle and is the source for
  incoming/outgoing dashboards, detail pages, share links, and countdown
  source data via `expiresAt`.

### 4. Auth/session approach

- Sign-in is email-based mock auth.
- On sign-in, the app finds or creates the user by normalized email and sets a
  signed HTTP-only cookie with `userId`.
- Phone matching relies on a stored phone already present on the user's record;
  it is not claimed dynamically from a share link.
- Logout clears the cookie.

### 5. Page and route structure

- `/sign-in`: mock auth form
- `/dashboard/outgoing`: sender dashboard with search/filter
- `/dashboard/incoming`: recipient dashboard with search/filter
- `/requests/new`: create request form
- `/requests/[requestId]`: authenticated full-detail route with a small
  client-side `ExpirationCountdown`
- `/r/[requestId]`: public share route with limited summary for non-recipients
- `/`: small entry route that redirects based on auth state

### 6. Server Action strategy

- Use Server Actions for:
  - `signInAction`
  - `logoutAction`
  - `createRequestAction`
  - `cancelRequestAction`
  - `declineRequestAction`
  - `payRequestAction`
- Use Server Components and direct Drizzle queries for reads.
- Do not build a broad REST API unless a very small route handler is needed for
  operational convenience; this keeps the assignment simpler and easier to
  review.

### 7. Validation strategy

- Validate all auth and request inputs with Zod on the server.
- Parse currency from form strings to integer cents through a dedicated helper.
- Normalize email and phone before comparison or persistence.
- Re-check all lifecycle guards in the mutation layer even if the UI already
  hides invalid actions.
- Treat the countdown UI as a presentation concern derived from persisted
  `expiresAt`, not as a separate source of truth.

### 8. State and status transition rules

- `Pending -> Paid`
  Only the matched recipient can trigger this. The action waits 2-3 seconds and
  performs a final expiry check before committing.
- `Pending -> Declined`
  Only the matched recipient can trigger this while the request is still valid.
- `Pending -> Cancelled`
  Only the sender can trigger this while the request is still pending and not
  expired.
- `Pending -> Expired`
  Triggered lazily by an expiry sync on read and before mutations.
- Terminal states:
  `Paid`, `Declined`, `Cancelled`, `Expired`
- Additional guards:
  - expired requests cannot be paid
  - self-requests are blocked at creation
  - share-link viewers who are not the intended recipient only see summary data

### 9. Search and filter approach

- Both dashboards use URL search params:
  - `q` for free-text search
  - `status` for lifecycle filter
- Queries are server-rendered so results survive refresh, deep links, and
  public demo navigation.
- Search scope:
  - outgoing: request id, recipient contact, note
  - incoming: request id, sender email, note

### 10. Detail countdown approach

- The detail page remains server-rendered overall.
- A small client component named `ExpirationCountdown` receives `expiresAt` and
  renders text such as `Expires in 3d 12h`.
- When the request reaches expiry, the component transitions cleanly to an
  expired state message while server-side reads continue to enforce the
  canonical status.

### 11. E2E testing approach with Playwright video

- Configure Playwright to record video for every critical-flow run.
- Cover at minimum:
  - sign in
  - create and share request
  - pay request
  - decline request
  - cancel request
  - expired request blocked from payment
  - visible expiration countdown on request details
  - dashboard search/filter
  - share link limited summary for non-recipient
- Use stable test seeds so sender, email recipient, and phone-matched recipient
  accounts are deterministic.

### 12. Deployment and environment plan

- Deploy the app to Vercel as a public production URL.
- Connect Neon PostgreSQL through `DATABASE_URL`.
- Required environment variables:
  - `DATABASE_URL`
  - `SESSION_SECRET`
  - `NEXT_PUBLIC_APP_URL`
  - `PLAYWRIGHT_BASE_URL` for deployed-environment testing when desired
- Run the Drizzle schema push before or during deployment setup.
- Keep the production experience simple: one Vercel project, one Neon database,
  no background workers.

### 13. Explicit tradeoffs and assumptions

- Tradeoff: no full auth provider or email delivery.
  This is intentionally simplified to protect assignment scope.
- Tradeoff: no background expiration job.
  Expiry is synchronized lazily to avoid unnecessary platform complexity.
- Tradeoff: no generic public API.
  Server Actions keep the implementation simpler and closer to the UI.
- Assumption: seeded demo users are acceptable for predictable E2E and review.
- Assumption: request volume stays small enough that pragmatic `ILIKE` search is
  sufficient without full-text indexing.
- Assumption: phone-based incoming flows rely on stored profile data rather than
  dynamic phone verification.

## Complexity Tracking

No constitution violations or unjustified complexity are required. Chosen
complexity is limited to what materially improves clarity, public deployment,
and end-to-end proof.
