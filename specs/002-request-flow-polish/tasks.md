---

description: "Task list for implementing the request flow polish feature"
---

# Tasks: Request Flow Polish

**Input**: Design documents from `/Users/akin/Codes/lovie-p2p-request/specs/002-request-flow-polish/`
**Prerequisites**: `/Users/akin/Codes/lovie-p2p-request/specs/002-request-flow-polish/plan.md`, `/Users/akin/Codes/lovie-p2p-request/specs/002-request-flow-polish/spec.md`, `/Users/akin/Codes/lovie-p2p-request/specs/002-request-flow-polish/research.md`, `/Users/akin/Codes/lovie-p2p-request/specs/002-request-flow-polish/data-model.md`, `/Users/akin/Codes/lovie-p2p-request/specs/002-request-flow-polish/contracts/web-routes-and-interactions.md`

**Minimum high-value skills selected via `find-skills` review**:
- `modern-best-practice-react-components`: highest-value guidance for keeping the new client-side dashboard and dialog logic small, derived, and maintainable.
- `vercel:shadcn`: highest-value guidance for reusing the existing Radix-backed primitive layer instead of creating duplicate primitive components.
- `nextjs-app-router-patterns`: highest-value guidance for App Router reads, Server Actions, middleware redirects, and thin route composition.
- `playwright-e2e-testing`: highest-value guidance for browser-proofing the user stories and newly clarified edge cases.

**Deliberately not selected**:
- No extra client-side data library skill because the plan keeps the existing Next.js monolith and uses narrow internal route handlers rather than introducing a new fetch/cache framework.

**Tests**: Playwright end-to-end coverage with automated video recording is REQUIRED for all affected user stories and their highest-risk edge cases. Targeted Vitest coverage is included for validation, pagination/query state, auth guard behavior, lifecycle preservation, and shared async UI-state helpers.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested, and demonstrated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: Maps task to a user story (`[US1]`, `[US2]`, `[US3]`)
- Every task includes the main purpose and the expected output file path(s)

## Path Conventions

- Next.js monolith: `app/`, `components/`, `drizzle/`, `lib/`, `tests/`
- Documentation: `README.md`, `specs/002-request-flow-polish/`
- UI primitives: reuse `components/ui/*` Radix-backed components or direct Radix primitives; do not create duplicate primitive layers elsewhere

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the polish feature for consistent Radix-backed UI primitives, test scaffolding, and request-flow module boundaries.

