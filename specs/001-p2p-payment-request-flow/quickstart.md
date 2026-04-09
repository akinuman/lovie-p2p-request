# Quickstart: P2P Payment Request Flow

## Setup

1. Install dependencies with `pnpm install`.
2. Configure environment variables:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_APP_URL`
3. Run database migrations with `pnpm prisma migrate dev`.
4. Seed demo users with `pnpm prisma db seed`.
5. Start the app with `pnpm dev`.

## Demo Users

- Sender: `sender@example.com`
- Recipient by email: `recipient@example.com`
- Recipient with phone on profile: `recipient-phone@example.com`

## Happy Path Validation

1. Sign in as `sender@example.com`.
2. Create a request to `recipient@example.com` for `12.50` with note
   `Dinner`.
3. Confirm the app stores and displays the value via `amountCents = 1250`.
4. Confirm the outgoing dashboard shows the request as `Pending` with a share
   link.
5. Sign in as `recipient@example.com`.
6. Open the incoming dashboard or the shared link.
7. Confirm the detail view shows full information only for the intended
   recipient.
8. Confirm the detail view shows a live expiration countdown derived from
   `expiresAt`.
9. Click `Pay` and verify:
   - the button enters a 2-3 second processing state
   - the request finishes as `Paid`
   - both outgoing and incoming dashboards reflect the new status

## Additional Validation

1. Create a second request and decline it as the recipient.
2. Create a third request and cancel it as the sender while it is still
   `Pending`.
3. Confirm cancelled requests remain visible to both parties as `Cancelled`.
4. Seed or backdate a request older than 7 days and confirm it becomes
   `Expired`.
5. Try to pay an expired request and confirm the final state remains `Expired`.
6. Create a phone-addressed request and confirm only the user with the matching
   stored phone can see it in the incoming dashboard.
7. Try to create a self-request and confirm validation blocks it.
8. Verify dashboard search and status filtering on both incoming and outgoing
   screens.
9. Verify the countdown remains readable and updates on both mobile and desktop
   detail views.
10. Repeat the core flows at mobile and desktop widths.

## Playwright Evidence

- Run `pnpm playwright test`.
- Configure Playwright with video recording enabled for every test run.
- Critical specs should cover:
  - create and share request
  - pay request
  - decline request
  - cancel request
  - expired request cannot be paid
  - expiration countdown visibility on request details
  - search and filter on dashboards
  - share link summary restrictions for non-recipients
- Retain the generated video artifacts in `test-results/` or the configured
  Playwright output directory.

## Public Deployment Checklist

- Production deployment is hosted on Vercel and reachable publicly.
- Neon production database is connected through environment variables.
- Share links use the production app URL.
- Playwright can run either locally against the production-like app or against
  the deployed public URL via `PLAYWRIGHT_BASE_URL`.
