# Lovie P2P Payment Request

A peer-to-peer payment request flow for a consumer fintech app. Senders create
shareable payment requests, recipients pay or decline them, and lifecycle state
stays synchronized across incoming and outgoing dashboards.

**Live demo**: [lovie-p2p-request.vercel.app](https://lovie-p2p-request.vercel.app/)

**Video walkthrough**: [Loom recording](https://www.loom.com/share/559d1f3dad8946ccbf0e55a1d62446e2)

**E2E test recordings**: Playwright video recordings of every test run are
committed in `test-results/` — each spec produces a `.webm` file showing the
browser interaction across chromium and mobile-chrome viewports.

## What It Does

- **Request creation** with recipient email or phone, amount (currency input
  mask with presets), and optional note
- **Outgoing dashboard** with cancel, view details, preview, and share link
  (copy to clipboard) actions directly on each card
- **Incoming dashboard** with pay (confirmation dialog) and decline actions
- **Debounced search**, instant status filters, and cursor-based infinite scroll
  on both dashboards
- **Post-create success dialog** with shareable link and preview
- **Request detail view** with live expiration countdown
- **Share links** (`/r/:id`) with limited public summary for non-recipients;
  authenticated recipients are redirected to the full detail page
- **Lifecycle state machine**: Pending, Paid, Declined, Cancelled, Expired —
  terminal states remain visible to both participants with no further actions
- **Mock email auth** (assignment scope) with HMAC-signed session cookies and
  middleware-backed route guards

## Tech Stack

| Layer       | Choice                                      |
| ----------- | ------------------------------------------- |
| Framework   | Next.js 15 App Router + React 19            |
| Language    | TypeScript 5                                |
| Database    | Neon PostgreSQL + Drizzle ORM               |
| Styling     | Tailwind CSS + shadcn/ui + Radix primitives |
| Validation  | Zod (server-side, shared schemas)           |
| E2E Testing | Playwright (chromium + mobile-chrome)       |
| Package Mgr | Bun                                         |
| Deployment  | Vercel                                      |

## Architecture and Engineering Decisions

### Layered Separation: `data-access/` -> `use-cases/` -> Server Actions

The codebase follows a clean separation between data access, business logic, and
transport:

- **`data-access/`** contains table-scoped CRUD operations (`payment-requests.ts`,
  `users.ts`) — pure database queries with no business logic
- **`use-cases/`** contains business logic modules: request creation, mutation
  guards, dashboard reads, expiry sync, pagination, status rules
- **Server Actions** (`use-cases/request-actions.ts`, `use-cases/auth-actions.ts`)
  are thin wrappers that validate input, call use cases, and revalidate paths
- **`lib/`** holds pure utilities: money formatting/parsing, validation schemas,
  auth primitives, date helpers

This means every business rule is testable independently of Next.js, and data
access never leaks business assumptions.

### Money Handling: Integer Cents with `bigint` Storage

All monetary values are parsed, stored, and formatted as integer cents — no
floating-point arithmetic anywhere in the pipeline:

- `lib/money/parse-amount.ts` — parses user input to cents with 2-decimal
  validation
- `lib/money/format-amount.ts` — formats cents to locale-aware currency strings
  via `Intl.NumberFormat`
- `drizzle/schema.ts` — `amount_cents` column uses PostgreSQL `bigint` (safe up
  to ~$90 trillion)
- `hooks/use-currency-input.ts` — client-side input mask that operates on
  integer/decimal parts separately, never on floats

### Optimistic Concurrency on Mutations

Status transitions use a `WHERE status = 'Pending'` guard in the UPDATE query.
If two actors race (e.g. pay and cancel simultaneously), only one succeeds — the
other gets zero rows updated and a clear error message. No row locks needed for
this demo's concurrency model.

### Cursor-Based Pagination

Dashboard infinite scroll uses opaque base64url-encoded cursors containing
`(createdAt, id)` tuples. This avoids `OFFSET` performance degradation on large
tables and provides stable pagination when new requests are created between page
loads.

### Ephemeral Neon Branch E2E Isolation

Each Playwright run creates a temporary Neon database branch via the Neon API,
runs migrations and seeds against it, executes all tests, and deletes the branch
on teardown. No test data touches the development or production database.

### HMAC-Signed Sessions with Timing-Safe Verification

Even for mock auth, sessions use `crypto.createHmac` with `timingSafeEqual` for
signature verification — not because this demo needs it, but because it's the
right pattern and costs nothing extra to get right.

### Zod-Validated Environment

`lib/env.ts` validates all required environment variables at startup via Zod,
failing fast with clear error messages instead of runtime `undefined` surprises.

### Server Components by Default, Client Components at Boundaries

Dashboard pages, detail views, and the share summary are React Server Components.
Client interactivity is pushed to leaf components: filter controls, currency
input, copy-to-clipboard, countdown timer, confirmation dialogs. This keeps the
JS bundle small and data fetching on the server.

### RSC Data Boundary on Share Links

The public share page (`/r/:id`) renders as a Server Component that fetches the
full request record server-side — including recipient-matching fields needed for
the authenticated redirect check — but **destructures out internal fields before
passing props to the client component**. Unauthenticated visitors see only the
safe DTO (amount, note, status, sender label). The `_recipientMatch` data never
crosses the RSC boundary and never appears in the client bundle or network
payload.

## How I Built It

I used **Spec Kit** to drive the implementation through a structured
`spec -> plan -> tasks -> implementation` workflow, running it twice:

1. **[`specs/001-p2p-payment-request-flow/`](specs/001-p2p-payment-request-flow/)**
   — End-to-end solution: auth, schema, request CRUD, lifecycle, dashboards,
   share links, E2E tests
2. **[`specs/002-request-flow-polish/`](specs/002-request-flow-polish/)** —
   UI polish and missing requirements: debounced search, instant filters,
   infinite scroll, pay confirmation dialog, post-create dialog, middleware
   route guards, `data-access`/`use-cases` refactor

Within each spec pass I used Spec Kit's **clarify** step to surface edge cases
(expiry-during-pay race, self-request blocking, phone-to-user matching) before
writing any code.

After spec-driven implementation, remaining UI fixes and polish were built with
**Claude Code** using these skills:

- `vercel-react-best-practices` — Server Component patterns, Server Actions,
  revalidation
- `neon-postgres` — Neon branch management, Drizzle + postgres-js configuration
- `typescript-advanced-types` — Discriminated unions for action state, type-safe
  schema inference
- `frontend-design` — Component composition, responsive layout, accessibility
- `find-skills` — Discovered relevant skills during implementation

## Local Setup

1. `bun install`
2. Copy [`.env.example`](.env.example) to `.env` and set:
   - `DATABASE_URL` — Neon PostgreSQL connection string
   - `SESSION_SECRET` — any random string (min 16 chars)
   - `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` for local dev
   - `NEON_API_KEY` — Neon API key (required for E2E tests)
   - `NEON_PROJECT_ID` — Neon project ID (required for E2E tests)
3. `bun run db:generate` to generate migration files from the Drizzle schema
4. `bun run db:migrate` to apply migrations to the database
5. `bun run db:seed` to create demo accounts and sample requests
6. `bun run dev` and open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Email                   | Role                        |
| ----------------------- | --------------------------- |
| `sender@example.com`    | Creates outgoing requests   |
| `recipient@example.com` | Receives requests via email |

## Development Commands

| Command                     | Description                                     |
| --------------------------- | ----------------------------------------------- |
| `bun run dev`               | Start Next.js dev server                        |
| `bun run build`             | Production build                                |
| `bun run lint`              | ESLint                                          |
| `bun run test:e2e`          | Run Playwright E2E suite                        |
| `bun run test:e2e:headed`   | Run E2E tests with visible browser              |
| `bun run playwright:report` | Open HTML test report                           |
| `bun run db:generate`       | Generate a new migration from schema changes    |
| `bun run db:migrate`        | Apply ordered SQL migration files               |
| `bun run db:push`           | Diff schema directly against live DB (dev only) |
| `bun run db:seed`           | Seed demo users and sample requests             |

## Running E2E Tests

E2E tests require `NEON_API_KEY` and `NEON_PROJECT_ID` in your `.env` — the
suite creates an ephemeral Neon database branch for each run so tests never
touch your development or production data.

```bash
bun run test:e2e
```

Video recordings are saved to `test-results/`.

**Test coverage includes:**

- Sender creates and shares a request
- Recipient pays with confirmation dialog
- Recipient declines a request
- Sender cancels a pending request
- Expired requests show correct state with no actions
- Dashboard search, status filter, and infinite scroll
- Auth guard redirects for protected routes
- Share link access for authenticated and unauthenticated users
- Post-login redirect preservation (`?from=` param)

To view the HTML report after a run:

```bash
bun run playwright:report
```

To run against a deployed URL:

```bash
PLAYWRIGHT_BASE_URL=https://lovie-p2p-request.vercel.app bun run test:e2e
```

## Deployment

The app is deployed on Vercel with a Neon PostgreSQL database.

1. Import the repository into Vercel
2. Set environment variables: `DATABASE_URL`, `SESSION_SECRET`,
   `NEXT_PUBLIC_APP_URL`
3. Deploy — Vercel runs `next build` automatically
4. Run `bun run db:push` against the production database
5. Run `bun run db:seed` for demo accounts

## Project Structure

```
app/
  (app)/                    # Authenticated app routes (layout with nav)
    dashboard/incoming/     # Incoming requests dashboard
    dashboard/outgoing/     # Outgoing requests dashboard
    requests/[requestId]/   # Request detail view
    requests/new/           # Create new request
  r/[requestId]/            # Public share link (no auth required)
  sign-in/                  # Mock auth sign-in
components/
  auth/                     # Sign-in form
  dashboard/                # Dashboard shell, filters, lists, nav
  requests/                 # Request card, detail, form, actions, dialogs
  ui/                       # shadcn/ui primitives
data-access/                # Table-scoped database queries (no business logic)
use-cases/                  # Business logic modules
lib/
  auth/                     # Session HMAC, route guards, current user
  money/                    # Parse/format cents utilities
  validation/               # Zod schemas
hooks/                      # Client-side React hooks
drizzle/                    # Schema, migrations, seed
specs/                      # Spec Kit artifacts (spec, plan, tasks)
tests/e2e/                  # Playwright test suite + Neon branch isolation
```

## Scope Decisions

This is a take-home interview project. The following are intentionally scoped
out but acknowledged as production requirements:

- **Auth**: Mock email auth — production would use a proper identity provider
  with session expiry, refresh tokens, and Edge-level HMAC verification in
  middleware
- **Share tokens**: Share URLs use the request PK — production would use a
  separate opaque token for rotation/revocation
- **Rate limiting & fraud**: Only duplicate submission prevention is implemented;
  broader abuse controls are out of scope
- **Multi-currency & FX**: Single-currency (USD) per environment
- **Phone validation**: Pragmatic US-focused normalization, not full
  libphonenumber parsing
- **Transactional guarantees**: Optimistic concurrency via status guard, not
  row locks or idempotency keys