- [X] T001 Add the Radix-backed dialog primitive and required package wiring in `/Users/akin/Codes/lovie-p2p-request/package.json` and `/Users/akin/Codes/lovie-p2p-request/components/ui/dialog.tsx`
- [X] T002 [P] Prepare Playwright and Vitest scaffolding for clipboard, pagination, duplicate-click, and auth-redirect scenarios in `/Users/akin/Codes/lovie-p2p-request/playwright.config.ts`, `/Users/akin/Codes/lovie-p2p-request/vitest.config.ts`, `/Users/akin/Codes/lovie-p2p-request/tests/e2e/fixtures.ts`, and `/Users/akin/Codes/lovie-p2p-request/tests/e2e/global.setup.ts`
- [X] T003 [P] Establish request-flow module scaffolding for the refactor in `/Users/akin/Codes/lovie-p2p-request/lib/data-access/payment-requests.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/data-access/users.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/use-cases/requests/dashboard.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/use-cases/requests/mutations.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/use-cases/requests/presentation.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/request-flow/pagination.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/request-flow/query-state.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/request-flow/currency.ts`, and `/Users/akin/Codes/lovie-p2p-request/lib/request-flow/async-action.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared persistence, validation, auth, use-case, and async UI foundations required by every story.

**⚠️ CRITICAL**: Complete this phase before story implementation.

- [X] T004 Update persisted request currency support and seeded demo data in `/Users/akin/Codes/lovie-p2p-request/drizzle/schema.ts` and `/Users/akin/Codes/lovie-p2p-request/drizzle/seed.ts`
- [X] T005 [P] Implement money and validation boundaries for backend-driven currency and the 50,000 maximum amount rule in `/Users/akin/Codes/lovie-p2p-request/lib/validation/requests.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/money/parse-amount.ts`, and `/Users/akin/Codes/lovie-p2p-request/lib/money/format-amount.ts`
- [X] T006 [P] Implement raw user and request CRUD plus paginated query access in `/Users/akin/Codes/lovie-p2p-request/lib/data-access/payment-requests.ts` and `/Users/akin/Codes/lovie-p2p-request/lib/data-access/users.ts`
- [X] T007 Implement request-flow use cases and presentation shaping in `/Users/akin/Codes/lovie-p2p-request/lib/use-cases/requests/dashboard.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/use-cases/requests/mutations.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/use-cases/requests/presentation.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/request-flow/async-action.ts`, and `/Users/akin/Codes/lovie-p2p-request/lib/request-flow/currency.ts`
- [X] T008 Implement URL query-state parsing and cursor pagination helpers in `/Users/akin/Codes/lovie-p2p-request/lib/request-flow/query-state.ts` and `/Users/akin/Codes/lovie-p2p-request/lib/request-flow/pagination.ts`
- [X] T009 Implement centralized optimistic auth guarding for public and protected request routes in `/Users/akin/Codes/lovie-p2p-request/middleware.ts`, `/Users/akin/Codes/lovie-p2p-request/app/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/sign-in/page.tsx`, and `/Users/akin/Codes/lovie-p2p-request/app/(app)/layout.tsx`
- [X] T010 Implement shared async button, spinner, and inline form-feedback primitives in `/Users/akin/Codes/lovie-p2p-request/components/ui/button.tsx`, `/Users/akin/Codes/lovie-p2p-request/components/ui/dialog.tsx`, and `/Users/akin/Codes/lovie-p2p-request/app/globals.css`
- [X] T011 Bridge the legacy request modules and action imports to the new boundaries in `/Users/akin/Codes/lovie-p2p-request/lib/requests/queries.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/requests/mutations.ts`, `/Users/akin/Codes/lovie-p2p-request/app/actions/requests.ts`, and `/Users/akin/Codes/lovie-p2p-request/lib/auth/current-user.ts`
- [X] T012 [P] Add foundational Vitest coverage for query state, async feedback, auth-guard helpers, and currency/amount boundaries in `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/request-flow/query-state.test.ts`, `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/request-flow/async-action.test.ts`, `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/validation/requests.test.ts`, `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/money/format-amount.test.ts`, and `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/auth/current-user.test.ts`

**Checkpoint**: The repo supports backend-owned currency, the new request-flow module boundaries, middleware redirects, and shared async button/form state before any story-specific UI work begins.

---

## Phase 3: User Story 1 - Dashboards Feel Fast and Actionable (Priority: P1) 🎯 MVP

**Goal**: Make incoming and outgoing dashboards feel instant, card-focused, and append-only without extra filtering steps.

**Independent Test**: Open incoming and outgoing dashboards, change filters without an Apply button, type into search and wait for debounce, load more results via infinite scroll, and use outgoing card actions plus copy-link fallback without leaving the dashboard context.

### Tests for User Story 1

- [X] T013 [P] [US1] Add Playwright coverage for debounced search, instant filters, stale-response discard, infinite scroll, and outgoing card actions in `/Users/akin/Codes/lovie-p2p-request/tests/e2e/request-dashboard-polish.spec.ts`
- [X] T014 [P] [US1] Add Vitest coverage for paginated dashboard use cases and request-card presentation shaping in `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/use-cases/requests/dashboard.test.ts` and `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/request-flow/pagination.test.ts`

### Implementation for User Story 1

- [X] T015 [US1] Implement incremental outgoing and incoming pagination endpoints in `/Users/akin/Codes/lovie-p2p-request/app/api/requests/outgoing/route.ts` and `/Users/akin/Codes/lovie-p2p-request/app/api/requests/incoming/route.ts`
- [X] T016 [US1] Build the debounced dashboard query controller and clear-action behavior in `/Users/akin/Codes/lovie-p2p-request/components/dashboard/dashboard-filters.tsx`, `/Users/akin/Codes/lovie-p2p-request/components/dashboard/outgoing-list.tsx`, and `/Users/akin/Codes/lovie-p2p-request/components/dashboard/incoming-list.tsx`
- [X] T017 [US1] Implement append-only infinite scroll and stale-query reset behavior in `/Users/akin/Codes/lovie-p2p-request/components/dashboard/outgoing-list.tsx`, `/Users/akin/Codes/lovie-p2p-request/components/dashboard/incoming-list.tsx`, and `/Users/akin/Codes/lovie-p2p-request/lib/request-flow/pagination.ts`
- [X] T018 [US1] Move outgoing actions and share-link copy/manual-fallback UI into the request cards in `/Users/akin/Codes/lovie-p2p-request/components/requests/request-card.tsx` and `/Users/akin/Codes/lovie-p2p-request/components/dashboard/outgoing-list.tsx`
- [X] T019 [US1] Remove non-essential explanatory banners and simplify dashboard plus new-request page composition in `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/outgoing/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/incoming/page.tsx`, and `/Users/akin/Codes/lovie-p2p-request/app/(app)/requests/new/page.tsx`
- [X] T020 [US1] Render backend-driven currency consistently across dashboard cards and share-preview surfaces in `/Users/akin/Codes/lovie-p2p-request/components/requests/request-card.tsx`, `/Users/akin/Codes/lovie-p2p-request/components/requests/request-share-summary.tsx`, `/Users/akin/Codes/lovie-p2p-request/components/dashboard/outgoing-list.tsx`, and `/Users/akin/Codes/lovie-p2p-request/components/dashboard/incoming-list.tsx`

**Checkpoint**: The dashboards are card-first, use debounced URL-driven query state, append results through infinite scroll, and expose outgoing request actions without extra banners or redirect-only share flows.

---

## Phase 4: User Story 2 - Request Creation and Payment Feel Safer (Priority: P1)

**Goal**: Add a safer create-and-pay experience through stronger validation, explicit confirmation, copy-aware success dialogs, and consistent loading/error behavior.

**Independent Test**: Create a request, land on the outgoing dashboard dialog, copy or preview the share link, close the dialog without reopening it on refresh, then pay an incoming request through an explicit confirmation step with spinner feedback and non-payable invalidation handling.

### Tests for User Story 2

- [ ] T021 [P] [US2] Update Playwright create/share and resolve coverage for post-create dialog, URL-state clearing, pay confirmation, spinner buttons, max-amount validation, and copy-link fallback in `/Users/akin/Codes/lovie-p2p-request/tests/e2e/request-create-and-share.spec.ts` and `/Users/akin/Codes/lovie-p2p-request/tests/e2e/request-resolve.spec.ts`
- [ ] T022 [P] [US2] Add Vitest coverage for create-request limits, pay invalidation, and shared async feedback state in `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/use-cases/requests/mutations.test.ts`, `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/request-flow/async-action.test.ts`, and `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/validation/requests.test.ts`

### Implementation for User Story 2

- [ ] T023 [US2] Implement the post-create success dialog and dialog-driving URL cleanup in `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/outgoing/page.tsx` and `/Users/akin/Codes/lovie-p2p-request/components/requests/request-created-dialog.tsx`
- [ ] T024 [US2] Implement shared request-form loading, validation, and spinner-button behavior in `/Users/akin/Codes/lovie-p2p-request/components/requests/request-form.tsx`, `/Users/akin/Codes/lovie-p2p-request/lib/requests/create-request-action-state.ts`, `/Users/akin/Codes/lovie-p2p-request/app/actions/requests.ts`, and `/Users/akin/Codes/lovie-p2p-request/components/ui/button.tsx`
- [ ] T025 [US2] Implement pay confirmation dialog and non-payable invalidation handling in `/Users/akin/Codes/lovie-p2p-request/components/requests/request-actions.tsx`, `/Users/akin/Codes/lovie-p2p-request/components/requests/request-detail.tsx`, and `/Users/akin/Codes/lovie-p2p-request/app/actions/requests.ts`
- [ ] T026 [US2] Standardize copy-link fallback and backend-currency display across post-create and detail flows in `/Users/akin/Codes/lovie-p2p-request/components/requests/request-created-dialog.tsx`, `/Users/akin/Codes/lovie-p2p-request/components/requests/request-detail.tsx`, `/Users/akin/Codes/lovie-p2p-request/components/requests/request-share-summary.tsx`, and `/Users/akin/Codes/lovie-p2p-request/lib/money/format-amount.ts`

**Checkpoint**: Request creation and payment now use one consistent async feedback pattern, explicit confirmation, max-amount protection, and a dialog-first share flow that stays stable across refresh and back navigation.

---

## Phase 5: User Story 3 - The Request Flow Is Easier to Maintain Safely (Priority: P2)

**Goal**: Complete the refactor to thin page composition, centralized auth guarding, and durable request-flow boundaries without breaking lifecycle behavior.

**Independent Test**: Open protected routes while signed out to verify middleware redirects, then re-run the key sender and recipient flows to confirm the refactor preserves lifecycle behavior and request data remains routed through the new data-access/use-case boundaries.

### Tests for User Story 3

- [ ] T027 [P] [US3] Add Playwright coverage for auth-guard redirects and request-flow regression after the refactor in `/Users/akin/Codes/lovie-p2p-request/tests/e2e/request-auth-and-regression.spec.ts`
- [ ] T028 [P] [US3] Add Vitest coverage for data-access/use-case boundaries and preserved lifecycle behavior in `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/data-access/payment-requests.test.ts`, `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/use-cases/requests/presentation.test.ts`, `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/requests/status.test.ts`, and `/Users/akin/Codes/lovie-p2p-request/tests/unit/lib/requests/expiry.test.ts`

### Implementation for User Story 3

- [ ] T029 [US3] Migrate dashboard and detail reads to thin page composition over the use-case layer in `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/outgoing/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/incoming/page.tsx`, and `/Users/akin/Codes/lovie-p2p-request/app/(app)/requests/[requestId]/page.tsx`
- [ ] T030 [US3] Migrate request mutations and pagination route handlers to the new data-access/use-case boundaries in `/Users/akin/Codes/lovie-p2p-request/app/actions/requests.ts`, `/Users/akin/Codes/lovie-p2p-request/app/api/requests/outgoing/route.ts`, `/Users/akin/Codes/lovie-p2p-request/app/api/requests/incoming/route.ts`, `/Users/akin/Codes/lovie-p2p-request/lib/use-cases/requests/mutations.ts`, and `/Users/akin/Codes/lovie-p2p-request/lib/data-access/payment-requests.ts`
- [ ] T031 [US3] Centralize protected-route behavior and authenticated navigation expectations in `/Users/akin/Codes/lovie-p2p-request/middleware.ts`, `/Users/akin/Codes/lovie-p2p-request/app/(app)/layout.tsx`, and `/Users/akin/Codes/lovie-p2p-request/components/dashboard/dashboard-nav.tsx`
- [ ] T032 [US3] Align request-flow client components with React best-practice boundaries and primitive-reuse rules in `/Users/akin/Codes/lovie-p2p-request/components/dashboard/dashboard-filters.tsx`, `/Users/akin/Codes/lovie-p2p-request/components/requests/request-actions.tsx`, `/Users/akin/Codes/lovie-p2p-request/components/requests/request-created-dialog.tsx`, and `/Users/akin/Codes/lovie-p2p-request/components/ui/dialog.tsx`

**Checkpoint**: Middleware owns optimistic route protection, request data flows through the new boundaries, and the refactored code stays reviewer-friendly without regressing the user-visible behavior.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize responsiveness, documentation, and reviewer confidence across the full polish feature.

- [ ] T033 [P] Audit responsive layouts plus shared spinner/error consistency across polished request routes in `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/outgoing/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/(app)/dashboard/incoming/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/(app)/requests/new/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/app/(app)/requests/[requestId]/page.tsx`, `/Users/akin/Codes/lovie-p2p-request/components/requests/request-form.tsx`, and `/Users/akin/Codes/lovie-p2p-request/components/requests/request-actions.tsx`
- [ ] T034 [P] Update reviewer documentation and quickstart guidance for the polish flows in `/Users/akin/Codes/lovie-p2p-request/README.md` and `/Users/akin/Codes/lovie-p2p-request/specs/002-request-flow-polish/quickstart.md`
- [ ] T035 Run the full quickstart validation and record final Playwright story-plus-edge-case reviewer notes in `/Users/akin/Codes/lovie-p2p-request/specs/002-request-flow-polish/quickstart.md` and `/Users/akin/Codes/lovie-p2p-request/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; produces the first polished vertical slice.
- **User Story 2 (Phase 4)**: Depends on Foundational and benefits from the outgoing/dashboard foundation from US1.
- **User Story 3 (Phase 5)**: Depends on Foundational and should land after US1 and US2 because it refactors the paths they exercise.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: First MVP slice for this feature; no story dependency.
- **User Story 2 (P1)**: Depends on the outgoing/dashboard polish from US1 for the post-create dialog destination and shared async feedback patterns.
- **User Story 3 (P2)**: Depends on US1 and US2 so the refactor can preserve the completed polished behaviors instead of chasing moving targets.

