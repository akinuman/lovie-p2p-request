# Research: P2P Payment Request Flow

## Decision 1: Use a single-repo monolithic Next.js App Router application

- **Decision**: Implement the assignment as one Next.js App Router application
  in a single repo, without separate frontend/backend services.
- **Rationale**: This is the clearest fit for the assignment's emphasis on
  speed of delivery, readability, public deployment, and end-to-end testability.
  It keeps routing, UI, mutations, and data access in one place.
- **Alternatives considered**: A split frontend/backend architecture was
  rejected because it adds coordination and deployment complexity without
  improving the core take-home evaluation.

## Decision 2: Use TypeScript throughout the app

- **Decision**: Use TypeScript for application, validation, and test code.
- **Rationale**: TypeScript improves clarity around request states, money
  handling, and action inputs while remaining standard and interviewer-friendly.
- **Alternatives considered**: Plain JavaScript was rejected because it would
  reduce type safety around lifecycle rules and validated input shapes.

## Decision 3: Use Neon PostgreSQL with Drizzle ORM

- **Decision**: Persist data in Neon PostgreSQL and access it through Drizzle
  ORM with postgres-js.
- **Rationale**: Neon satisfies the required hosted relational persistence, and
  Drizzle keeps the SQL-facing schema close to the application while still
  providing typed queries and lightweight runtime behavior that fits a small
  Next.js monolith well. This combination balances delivery speed with enough
  technical depth for the assignment.
- **Alternatives considered**: SQLite was rejected because the assignment asks
  for public deployment and realistic persistence. Heavyweight ORM generation
  workflows were rejected because the project wants a simpler schema-in-code
  setup.

## Decision 4: Use signed cookie mock auth with no persisted session table

- **Decision**: Implement mock email auth with a signed, HTTP-only cookie that
  stores the current user id, backed by a `users` table but no `sessions` table.
- **Rationale**: The constitution explicitly prefers simple/mock auth, and a
  signed cookie avoids an unnecessary table while remaining straightforward to
  reason about in Next.js server code.
- **Alternatives considered**: NextAuth/Auth.js and custom database sessions
  were rejected because they add setup and concepts beyond what the assignment
  needs.

## Decision 5: Use Server Components for reads and Server Actions for mutations

- **Decision**: Render dashboards and detail pages as Server Components and use
  Next.js Server Actions for login, logout, create, cancel, decline, and pay.
- **Rationale**: App Router defaults align well with server-first reads,
  authenticated access control, and mutation flows that can revalidate pages
  without a separate API layer.
- **Alternatives considered**: A full REST API was rejected as unnecessary
  ceremony for an internal monolith. Client-heavy data fetching was rejected
  because it complicates auth and state consistency.

## Decision 6: Use Tailwind CSS with shadcn/ui primitives

- **Decision**: Build the UI with inline Tailwind utility classes and a local
  shadcn/ui setup for shared primitives such as buttons, cards, badges, and
  form controls.
- **Rationale**: Tailwind keeps page-level styling fast and colocated, while
  shadcn/ui gives us owned, accessible component source that keeps the app
  visually consistent without hiding the implementation behind a black-box
  library.
- **Alternatives considered**: Large component libraries were rejected because
  they add setup weight and can make a take-home feel generic. A purely custom
  CSS-class approach was rejected because it drifts faster and makes future
  UI work less consistent.

## Decision 7: Represent money as integer cents with explicit parsing helpers

- **Decision**: Accept amount input as a string in the form layer, parse it via
  a dedicated helper, and persist only `amountCents` integers in the database.
- **Rationale**: This directly enforces the constitution's money rule and keeps
  formatting isolated to the UI boundary.
- **Alternatives considered**: Storing decimals or floats was rejected because
  it violates the constitution and creates avoidable rounding risk.

## Decision 8: Persist request lifecycle directly on the request record

- **Decision**: Keep lifecycle state on a single `payment_requests` table using
  explicit statuses: `Pending`, `Paid`, `Declined`, `Cancelled`, and `Expired`.
- **Rationale**: A single canonical record is the simplest way to keep sender
  and recipient views synchronized and easy to test.
- **Alternatives considered**: Event-sourcing or separate status history tables
  were rejected as unnecessary for the assignment.

## Decision 9: Expire requests lazily but persist the terminal status

- **Decision**: On relevant reads and before any mutation, run a small expiry
  sync that converts overdue `Pending` requests to `Expired` in the database.
- **Rationale**: This avoids background jobs while still keeping the stored
  status truthful once an expired request is touched.
- **Alternatives considered**: Cron-based expiration was rejected because it
  adds platform and operational complexity. Purely computed expiry without
  persisting the state was rejected because it complicates filtering and UI
  consistency.

## Decision 10: Make share links summary-visible but action-protected

- **Decision**: Public share links resolve to a summary page that shows limited
  request information to anyone with the link, while full details and actions
  require authentication as the intended recipient.
- **Rationale**: This matches the clarified behavior and keeps the sharing flow
  convenient without making the link itself the authorization boundary.
- **Alternatives considered**: Fully private links were rejected because they
  weaken the sharing experience. Fully public action links were rejected because
  they are too permissive for a fintech-style flow.

## Decision 11: Support phone recipients through stored user profile data

- **Decision**: A phone-addressed request is visible or actionable only for a
  signed-in user whose existing profile contains the matching phone number.
- **Rationale**: This matches the clarification outcome and avoids turning mock
  auth into an ad hoc phone-claim flow.
- **Alternatives considered**: Letting any viewer claim a phone request by
  typing a number was rejected because it weakens identity rules.

## Decision 12: Implement dashboard search and filter in URL search params

- **Decision**: Incoming and outgoing dashboards use `searchParams` such as
  `q` and `status` to drive server-rendered queries.
- **Rationale**: URL-based filters are simple, testable, shareable, and align
  naturally with App Router Server Components.
- **Alternatives considered**: Client-only in-memory filtering was rejected
  because it does not scale as cleanly to persisted server data and is less
  robust for direct linking and reloads.

## Decision 12a: Render the expiration countdown as a tiny client component

- **Decision**: Keep the detail page server-rendered overall, but render the
  live expiration label through a small client-side `ExpirationCountdown`
  component fed by persisted `expiresAt`.
- **Rationale**: The countdown must visibly update over time, which is a good
  fit for a focused client component without turning the whole detail page into
  client-side UI.
- **Alternatives considered**: A server-only countdown label was rejected
  because it would go stale without constant refreshes.

## Decision 13: Use Playwright as the browser truth source with video always on

- **Decision**: Playwright is the primary end-to-end test layer, configured to
  record video for all critical flows.
- **Rationale**: The constitution requires Playwright proof plus automated video
  artifacts, and Playwright maps directly to the sender/recipient journeys the
  reviewer cares about.
- **Alternatives considered**: Relying only on unit or integration tests was
  rejected because it would not prove the full product flow.

## Decision 14: Deploy on Vercel with a public production URL

- **Decision**: Deploy the monolith to Vercel and connect it to Neon through
  environment variables.
- **Rationale**: Vercel is the natural deployment target for a Next.js App
  Router project and makes it easy to share a public URL for review.
- **Alternatives considered**: Self-hosting or container deployment was
  rejected because it would add operational work unrelated to the assignment.
