---

description: "Task list for implementing the P2P payment request flow"
---

# Tasks: P2P Payment Request Flow

**Input**: Design documents from `/Users/akin/Codes/lovie-p2p-request/specs/001-p2p-payment-request-flow/`
**Prerequisites**: `/Users/akin/Codes/lovie-p2p-request/specs/001-p2p-payment-request-flow/plan.md`, `/Users/akin/Codes/lovie-p2p-request/specs/001-p2p-payment-request-flow/spec.md`, `/Users/akin/Codes/lovie-p2p-request/specs/001-p2p-payment-request-flow/research.md`, `/Users/akin/Codes/lovie-p2p-request/specs/001-p2p-payment-request-flow/data-model.md`, `/Users/akin/Codes/lovie-p2p-request/specs/001-p2p-payment-request-flow/contracts/web-routes-and-actions.md`

**Minimum high-value skills selected via `find-skills` review**:
- `nextjs-app-router-patterns`: highest-value implementation guidance for the Next.js App Router monolith.
- `vercel:shadcn`: highest-value UI-system guidance for shared, source-owned components and consistent Tailwind composition.
- `vercel:deployments-cicd`: highest-value deployment guidance for shipping the public Vercel deliverable.

**Deliberately not selected**:
- No extra E2E skill because Playwright coverage and video requirements are already explicit in the plan and quickstart, and no installed Playwright-specific skill adds unique value here.

**Tests**: Playwright end-to-end coverage with automated video recording is REQUIRED for critical flows. Targeted Vitest coverage is included for money parsing, auth guards, lifecycle rules, and query filtering.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested, and demonstrated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: Maps task to a user story (`[US1]`, `[US2]`, `[US3]`)
- Every task includes the main purpose and the expected output file path(s)

## Path Conventions

- Next.js monolith: `app/`, `components/`, `drizzle/`, `lib/`, `tests/`
- Documentation: `README.md`, `specs/001-p2p-payment-request-flow/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bootstrap the monolithic Next.js project and local toolchain so implementation can start cleanly.

- [X] T001 Initialize the Next.js App Router monolith, shadcn/ui configuration, and package scripts in `/Users/akin/Codes/lovie-p2p-request/package.json`, `/Users/akin/Codes/lovie-p2p-request/next.config.ts`, `/Users/akin/Codes/lovie-p2p-request/tsconfig.json`, `/Users/akin/Codes/lovie-p2p-request/postcss.config.mjs`, `/Users/akin/Codes/lovie-p2p-request/eslint.config.mjs`, and `/Users/akin/Codes/lovie-p2p-request/components.json`
- [X] T002 Configure the global app shell, theme tokens, inline Tailwind styling, and shared shadcn/ui primitives in `/Users/akin/Codes/lovie-p2p-request/app/layout.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/globals.css`, `/Users/akin/Codes/lovie-p2p-request/components/ui/`, and `/Users/akin/Codes/lovie-p2p-request/lib/utils.ts`
- [X] T003 [P] Add local environment scaffolding and developer scripts in `/Users/akin/Codes/lovie-p2p-request/.env.example` and `/Users/akin/Codes/lovie-p2p-request/package.json`
- [X] T004 [P] Configure Playwright and Vitest toolchain files in `/Users/akin/Codes/lovie-p2p-request/playwright.config.ts`, `/Users/akin/Codes/lovie-p2p-request/vitest.config.ts`, and `/Users/akin/Codes/lovie-p2p-request/tsconfig.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared persistence, auth, validation, and domain infrastructure required by every story.

**⚠️ CRITICAL**: Complete this phase before story implementation.