### Within Each User Story

- Write the Playwright and Vitest coverage before or alongside the implementation tasks for that story.
- Keep shared Radix-backed primitives and request-flow helper layers authoritative; do not fork duplicate primitive components.
- Implement data-access and use-case logic before final page wiring.
- Revalidate routes immediately after any state-changing action.
- Keep async button spinner and inline error behavior consistent across every touched flow.

### Parallel Opportunities

- T002 and T003 can run in parallel after T001.
- T005, T006, and T012 can run in parallel after T004.
- T013 and T014 can run in parallel at the start of US1.
- T021 and T022 can run in parallel at the start of US2.
- T027 and T028 can run in parallel at the start of US3.
- T033 and T034 can run in parallel after implementation stabilizes.

---

## Parallel Example: User Story 1

```bash
# Launch dashboard polish tests together:
Task: "Add Playwright dashboard polish coverage in tests/e2e/request-dashboard-polish.spec.ts"
Task: "Add Vitest dashboard coverage in tests/unit/lib/use-cases/requests/dashboard.test.ts and tests/unit/lib/request-flow/pagination.test.ts"

# Then split dashboard implementation across separate concerns:
Task: "Implement pagination endpoints in app/api/requests/outgoing/route.ts and app/api/requests/incoming/route.ts"
Task: "Update outgoing card actions and copy fallback in components/requests/request-card.tsx and components/dashboard/outgoing-list.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch safer create/pay tests together:
Task: "Update Playwright create/share and resolve coverage in tests/e2e/request-create-and-share.spec.ts and tests/e2e/request-resolve.spec.ts"
Task: "Add Vitest mutation and async feedback coverage in tests/unit/lib/use-cases/requests/mutations.test.ts and tests/unit/lib/request-flow/async-action.test.ts"

# Then split create and pay UI work:
Task: "Implement post-create dialog flow in app/(app)/dashboard/outgoing/page.tsx and components/requests/request-created-dialog.tsx"
Task: "Implement pay confirmation dialog flow in components/requests/request-actions.tsx and components/requests/request-detail.tsx"
```

