# Review: Lovie P2P Request Candidate Submission

Reviewed as-is on disk. I'm ignoring the cover letter (not in repo). Verdict up front: **do not advance without a second interview**. The spec-kit discipline is real and parts of the code are competent, but the submission fails two of the assignment's explicit "must ship" requirements, the fintech-critical mutation path has a race, and the public share page leaks PII. For a team that "values engineering too much," those three alone should be disqualifying at face value.

---

## Assignment-level failures (non-negotiable)

These aren't code review nitpicks. The assignment spells them out as hard requirements and the candidate did not meet them.

1. **No live demo URL.** `README.md:22` — literally "Public URL: not set in this workspace yet." The assignment's Technical Requirements explicitly say *"Deployment: Publicly accessible URL"*, and Submission Requirements say *"Deploy to a public URL… Should be testable without local setup."* The candidate shipped deployment *instructions* instead of a deployment. That is not what was asked for.

2. **No automated screen recording of E2E tests.** `README.md:112-115` admits: *"`bun run test:e2e` could not complete in this environment because the sandbox blocked Next.js from binding to local port 3000."* There are no `.webm` / `.mp4` / `test-results/` / `playwright-report/` artifacts committed. The assignment is unambiguous: *"Generate an automated screen recording of your E2E tests running"* and *"Include… Screen recording video (or link)."* The candidate acknowledges they never ran the suite end-to-end on their own machine and shipped it anyway. For a 3–4 hour assignment this is inexcusable — running `playwright test` outside a sandbox takes five minutes.

3. **Validation Status is self-contradictory.** Same block in the README claims `bun run lint`, `bun run build`, and `bun run test:unit` all passed — but not the E2E suite, the one thing the assignment ranks under "Process Discipline (25%)". Then the README keeps asserting "Playwright videos are part of the deliverable, not optional polish" (line 151), while having shipped no videos. They wrote the right words and delivered the opposite thing.

If you want to be generous: these are recoverable. A second conversation where you ask "deploy this and send the video" would tell you whether the candidate can finish. But as submitted, this is a fail against the rubric.

---

## Engineering problems — severity ordered

### S1. Public share page leaks the full request record to any viewer

`app/r/[requestId]/page.tsx:43` passes `request={request}` (a full `PaymentRequestRecord`) to `<RequestShareSummary>`, which hands it straight into `<RequestCard variant="share">`. `components/requests/request-card.tsx:1` is `"use client"`. In Next's RSC/Flight model, **every prop passed from a server boundary into a client component is serialized into the HTML response as hydration data**. Not just what the JSX visibly renders.

That means anyone opening `/r/<uuid>` — no auth required — gets, embedded in the HTML:

- `recipientContactValue` (the recipient's email or phone)
- `recipientMatchedUserId` (internal user PK)
- `senderUserId` (internal user PK)
- `sender.email`, `sender.phone`, `sender.createdAt`, `sender.updatedAt`
- `recipientMatchedUser.email`, `recipientMatchedUser.phone` (when matched)
- All status timestamps

The README line 17 brags: *"Share links with limited public summary access for non-recipients."* The visible UI is limited. The **wire payload is not**. This is a straightforward PII leak and it contradicts the candidate's own spec — FR-018: *"A shareable link MUST allow unauthenticated or non-recipient viewers to see only limited summary information."*

Fix is trivial and the candidate didn't take it: build a narrow `ShareSummary` DTO in `getShareSummaryRequest()` that exposes only `{ id, amountCents, currencyCode, note, status, expiresAt, createdAt, senderLabel }`, and pass that. The `data-access` → `use-cases` split they explicitly introduced in spec 002 exists *exactly* to enforce boundaries like this, and they failed to use it at the one place where it actually matters.

This alone tells me the candidate treats architecture as an aesthetic choice, not a load-bearing one.

### S2. `payRequestMutation` has a TOCTOU race and a 2.5s blocking sleep

`use-cases/mutate-request.ts:147-178`:

```ts
async function payRequestMutation(requestId, actorUserId) {
  const { actorUser, request } = await getAuthorizedActorAndRequest(...)
  guardRequestMutation("pay", request, actorUser);
  await new Promise((resolve) => setTimeout(resolve, 2_500));   // (A)
  const freshRequest = await getFreshRequestOrThrow(requestId); // (B)
  guardRequestMutation("pay", freshRequest, actorUser);         // (C)
  ...
  await applyRequestStatusMutation({ ... status: "Paid" ... }); // (D)
}
```

Three distinct problems, all of which matter for a fintech role:

- **Race (B)→(D).** Between the re-fetch and the update there is zero locking. Two concurrent pay clicks — or a pay that interleaves with a sender cancel — can both pass (C) and both execute (D). There is no `UPDATE … SET status='Paid' WHERE id=? AND status='Pending'` compare-and-swap. The spec waves this away at `specs/002-request-flow-polish/spec.md:37` — *"full real-money protections such as row locking, idempotency keys, ledgering, and settlement-grade transaction handling are acknowledged as production requirements and are out of scope"*. That clarification is the candidate telling you they recognize the concern and chose to not even do the cheap version. A conditional WHERE clause is one line, not "settlement-grade transaction handling."

- **2.5 second server-side sleep (A).** The spec and README describe a "2-3 second processing state," which is a *UI* requirement. They implemented it by blocking the server action. On a serverless deploy that ties up a function invocation for 2.5s per click; on a traditional Node process it ties up an event-loop slot across a DB connection lifetime. The correct approach is (i) return immediately with a `Processing` transient status or a client-side optimistic state, or (ii) do the artificial delay in the client. Blocking the server is the worst option and a senior reviewer should flag it.

- **State-reset of `recipientMatchedUserId` on pay/decline.** `applyRequestStatusMutation` rewrites `recipientMatchedUserId = actorUserId` on pay/decline. That's fine for the lazy-match case, but combined with no guard that `actorUserId` actually matches the recipient contact, it's a way to retroactively rewrite who "owned" the match. Not exploitable here because `guardRequestMutation` checks `viewerRole`, but the coupling is sloppy.

### S3. Lazy expiration creates filter inconsistency

`use-cases/request-expiry.ts` + `use-cases/read-dashboard.ts:131,148`: the system only transitions `Pending → Expired` when somebody reads the row. That's a defensible prototype choice, but look at the interaction with filters:

1. User filters the outgoing dashboard by `status=Pending`.
2. Query runs with `WHERE status = 'Pending'`. Returns rows that are stored as Pending but whose `expiresAt` is in the past.
3. Use case maps each through `syncExpiredRecord`, which mutates the stored row to `Expired` and updates the in-memory copy.
4. UI then renders rows with `status = Expired` **under the "Pending" filter**.

The user asked to see Pending. They see Expired. Either filter server-side on `(status='Pending' AND expires_at > now())`, or materialize expired state in a background job / on write, or at least filter the page post-sync. None of that is here.

Also, `hasMore` is computed from the raw query (limit+1) before expiration sync, but pagination cursors are computed from the post-sync list — across page boundaries the cursor math will be off-by-one when any row in the page flips to Expired under a `status=Pending` filter.

### S4. Test-suite architecture is broken for parallel execution

`playwright.config.ts:10` sets `fullyParallel: true` and has two projects (`chromium` and `mobile-chrome`). `tests/e2e/global.setup.ts` runs `bun run db:migrate` and `bun run db:seed` *once*, at the start, against a single shared `DATABASE_URL`. There is no per-worker database, no per-test transaction wrapping, no teardown.

Several tests then make assertions that are only valid against a known-empty database:

- `request-dashboard-polish.spec.ts:37-74` creates 12 requests named `Dashboard polish 01..12`, then asserts *"Dashboard polish 12 is visible"* and *"Dashboard polish 01 is NOT visible"*. That depends on default page size being < 12 *and* on no concurrent test pushing rows that sort above `Dashboard polish 12`.
- `request-lifecycle-and-filtering.spec.ts:85-89` filters by "Keep me" + status=Cancelled and expects "No outgoing requests match these filters". That only holds because of the unique note string; it would still break if another parallel test happens to cancel a request carrying the substring "Keep me". Today the tests use disjoint notes and squeak through. This is fragile by accident, not by design.
- `request-lifecycle-and-filtering.spec.ts:102-141` depends on the seeded `"Expired seeded request"` row still existing. Parallel runs that touch the recipient dashboard will race each other on `syncExpiredRequest` (which does `UPDATE payment_requests SET status='Expired' …` with no row lock) — safe only because they all write the same value.

A senior would have either (a) pinned `workers: 1`, (b) used per-worker schemas via `DATABASE_URL?schema=test_worker_${process.env.TEST_WORKER_INDEX}`, or (c) wrapped each test in a transaction rollback. The candidate did none of them and still shipped `fullyParallel: true`. This is the exact kind of suite that works on their laptop, flakes on CI, and rots.

I'd bet non-trivial money that these tests flake under the mobile-chrome project running in parallel with chromium. And the candidate *never ran them*, so they wouldn't know.

### S5. Sign-in redirect is a broken promise

`app/sign-in/page.tsx:47-51` renders *"Sign in to continue to {from}"* when the middleware passes through a `?from=` param. `components/auth/sign-in-form.tsx` does not forward `from` as a hidden input. `app/actions/auth.ts:37` does `redirect("/dashboard/outgoing")` unconditionally. So the UI tells the user they'll be returned to `/requests/<id>`, and then silently drops them on the outgoing dashboard. Tiny bug, but it's the kind of thing I expect a candidate to *not* ship while simultaneously writing the "middleware-backed optimistic route guards" copy on README line 153.

### S6. Session cookie has no lifetime

`lib/auth/session.ts:61-67`:
```ts
cookieStore.set(SESSION_COOKIE_NAME, value, {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
});
```
No `maxAge`, no `expires`. The session is a session cookie (deleted on browser close) with no server-side expiry check — `issuedAt` is put in the payload (line 57) and then **never read** by `decodeSession`. Mock auth or not, this is the kind of detail a senior engineer who lists "fintech understanding" in their rubric would not miss.

### S7. "Middleware-backed route guards" don't validate anything

`lib/auth/route-guard.ts:18-20`:
```ts
export function hasOptimisticSessionCookie(cookieValue?: string | null) {
  return Boolean(cookieValue);
}
```
Any non-empty string satisfies the middleware. It doesn't check the signature, doesn't decode the payload, doesn't look up the user. I understand the intent — middleware runs in the Edge runtime where you can't hit the DB — but (a) you *can* do HMAC verification in middleware without touching the DB, and (b) the README sells this as "middleware-backed optimistic route guards" which overstates what's actually running. The component is fine, the framing is dishonest.

### S8. `integer` column for money

`drizzle/schema.ts:61` uses `integer("amount_cents")`. Postgres `integer` maxes at 2^31 - 1 ≈ $21.47M. The app caps at $50k so today it doesn't matter, but the rubric literally reads *"Fintech Understanding: Do you handle amounts correctly (decimal precision)…"*. For a senior fintech engineer, the correct column type is `bigint`. The candidate chose the wrong one and then wrote a test to assert their too-small type never overflows. The cap is a bandaid on a typing mistake.

### S9. `drizzle-kit push` as "migrations"

`package.json:18`: `"db:migrate": "drizzle-kit push"`. There is exactly one SQL migration file in `drizzle/migrations/` and it's a two-line column rename. `push` deploys schema by diffing against the live DB — there's no ordered history, no rollback path, no audit trail of schema evolution. For a take-home prototype this is defensible. For somebody applying to a company where money touches a database, I want to see `drizzle-kit generate` + reviewed migration files, or an explicit note acknowledging the tradeoff. Neither is present.

### S10. Share links use the raw primary key as the share token

`app/r/[requestId]/page.tsx` + `drizzle/schema.ts:46`: share URLs are `/r/<uuid>` where `<uuid>` is the payment request's database primary key. UUID v4 has enough entropy to be unguessable (~122 bits) so there is no direct attack. But:

- There's no way to rotate or revoke a share link without deleting the row.
- The request ID shows up in logs, revalidation calls (`revalidatePath(\`/r/${requestId}\`)`), and API responses — the "share token" and the "internal identifier" are the same value, so any place that logs one logs the other.
- In a production fintech system, "public share token" and "internal ID" are different columns by default. The spec doesn't even mention this tradeoff.

Same category as S8: not broken today, but wrong by default for the domain.

---

## Smaller issues (call them out, don't fail on them)

- `data-access/payment-requests.ts:135-139` always returns `nextCursor: null`. The use-case layer (`read-dashboard.ts:136,153`) then recomputes the real cursor. The `nextCursor` field on the data-access result is dead code living in a "we split data-access and use-cases for boundary clarity" architecture. The candidate built the split, then violated it on the first field.
- `components/requests/request-card.tsx` is 229 lines handling both `"outgoing"` and `"share"` variants via runtime type narrowing (`isDashboardRequestCardPayload`). Two distinct cards, two distinct use sites, one overloaded component. A senior would split it.
- `tests/unit/lib/money/parse-amount.test.ts:24-28` tests that `50000.01` is rejected but never tests that `50000.00` is accepted — the exact boundary the spec spent a clarification section pinning down. The one test you actually care about is missing.
- `components/requests/expiration-countdown.tsx:34` initializes state with `Date.now()`, which differs between server render and client hydration. Expect hydration warnings, and the "live countdown" is driven by the client clock — a lying clock on the user's laptop lies to them about expiry.
- `drizzle/schema.ts:37-38` puts unique indexes on both `email` and `phone`. Phone is nullable — Postgres treats NULLs as distinct so this happens to work, but the candidate didn't leave a comment explaining *why* a nullable unique works and a future maintainer on MySQL gets a fun day.
- `lib/validation/requests.ts:14` email regex is `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — pragmatic, but you're validating something that controls request routing. Use `z.string().email()`.
- `app/actions/requests.ts:153-157` rejects unconfirmed pay actions with *"Confirm the payment before continuing."* instead of the form showing a confirm dialog. The spec calls for an explicit dialog confirmation step (which the client component does implement); the server check exists as a belt-and-suspenders, but the error message is user-hostile if the dialog ever silently breaks.
- No audit/log trail on status transitions. `lastStatusChangedAt` is a single timestamp; there's no history table. For fintech, the absence of an audit log is a structural gap, not a polish gap.
- `AGENTS.md:6-9` is clearly an auto-generated mess with "Playwrigh" truncated twice. Fine in isolation, but it's a sign the candidate didn't read the artifacts spec-kit emitted on their behalf.

---

## What's actually good

To be fair to the candidate:

- **Spec-kit was used seriously.** Two iterations (`001-p2p-payment-request-flow`, `002-request-flow-polish`), each with spec + plan + research + data-model + tasks + contracts + quickstart. 2,693 total lines of planning artifacts. They did the process work.
- **Money parsing is careful.** `lib/money/parse-amount.ts` is string-based, integer-only, with an explicit regex. No `parseFloat`.
- **Separation of concerns exists** (`app/actions` → `use-cases` → `data-access` → Drizzle), even if the share page defeats it and `buildRequestPageResult` has dead code.
- **Unit tests cover the meaningful boundaries** — validation, parsing, status guards, pagination, dashboard query state. Ten test files, all focused.
- **Session cookie is HMAC-signed** with `timingSafeEqual`, HttpOnly, Secure in prod. They at least know the shape.
- **The spec enumerates real edge cases** — self-recipient, expiry during pay, cancelled-then-acted, clipboard failure. They were thinking about the right things; they just didn't always implement them correctly.

---

## Scoring against the rubric

| Criterion | Weight | Score | Why |
|---|---|---|---|
| Language Mastery | 30% | **C+ / 65** | Spec is present and structured, runs ~2.7k lines. Quality is decent but several clarifications defensively declare real concerns "out of scope" rather than addressing them even cheaply. Edge cases are enumerated but not always implemented. |
| Technical Depth | 25% | **D+ / 55** | Share-page PII leak, pay-path race, `integer` for cents, lazy-expiration filter inconsistency, test suite broken under parallelism. For a role where fintech understanding is 25% of the grade, these are the wrong mistakes. |
| Execution Speed | 20% | **B- / 72** | They got a functioning app structure with reasonable UI polish done in the 3–4 hour window. The Spec→Plan→Tasks→Impl discipline did move them forward. |
| Process Discipline | 25% | **D / 50** | Assignment explicitly required a live URL and automated video. Shipped neither. Shipped E2E tests they never ran. Acknowledged the gap in the README instead of fixing it. That's the opposite of process discipline — that's process performance theater. |

Weighted: **~60/100**. Below the hire bar for a team that claims to have the best engineers.

---

## My recommendation

Don't hire on this submission. But I'd run a short follow-up before closing the door, because the candidate's process instincts are actually present — they just never validated their own output. Two questions to ask in a follow-up:

1. *"Your README says E2E tests couldn't run in your sandbox. Deploy the app, run the suite against the deployed URL, and send the video. How long will that take?"* — If it's >30 minutes, they don't understand how to operate their own toolchain. If they push back, they don't treat requirements as requirements.

2. *"Walk me through what happens on `/r/<uuid>` when someone who is not the recipient opens the page. What does the network tab show?"* — If they don't see the PII leak in `view-source`, they don't understand how RSC boundaries work, which is a core skill for the stack they chose. If they do see it and say "yeah I'd fix it with a narrow DTO," that's a real senior-engineer answer and worth a second look.

3. *"In `payRequestMutation`, what guarantees that two concurrent pay clicks don't both succeed?"* — If they say "nothing, but I noted it was out of scope," push on whether a one-line `WHERE status='Pending'` addition was out of scope. This is the single best signal for whether they think about money code the way your team needs them to.

If they answer 2 and 3 well on a call, the submission's failings start to look like time-pressure misallocation rather than missing judgment, and a hire-no-hire call becomes meaningful. As it stands on disk alone: **no hire**.