# Implementation Plan: Request Flow Polish

**Branch**: `002-request-flow-polish` | **Date**: 2026-04-10 | **Spec**: `/Users/akin/Codes/lovie-p2p-request/specs/002-request-flow-polish/spec.md`
**Input**: Feature specification from `/specs/002-request-flow-polish/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Polish the existing P2P request experience by removing dashboard friction,
adding append-only infinite scroll, surfacing share/cancel/detail actions
directly inside outgoing cards, requiring pay confirmation, improving create
request validation, and presenting backend-driven currency consistently across
the UI. Preserve the existing lifecycle rules and monolithic Next.js approach
while reorganizing request logic into clear `data-access` and `use-cases`
boundaries and moving optimistic auth redirects into a centralized middleware
guard. Implementation must reuse the existing Radix-backed shadcn/ui primitive
layer, follow modern React component best practices, standardize async loading
and error states across forms and buttons, and expand Playwright coverage to
both user stories and edge cases.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x on Node.js LTS  
**Primary Dependencies**: Next.js App Router, React 19, Drizzle ORM, postgres-js, Neon PostgreSQL, Zod, Tailwind CSS, shadcn/ui with Radix-backed primitives, direct Radix primitives where needed, Playwright  
**Storage**: Neon PostgreSQL accessed through Drizzle ORM with postgres-js  
**Testing**: Playwright E2E with video recording for user stories plus high-risk edge cases; Vitest for domain, query-state, validation, auth guard, and async UI-state coverage  
**Target Platform**: Public Vercel-hosted web application for modern mobile and desktop browsers
**Project Type**: Single-repo monolithic Next.js web app  
**Performance Goals**: Search and filter feel immediate after one interaction; infinite scroll appends the next request stack without full-page disruption; simulated pay retains the existing 2-3 second delay after confirmation  
**Constraints**: Integer-cents money handling, backend-driven currency display, mock email auth, centralized optimistic auth guard plus server-side authorization, responsive card-based UX, request max amount of 50,000 major units, preserve existing lifecycle rules, reuse Radix-backed UI primitives instead of duplicate primitive components, consistent loading/error handling with spinner buttons for async actions, React best-practice component patterns  
**Scale/Scope**: Interview-focused enhancement of the existing request flow for low-volume demo usage with paginated dashboards, confirmation dialogs, and maintainable request-flow boundaries

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Scope stays tightly aligned to the take-home P2P request assignment; any extra feature
  must be explicitly justified.
- All monetary values are modeled and tested as integer cents; no float-based money handling
  is allowed.
- Authentication remains intentionally simple unless the spec proves additional complexity is
  required; mock email auth is acceptable.
- The planned UX covers both mobile and desktop for every critical flow.
- Critical flows include Playwright end-to-end coverage and automated video recording.
- Architecture choices favor simple, testable design over clever or speculative abstractions.

Pre-research check: PASS.

- PASS: All requested polish items improve the assignment's core request flow
  or reviewer clarity.
- PASS: Money remains integer-cents only; the new 50,000 maximum rule is
  expressed at validation boundaries while storage stays in cents.
- PASS: Authentication stays intentionally simple; the new middleware guard is
  an organizational improvement, not an auth-system expansion.
- PASS: Mobile and desktop behavior remain explicit for dashboards, dialogs,
  and request flows.
- PASS: Playwright remains the browser truth source for all critical UX
  changes.
- PASS: The new data-access/use-case split is justified by current repo
  readability issues and stays bounded to the request flow.
- PASS: Reusing the existing Radix/shadcn primitive layer keeps the UI
  accessible and avoids unnecessary component proliferation.

## Project Structure

### Documentation (this feature)

```text
specs/002-request-flow-polish/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/
├── layout.tsx
├── page.tsx
├── sign-in/page.tsx
├── (app)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   ├── outgoing/page.tsx
│   │   └── incoming/page.tsx
│   └── requests/
│       ├── new/page.tsx
│       └── [requestId]/page.tsx
├── api/
│   └── requests/
│       ├── outgoing/route.ts
│       └── incoming/route.ts
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
├── data-access/
│   ├── payment-requests.ts
│   └── users.ts
├── use-cases/
│   └── requests/
├── money/
├── validation/
├── request-flow/
│   ├── pagination.ts
│   ├── query-state.ts
│   └── currency.ts
└── utils.ts

drizzle/
├── schema.ts
└── seed.ts

middleware.ts