## Parallel Example: User Story 3

```bash
# Launch refactor-safety tests together:
Task: "Add Playwright auth guard regression coverage in tests/e2e/request-auth-and-regression.spec.ts"
Task: "Add Vitest boundary coverage in tests/unit/lib/data-access/payment-requests.test.ts and tests/unit/lib/use-cases/requests/presentation.test.ts"

# Then split refactor ownership:
Task: "Migrate read composition in app/(app)/dashboard/outgoing/page.tsx, app/(app)/dashboard/incoming/page.tsx, and app/(app)/requests/[requestId]/page.tsx"
Task: "Migrate action and route-handler orchestration in app/actions/requests.ts, app/api/requests/outgoing/route.ts, and app/api/requests/incoming/route.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate debounced query behavior, infinite scroll, outgoing card actions, and copy fallback with Playwright video.
5. If needed, demo the polished dashboard slice before moving to request-create/pay changes.

### Incremental Delivery

1. Setup + Foundational establish the refactor boundaries, middleware, currency support, and shared async UI rules.
2. User Story 1 delivers the card-first dashboard experience.
3. User Story 2 adds safer creation and payment flows with consistent loading/error behavior.
4. User Story 3 lands the maintainability refactor and route-guard cleanup without regressing the earlier slices.
5. Phase 6 finalizes reviewer docs, responsiveness, and full quickstart validation.

### Single-Developer Strategy

1. Keep one active phase at a time to minimize context switching.
2. Finish each shared layer before wiring it into multiple pages.
3. Use Playwright video plus the new Vitest boundary coverage as the main regression safety net.
4. Stop at each checkpoint and confirm the story works independently before moving forward.

## Notes

- All tasks follow the required checklist format with IDs, labels, and file paths.
- The task list preserves the existing Next.js monolith and avoids introducing TanStack Query, a separate backend service, or duplicate primitive UI layers.
- User Story 1 is the suggested MVP scope for this feature.
- Playwright video evidence covers both user stories and the highest-risk edge cases, not only the happy path.