- [X] T005 Define the minimal Drizzle schema for `users` and `payment_requests` in `/Users/akin/Codes/lovie-p2p-request/drizzle/schema.ts`
- [X] T006 Configure the initial Drizzle migration workflow and demo seed users for sender/email recipient/phone recipient flows in `/Users/akin/Codes/lovie-p2p-request/drizzle.config.ts` and `/Users/akin/Codes/lovie-p2p-request/drizzle/seed.ts`
- [X] T007 [P] Add typed database and environment helpers in `/Users/akin/Codes/lovie-p2p-request/lib/db.ts` and `/Users/akin/Codes/lovie-p2p-request/lib/env.ts`
- [X] T008 [P] Implement integer-cent money parsing and formatting helpers in `/Users/akin/Codes/lovie-p2p-request/lib/money/parse-amount.ts` and `/Users/akin/Codes/lovie-p2p-request/lib/money/format-amount.ts`
- [X] T009 [P] Implement Zod schemas for sign-in, request creation, and dashboard filters in `/Users/akin/Codes/lovie-p2p-request/lib/validation/auth.ts` and `/Users/akin/Codes/lovie-p2p-request/lib/validation/requests.ts`
- [X] T010 Implement signed cookie mock-auth session helpers and current-user lookup in `/Users/akin/Codes/lovie-p2p-request/lib/auth/session.ts` and `/Users/akin/Codes/lovie-p2p-request/lib/auth/current-user.ts`
- [X] T011 Implement canonical lifecycle and expiry domain helpers in `/Users/akin/Codes/lovie-p2p-request/lib/requests/status.ts` and `/Users/akin/Codes/lovie-p2p-request/lib/requests/expiry.ts`
- [X] T012 Implement shared request read/write service functions and cache revalidation helpers in `/Users/akin/Codes/lovie-p2p-request/lib/requests/queries.ts` and `/Users/akin/Codes/lovie-p2p-request/lib/requests/mutations.ts`
- [X] T013 Implement the root redirect, sign-in route, and protected app layout shell in `/Users/akin/Codes/lovie-p2p-request/app/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/sign-in/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/actions/auth.ts`, and `/Users/akin/Codes/lovie-p2p-request/app/(app)/layout.tsx`
- [X] T014 Configure Playwright fixtures, seeded test setup, and always-on video capture in `/Users/akin/Codes/lovie-p2p-request/tests/e2e/fixtures.ts`, `/Users/akin/Codes/lovie-p2p-request/tests/e2e/global.setup.ts`, and `/Users/akin/Codes/lovie-p2p-request/playwright.config.ts`

**Checkpoint**: The repo can boot, connect to Neon via Drizzle, authenticate a mock user, and support repeatable seeded test runs.

---

## Phase 3: User Story 1 - Sender Creates and Shares a Request (Priority: P1) 🎯 MVP

**Goal**: Let a signed-in sender create a valid request, see it in the outgoing dashboard, and share a summary link.

**Independent Test**: Sign in as `sender@example.com`, create a request with a valid recipient and positive amount, confirm the new request appears as `Pending` in outgoing, and confirm the public share link shows limited summary information.

### Tests for User Story 1

- [X] T015 [P] [US1] Add Playwright coverage for sender sign-in, request creation, outgoing `Pending` state, and share-link summary video in `/Users/akin/Codes/lovie-p2p-request/tests/e2e/request-create-and-share.spec.ts`
- [X] T016 [P] [US1] Add Vitest coverage for amount parsing, contact validation, and self-request blocking in `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/money/parse-amount.test.ts` and `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/validation/requests.test.ts`

### Implementation for User Story 1

- [X] T017 [US1] Build the sign-in form and authenticated navigation shell in `/Users/akin/Codes/lovie-p2p-request/components/auth/sign-in-form.tsx` and `/Users/akin/Codes/lovie-p2p-request/components/dashboard/dashboard-nav.tsx`
- [X] T018 [US1] Build the request-creation page and form UI for recipient, amount, and note input in `/Users/akin/Codes/lovie-p2p-request/app/(app)/requests/new/page.tsx` and `/Users/akin/Codes/lovie-p2p-request/components/requests/request-form.tsx`
  Ensure the `useActionState`-backed form normalizes unexpected or undefined action-state payloads on the initial render before reading nested `values` or `errors`, and keep the shared initial state in a non-`use server` module.
- [X] T019 [US1] Implement `createRequestAction` and persistence for normalized contacts, integer cents, and share-link generation in `/Users/akin/Codes/lovie-p2p-request/app/actions/requests.ts` and `/Users/akin/Codes/lovie-p2p-request/lib/requests/mutations.ts`
  Keep the post-create redirect outside the mutation `try`/`catch` so Next.js redirect control flow is not surfaced back into the form as a `NEXT_REDIRECT` error.
