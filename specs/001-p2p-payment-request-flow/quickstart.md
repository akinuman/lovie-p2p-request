# Quickstart: P2P Payment Request Flow

## Purpose

Use this guide to validate the planned feature behavior during implementation,
local demo, and public deployment review.

## Demo Assumptions

- The app uses mock email authentication.
- Money is stored as integer cents and formatted only in the UI.
- A public deployment URL is available for final review.

## Suggested Demo Users

- Sender: `sender@example.com`
- Recipient: `recipient@example.com`

## Happy Path Validation

1. Sign in as `sender@example.com`.
2. Create a request for `recipient@example.com` with `amountCents = 1250` and
   note `Dinner`.
3. Confirm a unique request ID, shareable link, and `Pending` outgoing status.
4. Sign in as `recipient@example.com`.
5. Open the incoming dashboard or shared link and verify the detail view shows
   sender, recipient, note, amount, status, and timestamp.
6. Click `Pay` and confirm the UI shows a 2-3 second processing state.
7. Verify the request becomes `Paid` in both sender and recipient views.

## Additional Validation

1. Create a second request and confirm the recipient can `Decline` it.
2. Create a third request and confirm the sender can `Cancel` it while pending.
3. Seed or backdate a request older than 7 days and confirm it is `Expired`.
4. Confirm an expired request cannot be paid.
5. Repeat the sender and recipient flows at mobile and desktop widths.

## Public Deployment Checklist

- The deployment is reachable without private network access.
- Mock authentication works for both sender and recipient demo users.
- Shareable request links resolve correctly in the deployed environment.
- Critical Playwright flows run against the deployed or deployment-equivalent
  environment and produce video artifacts.

## Test Evidence Expectations

- Playwright critical-flow specs live under `tests/e2e/`.
- Recorded videos are retained as review artifacts from the automated E2E run.
- At minimum, video evidence covers create/share, pay, decline, cancel, and
  expired-payment-blocked behavior.
