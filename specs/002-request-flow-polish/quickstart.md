# Quickstart: Request Flow Polish

## Setup

1. Install dependencies with `bun install`.
2. Copy `.env.example` to `.env`.
3. Configure:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - `PLAYWRIGHT_BASE_URL` only when running against an existing local or
     deployed URL
4. Apply database changes with `bun run db:migrate`.
5. Seed demo data with `bun run db:seed`.
6. Start the app with `bun run dev`.

## Demo Accounts

- Sender: `sender@example.com`
- Recipient by email: `recipient@example.com`
- Recipient with phone on profile: `recipient-phone@example.com`

## Core Validation Flow

1. Sign in as `sender@example.com`.
2. Open the new request screen and confirm it is card-focused without extra
   technical explanation banners.
3. Create a request for `recipient@example.com` with a valid amount and note.
4. Confirm the app redirects to `/dashboard/outgoing` and opens a dialog for
   the new request.
5. Use `Copy link` from the dialog and confirm `Preview` opens the share page.
6. Close the dialog and confirm the new request remains visible in the outgoing
   list.
7. Refresh or navigate back after closing the dialog and confirm it does not
   reopen automatically.
8. Confirm the outgoing request card exposes `View details`, `Preview`,
   `Copy link`, and `Cancel` when pending.

## Search, Filter, and Infinite Scroll Validation

1. Create or seed enough outgoing and incoming requests to require multiple
   dashboard pages.
2. On the outgoing dashboard:
   - type into search and confirm results update after debounce
   - change status filter and confirm results update immediately
   - confirm there is no Apply button
   - confirm the clear control only activates when query state exists
   - change query state while an older fetch is in flight and confirm stale
     results do not append
   - scroll to the bottom and confirm additional cards append
3. Repeat the same checks on the incoming dashboard.

## Pay Confirmation and Validation Rules

1. Create a new pending request for `recipient@example.com`.
2. Sign in as `recipient@example.com` and open incoming or request detail.
3. Tap `Pay` and confirm a dialog asks for explicit confirmation before the
   processing state begins.
4. Confirm the existing 2-3 second processing simulation still runs only after
   confirmation.
5. Try to create a request above 50,000 major currency units and confirm the
   form blocks submission.
6. Confirm async action buttons show a spinner and prevent duplicate clicks
   while pending.
7. Confirm amounts render using backend-provided currency across dashboard
   cards, detail screens, share preview, and post-create dialog.
8. Force or simulate clipboard copy failure and confirm inline error feedback
   appears while the share URL remains manually copyable.

## Auth Guard and Refactor Validation

1. Sign out and try to open:
   - `/dashboard/outgoing`
   - `/dashboard/incoming`
   - `/requests/new`
   - `/requests/[requestId]`
2. Confirm centralized auth redirection happens before protected page content
   renders.
3. Review the implementation and confirm:
   - `lib/data-access/*` owns raw persistence operations
   - `lib/use-cases/requests/*` owns request orchestration
   - page files are thinner and focused on route composition

## Playwright Evidence

- Run `bun run test:e2e`.
- Open the HTML report with `bun run playwright:report`.
- Retain video artifacts from `test-results/`.
- Add or update E2E coverage for:
  - debounced search without Apply button
  - stale pagination response discard behavior
  - infinite scroll append behavior
  - outgoing card copy-link and preview actions
  - copy-link failure fallback
  - post-create dialog behavior and URL-state clearing
  - pay confirmation dialog
  - pay invalidation while dialog is open
  - spinner and duplicate-click protection on async buttons
  - max amount validation
  - auth guard redirects for protected routes

## Public Demo Verification

1. Deploy the app publicly on Vercel.
2. Set `NEXT_PUBLIC_APP_URL` to the production URL.
3. Run database migration and seed steps against the hosted environment if demo
   users are needed.
4. Repeat the Core Validation Flow and Search, Filter, and Infinite Scroll
   Validation against the public URL.
5. Re-run `bun run test:e2e` with `PLAYWRIGHT_BASE_URL` pointed at the public
   deployment so reviewer evidence matches the hosted build.