tests/
├── e2e/
└── unit/
```

**Structure Decision**: Keep the existing single Next.js codebase, but make the
request flow easier to reason about by separating persistence operations into
`lib/data-access/*`, higher-level request orchestration into
`lib/use-cases/requests/*`, and shared query-state or currency helpers into
`lib/request-flow/*`. Keep pages and components focused on rendering and user
interaction. Add a small `middleware.ts` guard for optimistic signed-in route
checks, and add narrowly scoped internal API route handlers only for
incremental dashboard pagination. Product-specific components may compose the
existing `components/ui/*` Radix-backed primitives, but this feature should not
introduce duplicate primitive component layers for dialogs, buttons, inputs, or
similar controls.

## Complexity Tracking

No constitution violations are expected for this feature.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Architecture Decisions

### 1. Preserve the monolith and refactor within it

- Keep the App Router monolith, existing Drizzle schema, and Server Action
  mutation pattern from `001`.
- Refactor only the request-flow internals that are currently difficult to
  follow.
- Avoid introducing a separate backend service, shared package workspace, or
  new auth provider.

### 2. Use middleware for optimistic route protection, but keep secure checks near data

- Add a centralized middleware guard that only reads the signed session cookie
  and redirects public versus protected routes.
- Keep authorization checks inside request use cases and Server Actions so the
  middleware is not the only line of defense.
- This follows current Next.js auth guidance that middleware/proxy-style guards
  are suitable for optimistic checks, while data access remains protected
  closer to the source.

### 3. Keep URL-driven dashboard state and layer client-side control on top

- Continue using URL query params for `q` and `status` so dashboards remain
  reload-safe and easy to share.
- Add a client-side controller that debounces search input, immediately applies
  filter changes, and enables a clear control only when active query state
  exists.
- Replace the current submit-driven filtering pattern with one interaction per
  filter change.

### 4. Add append-only infinite scroll through small internal pagination endpoints

- Render the first dashboard page on the server as before.
- Fetch additional outgoing or incoming pages through small internal route
  handlers that return paginated request slices plus the next cursor.
- Use cursor-based pagination ordered by `createdAt desc, id desc` to avoid
  duplicates or skipped rows during incremental loads.

### 5. Persist currency on the request record and format from backend data

- Add a backend-owned currency field to the request shape so every rendered
  amount comes from persisted or returned backend data rather than a hardcoded
  UI assumption.
- Continue storing money as integer cents.
- Keep currency conversion out of scope; formatting only reflects the request's
  own currency.

### 6. Use controlled dialogs for pay confirmation and post-create success

- Add a confirmation dialog before pay processing begins.
- Replace the current post-create banner with a focused dialog on the outgoing
  dashboard that exposes `Preview` and `Copy link`.
- Use Radix Dialog primitives because they already fit the current shadcn/Radix
  component approach and provide accessible modal behavior.

### 7. Standardize async form and button states

- Use one shared request-flow pattern for async button loading, disabled state,
  validation messages, and inline action errors.
- Every async request-flow button shows a visible spinner while pending.
- Create, pay, decline, cancel, and copy-link flows should present errors and
  pending state consistently so user and test expectations stay aligned.

### 8. Follow modern React component practices during the refactor

- Prefer small focused function components with explicit props.
- Keep derived state in render or helper functions when possible instead of
  synchronizing through effects.
- Avoid unnecessary `useEffect`, prop-mirroring state, and custom wrapper
  abstractions that duplicate existing UI primitives.

### 9. Reduce non-essential copy and surface actions closer to cards

- Remove decorative or technical explanation banners from incoming, outgoing,
  and new request screens.
- Keep card layouts focused on the actions a reviewer actually needs to test.
- Move outgoing actions and share-link copy affordances directly into each card.

### 10. Treat Playwright as story and edge-case proof

- Add browser coverage for each affected user story, not just the happy path.
- Explicitly cover stale-pagination reset behavior, duplicate-click prevention,
  pay-confirmation invalidation, clipboard failure fallback, auth-guard
  redirects, and max-amount validation.
- Keep videos enabled so the full polish pass remains reviewer-ready.

## Phase 0 Research Output

- Research completed in
  `/Users/akin/Codes/lovie-p2p-request/specs/002-request-flow-polish/research.md`
- All planning unknowns are resolved without expanding assignment scope.

## Phase 1 Design Output

- Data model delta documented in
  `/Users/akin/Codes/lovie-p2p-request/specs/002-request-flow-polish/data-model.md`
- Route and interaction contract documented in
  `/Users/akin/Codes/lovie-p2p-request/specs/002-request-flow-polish/contracts/web-routes-and-interactions.md`
- Validation and reviewer flow documented in
  `/Users/akin/Codes/lovie-p2p-request/specs/002-request-flow-polish/quickstart.md`

Post-design constitution re-check: PASS.

- PASS: The feature remains within assignment scope and does not introduce
  unrelated product areas.
- PASS: Currency and max amount rules preserve integer-cent correctness.
- PASS: Middleware adds clarity but does not replace server-side security
  checks.
- PASS: Infinite scroll, dialogs, and card actions are specified for both
  mobile and desktop.
- PASS: Playwright coverage remains required for every affected critical flow.
- PASS: The data-access/use-case split is bounded and reviewer-friendly rather
  than speculative platform engineering.