- [X] T020 [US1] Build the outgoing dashboard route and sender request list UI in `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/outgoing/page.tsx` and `/Users/akin/Codes/lovie-p2p-request/components/dashboard/outgoing-list.tsx`
- [X] T021 [US1] Build reusable request status and summary presentation components in `/Users/akin/Codes/lovie-p2p-request/components/requests/status-badge.tsx` and `/Users/akin/Codes/lovie-p2p-request/components/requests/request-card.tsx`
- [X] T022 [US1] Build the public share-link summary route with limited non-recipient visibility in `/Users/akin/Codes/lovie-p2p-request/app/r/[requestId]/page.tsx` and `/Users/akin/Codes/lovie-p2p-request/components/requests/request-share-summary.tsx`
- [X] T023 [US1] Add sender-focused empty, validation, and success states for create/share/outgoing flows in `/Users/akin/Codes/lovie-p2p-request/components/requests/request-form.tsx`, `/Users/akin/Codes/lovie-p2p-request/components/dashboard/outgoing-list.tsx`, and `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/outgoing/page.tsx`
  Preserve a stable fallback state for field values and errors so validation UI does not crash before the first action response.

**Checkpoint**: A sender can sign in, create a request, copy/share the link, and verify the request in the outgoing dashboard and public summary page.

---

## Phase 4: User Story 2 - Recipient Reviews and Resolves a Request (Priority: P1)

**Goal**: Let the intended recipient view incoming requests, inspect details, and resolve them through `Pay` or `Decline`.

**Independent Test**: Sign in as the intended recipient, open the incoming dashboard or detail route, verify full details plus a live expiration countdown, then pay or decline the request and confirm the resulting state appears in both recipient and sender views.

### Tests for User Story 2

- [ ] T024 [P] [US2] Add Playwright coverage for incoming detail, visible expiration countdown, pay, and decline flows with video in `/Users/akin/Codes/lovie-p2p-request/tests/e2e/request-resolve.spec.ts`
- [ ] T025 [P] [US2] Add Vitest coverage for recipient matching and pay/decline guard rules in `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/auth/current-user.test.ts` and `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/requests/status.test.ts`

### Implementation for User Story 2

- [ ] T026 [US2] Implement recipient matching for email and phone-addressed requests in `/Users/akin/Codes/lovie-p2p-request/lib/requests/queries.ts` and `/Users/akin/Codes/lovie-p2p-request/lib/auth/current-user.ts`
- [ ] T027 [US2] Build the incoming dashboard route and recipient request list UI in `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/incoming/page.tsx` and `/Users/akin/Codes/lovie-p2p-request/components/dashboard/incoming-list.tsx`
- [ ] T028 [US2] Build the authenticated request-detail route with full/limited participant states and a client-side `ExpirationCountdown` component in `/Users/akin/Codes/lovie-p2p-request/app/(app)/requests/[requestId]/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/components/requests/request-detail.tsx`, and `/Users/akin/Codes/lovie-p2p-request/components/requests/expiration-countdown.tsx`
- [ ] T029 [US2] Implement `declineRequestAction` and recipient decline UI wiring in `/Users/akin/Codes/lovie-p2p-request/app/actions/requests.ts` and `/Users/akin/Codes/lovie-p2p-request/components/requests/request-actions.tsx`
- [ ] T030 [US2] Implement `payRequestAction` with 2-3 second simulated processing and final expiry check in `/Users/akin/Codes/lovie-p2p-request/app/actions/requests.ts` and `/Users/akin/Codes/lovie-p2p-request/lib/requests/mutations.ts`
- [ ] T031 [US2] Revalidate and surface synchronized sender/recipient status updates after recipient actions in `/Users/akin/Codes/lovie-p2p-request/app/actions/requests.ts`, `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/outgoing/page.tsx`, and `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/incoming/page.tsx`

**Checkpoint**: The intended recipient can discover an incoming request, inspect it, and resolve it while sender and recipient views stay synchronized.

---

## Phase 5: User Story 3 - Users See Accurate Lifecycle Statuses (Priority: P2)

**Goal**: Make lifecycle states, cancellation, expiration, and dashboard search/filter behavior trustworthy and easy to verify.

**Independent Test**: Cancel a pending request, verify `Cancelled` remains visible to both parties, backdate a request to `Expired`, verify it cannot be paid, and confirm dashboard search/filter returns only matching requests on mobile and desktop layouts.

### Tests for User Story 3

- [ ] T032 [P] [US3] Add Playwright coverage for cancel, expiry, and dashboard search/filter flows with video in `/Users/akin/Codes/lovie-p2p-request/tests/e2e/request-lifecycle-and-filtering.spec.ts`
- [ ] T033 [P] [US3] Add Vitest coverage for expiry synchronization and filtered query behavior in `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/requests/expiry.test.ts` and `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/requests/queries.test.ts`

### Implementation for User Story 3

- [ ] T034 [US3] Implement `cancelRequestAction` and cancelled-state visibility across dashboards and detail views in `/Users/akin/Codes/lovie-p2p-request/app/actions/requests.ts`, `/Users/akin/Codes/lovie-p2p-request/components/requests/request-actions.tsx`, and `/Users/akin/Codes/lovie-p2p-request/components/requests/request-detail.tsx`
- [ ] T035 [US3] Implement lazy expiry synchronization on reads and mutations in `/Users/akin/Codes/lovie-p2p-request/lib/requests/expiry.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/requests/queries.ts`, and `/Users/akin/Codes/lovie-p2p-request/lib/requests/mutations.ts`
- [ ] T036 [US3] Add URL-driven search and status filter controls to both dashboards in `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/outgoing/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/incoming/page.tsx`, and `/Users/akin/Codes/lovie-p2p-request/components/dashboard/dashboard-filters.tsx`
- [ ] T037 [US3] Implement filtered/sorted dashboard queries and terminal-state messaging in `/Users/akin/Codes/lovie-p2p-request/lib/requests/queries.ts`, `/Users/akin/Codes/lovie-p2p-request/components/dashboard/outgoing-list.tsx`, and `/Users/akin/Codes/lovie-p2p-request/components/dashboard/incoming-list.tsx`
- [ ] T038 [US3] Polish responsive layouts and disabled-action messaging for lifecycle edge cases in `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/outgoing/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/incoming/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/(app)/requests/[requestId]/page.tsx`, and `/Users/akin/Codes/lovie-p2p-request/components/requests/request-detail.tsx`

**Checkpoint**: Lifecycle transitions, terminal states, and dashboard filtering all behave predictably and are demonstrable through automated browser proof.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize reliability, reviewer clarity, and public deployment readiness.

- [ ] T039 [P] Add loading, error, and not-found states for key routes in `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/outgoing/loading.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/incoming/loading.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/(app)/requests/[requestId]/loading.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/(app)/requests/[requestId]/error.tsx`, and `/Users/akin/Codes/lovie-p2p-request/app/(app)/requests/[requestId]/not-found.tsx`
- [ ] T040 [P] Document local setup, demo accounts, and developer workflow in `/Users/akin/Codes/lovie-p2p-request/README.md` and `/Users/akin/Codes/lovie-p2p-request/.env.example`
- [ ] T041 [P] Document Vercel deployment, Neon environment wiring, and public URL verification in `/Users/akin/Codes/lovie-p2p-request/README.md` and `/Users/akin/Codes/lovie-p2p-request/specs/001-p2p-payment-request-flow/quickstart.md`
- [ ] T042 Verify quickstart scenarios, Playwright video artifacts, and final reviewer notes in `/Users/akin/Codes/lovie-p2p-request/README.md` and `/Users/akin/Codes/lovie-p2p-request/specs/001-p2p-payment-request-flow/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; produces the first working vertical slice.
- **User Story 2 (Phase 4)**: Depends on Foundational and benefits from User Story 1 request-creation output.
- **User Story 3 (Phase 5)**: Depends on User Stories 1 and 2 because it extends lifecycle coverage and dashboard behavior.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: First MVP slice; no story dependency.
- **User Story 2 (P1)**: Requires seeded requests and sender creation flow from US1.
- **User Story 3 (P2)**: Requires base create/resolve flows from US1 and US2.

### Within Each User Story

- Write the Playwright and Vitest coverage before or alongside the implementation tasks for that story.
- Implement data/domain logic before wiring final UI actions.
- Keep request lifecycle rules centralized in `lib/requests/*`.
- Revalidate routes immediately after any state-changing action.

### Parallel Opportunities

- T003 and T004 can run in parallel once T001-T002 exist.
- T007, T008, and T009 can run in parallel after T005.
- T015 and T016 can run in parallel at the start of US1.
- T024 and T025 can run in parallel at the start of US2.
- T032 and T033 can run in parallel at the start of US3.
- T039, T040, and T041 can run in parallel after implementation stabilizes.

---

## Parallel Example: User Story 1

```bash
# Launch sender-flow tests together:
Task: "Add Playwright sender create/share flow in tests/e2e/request-create-and-share.spec.ts"
Task: "Add Vitest validation coverage in tests/unit/lib/validation/requests.test.ts and tests/unit/lib/money/parse-amount.test.ts"

# Launch sender UI work on separate files after core services exist:
Task: "Build outgoing dashboard UI in app/(app)/dashboard/outgoing/page.tsx and components/dashboard/outgoing-list.tsx"
Task: "Build share summary UI in app/r/[requestId]/page.tsx and components/requests/request-share-summary.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch recipient-flow tests together:
Task: "Add Playwright resolve-flow coverage in tests/e2e/request-resolve.spec.ts"
Task: "Add Vitest guard coverage in tests/unit/lib/auth/current-user.test.ts and tests/unit/lib/requests/status.test.ts"

# Launch recipient UI work on separate files after matching logic exists:
Task: "Build incoming dashboard UI in app/(app)/dashboard/incoming/page.tsx and components/dashboard/incoming-list.tsx"
Task: "Build request detail UI in app/(app)/requests/[requestId]/page.tsx and components/requests/request-detail.tsx"
```

## Parallel Example: User Story 3

```bash
# Launch lifecycle tests together:
Task: "Add Playwright lifecycle/filter coverage in tests/e2e/request-lifecycle-and-filtering.spec.ts"
Task: "Add Vitest expiry/filter coverage in tests/unit/lib/requests/expiry.test.ts and tests/unit/lib/requests/queries.test.ts"

# Launch dashboard polish tasks together after expiry sync exists:
Task: "Add dashboard filters in app/(app)/dashboard/outgoing/page.tsx, app/(app)/dashboard/incoming/page.tsx, and components/dashboard/dashboard-filters.tsx"
Task: "Polish lifecycle messaging in components/dashboard/outgoing-list.tsx, components/dashboard/incoming-list.tsx, and components/requests/request-detail.tsx"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate sender sign-in, request creation, outgoing pending state, and share summary through Playwright video.
5. If needed, demo the MVP before moving to recipient actions.

### Incremental Delivery

1. Setup + Foundational establish the monolith, schema, mock auth, and shared helpers.
2. User Story 1 delivers the sender vertical slice.
3. User Story 2 adds recipient resolution and synchronized statuses.
4. User Story 3 adds lifecycle trust, filters, and responsive refinement.
5. Phase 6 makes the project public-review ready on Vercel with strong documentation.

### Single-Developer Strategy

1. Keep one active phase at a time to minimize context switching.
2. Finish the data/domain helper for a flow before polishing that flow’s UI.
3. Use seeded users and Playwright video as the main regression safety net.
4. Stop at each checkpoint and confirm the story works independently before moving forward.

## Notes

- All tasks follow the required checklist format with IDs, labels, and file paths.
- The task list avoids microservices, separate apps, background workers, websockets, real payment processing, TanStack Query, and `nuqs`.
- The early vertical slice is the sender flow in User Story 1.
- Playwright video evidence is treated as part of done, not an optional add-on.
