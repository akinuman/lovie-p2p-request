# Feature Specification: Request Flow Polish

**Feature Branch**: `002-request-flow-polish`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "In this spec we will polish our existing request flow features we will update existing solutions and we will add missing parts.

- Current search and filter logic need to change I don't want apply button for extra user step. It will be working when user select any filter proceed the filter. For searching from the bar with text it need to works with bouncing when user stop typing it will filter the results. It will have one button search but it will delete the existing search text. We can show clear button but it will be active when there is some searched or filtered items in there.
- We don't need extra explanation banners in outgoing , incoming , and new request page there will be only cards.
- View detail, Preview share page, and cancel request button will be part of card in outgoing dashaboard.
- Ongoing page there is Share link section but we direct user to preview page. We need to change this with sharable link with copy to clipboard functonalituny. It will not redirect preview page we have already this button.
- Both in incoming and oitgoing pages need endless scroll but with fetching logic. We user scroll down to page it will load next stack .
- We need extra step for Pay action in incoming request page. It need to pop-up and make sure user really want to send a payment.
- New request created it redirect user to outgoing page in there we should see the request with dialog you can use radix dialog for that. We are showing the link and there is one button redicrt user to preview page it need to stay but name should be preview. We need to add copy to clipboard button as well there. When user close the dialog it will see updated cards in there.
- We need to improve the validation new request user can send maximum 50000.
- Currency should come from backend and in the UI we should handle with that.
- \"We normalize email to lowercase and phone numbers to E.164-style `+1...` values for matching.\" we do not need this type of explnation in our app generally need to gone.
- We need to split the logic in our folder structure is mess right now. We can split them to data-access and use-case folders. For example data-access folder will be only created with tables names and we will use it this tables only for crud operations like update delete fetch data etc. But busuniess logic will be sepreated in use-case folder with business logic and their helper functions can come from libs .
- For persistent signed-in logics we solve them inside pages this is not good appraoch we need to handle them in middleware."

## Clarifications

### Session 2026-04-10

- Q: How should currency be chosen for new requests in this polish pass? → A: Every new request uses one backend-configured default currency, and the UI only displays what the backend returns.
- Q: What should happen to older in-flight infinite-scroll responses when search or filters change? → A: Reset the list to page 1 and ignore any older in-flight pagination responses.
- Q: What should happen if a request expires or changes state before final pay confirmation completes? → A: Close or update the dialog and show the latest non-payable state with no charge attempt.
- Q: What should happen to the post-create dialog state after the user closes it? → A: Closing the dialog should clear the dialog-driving URL state so refresh or back does not reopen it.
- Q: What should happen if copying a share link fails? → A: Show inline error feedback and keep the share URL visible so the user can copy it manually.

### Session 2026-04-11

- Q: What is the exact maximum request amount for this feature? → A: A new request may be at most `50,000.00` in the backend-configured major currency, which maps to `5,000,000` integer cents in storage; `50,000.00` is allowed and any higher value is rejected.
- Q: Is this feature USD-only or multi-currency? → A: This polish pass is single-currency per environment. The backend provides one default currency for new requests, and the current demo configuration is USD unless backend configuration changes it. User-selected currencies, FX rates, and conversion logic are out of scope.
- Q: Are rate limiting, fraud controls, and abuse prevention part of this polish pass? → A: Only duplicate in-flight submission prevention is in scope for this take-home. Broader rate limiting, fraud review, audit controls, and abuse monitoring are acknowledged as production requirements but explicitly out of scope here.
- Q: What accessibility baseline applies to the polished request flow? → A: The critical request flows must be keyboard accessible, preserve visible focus, use semantic controls and dialog focus management, expose validation and action feedback to assistive technology, and remain usable on mobile and desktop.
- Q: Does the simulated pay flow require production-grade transactional guarantees? → A: The demo must re-check that a request is still payable immediately before marking it paid, but full real-money protections such as row locking, idempotency keys, ledgering, and settlement-grade transaction handling are acknowledged as production requirements and are out of scope for this take-home simulation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dashboards Feel Fast and Actionable (Priority: P1)

As a sender or recipient, I want the request dashboards to react immediately to
searching, filtering, scrolling, and card actions so I can manage requests
without extra steps or distracting copy.

**Why this priority**: The dashboards are the primary working surface for the
assignment. Reducing friction there improves the clearest reviewer-visible
experience.

**Independent Test**: Can be fully tested by opening incoming and outgoing
dashboards, applying status filters without an Apply button, typing into search
and waiting for debounced results, loading additional records via infinite
scroll, copying a share link from an outgoing card, and confirming the UI stays
card-focused on both mobile and desktop. Critical flow Playwright coverage must
record the run.

**Acceptance Scenarios**:

1. **Given** a user is on an incoming or outgoing dashboard, **When** they
   change a status filter, **Then** the list updates automatically without a
   separate Apply action.
2. **Given** a user is typing in dashboard search, **When** they stop typing
   briefly, **Then** the search runs automatically and shows matching results
   without requiring manual submission.
3. **Given** a user has active search text or filters, **When** they use the
   clear control, **Then** all active query state is removed and the default
   list returns.
4. **Given** a user reaches the bottom of a dashboard list, **When** more
   requests exist, **Then** the next page of results loads and appends without
   replacing the existing cards.
5. **Given** a dashboard search or filter changes while an older page request
   is still loading, **When** the new query state takes effect, **Then** the
   list resets to the first page for the new query and stale earlier responses
   are ignored.
6. **Given** a sender views an outgoing request card, **When** they need to act
   on it, **Then** `View details`, `Preview`, `Cancel` when pending, and share
   link copy functionality are available directly from the card.
7. **Given** a user visits the incoming, outgoing, or new request screens,
   **When** the page loads, **Then** the experience is composed from actionable
   cards only and does not show extra explanatory banners or technical
   implementation text.

---

### User Story 2 - Request Creation and Payment Feel Safer (Priority: P1)

As a sender or recipient, I want clearer confirmation, validation, and sharing
steps around creating and paying requests so I feel confident before money
actions complete.

**Why this priority**: This directly affects the core money flow and the trust
worthiness of the demo.

**Independent Test**: Can be fully tested by creating a request at valid and
invalid amounts, confirming that requests over 50,000 major currency units are
blocked, verifying the post-create dialog on the outgoing dashboard, copying
the generated share link, previewing the share page, and confirming that paying
an incoming request requires a confirmation step before processing. Critical
flow Playwright coverage must record the run.

**Acceptance Scenarios**:

1. **Given** a sender submits a new request, **When** creation succeeds,
   **Then** they are redirected to the outgoing dashboard and shown a dialog for
   the newly created request with `Preview` and `Copy link` actions.
2. **Given** the sender closes that dialog, **When** they return to the
   dashboard, **Then** the new request is visible in the updated outgoing list
   and the dialog-driving URL state is cleared so refresh or back does not
   reopen it.
3. **Given** a sender enters an amount greater than 50,000 major currency
   units, **When** they attempt to submit, **Then** the form blocks submission
   and shows clear validation feedback.
4. **Given** a recipient chooses to pay an incoming request, **When** they tap
   `Pay`, **Then** a confirmation dialog asks them to confirm before payment
   processing begins.
5. **Given** the backend provides currency information for a request, **When**
   the request is shown anywhere in the product, **Then** the amount is
   rendered using that backend-provided currency rather than a hardcoded UI
   assumption.
6. **Given** a request expires or changes to a non-payable state while the pay
   confirmation dialog is open, **When** the recipient attempts to continue,
   **Then** the dialog closes or updates to the latest terminal state and no
   payment attempt starts.
7. **Given** two pay attempts race against the same pending request, **When**
   the later attempt reaches final confirmation after the request has already
   transitioned away from `Pending`, **Then** the second attempt is rejected
   and the UI reflects the latest request state rather than showing a second
   success outcome.
8. **Given** a user tries to copy a share link from a card or dialog,
   **When** clipboard access fails, **Then** the UI shows inline error feedback
   and keeps the share URL visible for manual copying without forcing
   navigation.
9. **Given** a user submits or confirms any asynchronous request-flow action,
   **When** the action is pending, **Then** the relevant button shows a loading
   spinner, prevents duplicate submission, and uses the same loading and error
   handling pattern as the other request-flow forms and actions.

---

### User Story 3 - The Request Flow Is Easier to Maintain Safely (Priority: P2)

As a teammate maintaining the assignment, I want request data access,
business-rule orchestration, and auth guarding to have clearer boundaries so we
can keep polishing the feature without breaking lifecycle behavior.

**Why this priority**: This work supports the current polish pass and future
iteration quality, but it depends on preserving the visible request experience.

**Independent Test**: Can be tested by verifying that authentication gating is
handled before protected pages render, that request lifecycle behavior still
matches the existing assignment rules after the refactor, and that critical
flows continue to pass browser and unit coverage.

**Acceptance Scenarios**:

1. **Given** a user is not signed in, **When** they try to access a protected
   request route, **Then** the app redirects them through centralized auth
   guarding before the page logic runs.
2. **Given** the request flow performs reads and writes, **When** the app
   fetches or mutates request data, **Then** raw persistence access and business
   logic responsibilities remain separated into distinct modules.
3. **Given** the codebase is reorganized for this feature, **When** a reviewer
   inspects the request-flow implementation, **Then** data operations,
   use-case-level orchestration, and shared helpers are grouped consistently and
   remain easy to trace.

## Edge Cases

- A user types quickly into search and navigates away before the debounce window
  completes.
- A dashboard filter is changed while an infinite-scroll fetch is already in
  flight.
- An older infinite-scroll response resolves after the user has already changed
  search text or filter state.
- A user clears search or filters after multiple paginated result pages have
  already loaded.
- A copy-link action is triggered when clipboard access is unavailable.
- A copy-link action fails in a browser that denies clipboard permission, and
  the user still needs manual access to the share URL.
- A request is created successfully but the post-create dialog is dismissed
  immediately on mobile.
- The user closes the post-create dialog and then refreshes or navigates back
  to the outgoing dashboard.
- A user attempts to submit `50000.00`, `50000.01`, `0`, a negative amount, or
  an invalid amount format on the new request form.
- A user clicks the same async action multiple times while the button is still
  loading.
- A recipient opens the pay confirmation dialog for a request that becomes
  expired before final confirmation.
- A request is paid, declined, cancelled, or expired by another action while
  the pay confirmation dialog is still open.
- Two recipients, browser tabs, or repeated network submissions attempt to pay
  the same pending request at nearly the same time.
- The backend sends a currency code for a request that the UI has not shown
  before.
- A keyboard-only user needs to create a request, close the post-create dialog,
  copy the share link, and confirm a payment without using a pointer.
- A screen-reader user needs validation, loading, copy-error, and pay-confirm
  feedback announced in a way that matches the visible UI state.
- A user or automated script attempts repeated rapid submissions; duplicate
  in-flight actions must be blocked, while broader server-side rate limiting is
  acknowledged as out of scope for this take-home pass.
- Middleware redirects an unauthenticated user who tries to access a protected
  dashboard or request detail route via a deep link.

## Requirements *(mandatory)*

### Money Handling *(critical)*

Money representation is a primary correctness constraint for this feature, not a
minor implementation detail. Any implementation of this spec must treat money
handling as a first-class design concern.

- All monetary values MUST be stored, validated, transmitted through business
  logic, and asserted in tests as integer cents rather than floating-point
  values.
- The maximum new-request amount for this assignment is `50,000.00` in the
  backend-configured major currency, which maps to `5,000,000` integer cents.
- Currency display is backend-driven. In this polish pass, the current demo
  environment uses a single backend-configured default currency of USD unless
  configuration changes it.
- Human-readable currency formatting MUST happen only at the presentation
  boundary. Parsing, validation, persistence, lifecycle rules, and comparisons
  MUST use cents-based values.

### Functional Requirements

- **FR-001**: The system MUST automatically apply dashboard status filters when
  a user changes them, without requiring a separate Apply action.
- **FR-002**: The system MUST debounce dashboard text search so the request
  list updates automatically after the user pauses typing.
- **FR-003**: The system MUST provide a clear control for dashboard search and
  filtering that is only actionable when any search text or filter is active.
- **FR-004**: The system MUST preserve search and filter state in a way that
  keeps incoming and outgoing dashboards shareable and reload-safe.
- **FR-005**: The system MUST support incremental loading on incoming and
  outgoing dashboards so additional request cards load as the user scrolls.
- **FR-005a**: When dashboard query state changes, the system MUST reset the
  visible list to the first page for the new query and MUST discard stale
  in-flight pagination responses from older query state.
- **FR-006**: The outgoing request card MUST expose `View details`, `Preview`,
  and `Cancel` when the request is pending, without forcing the user into a
  separate banner-based action area.
- **FR-007**: The outgoing dashboard MUST allow a sender to copy a shareable
  request link directly from the request card.
- **FR-007a**: If clipboard copy fails from a request card or post-create
  dialog, the system MUST show inline feedback and keep the share URL visible
  for manual copying.
- **FR-008**: After successful request creation, the system MUST redirect the
  sender to the outgoing dashboard and display a dialog focused on the newly
  created request.
- **FR-009**: The post-create dialog MUST include `Preview` and `Copy link`
  actions and MUST allow the sender to close the dialog and continue browsing
  the refreshed outgoing list.
- **FR-009a**: Closing the post-create dialog MUST clear the dialog-driving URL
  state so dismissed success state does not reopen on refresh or backward
  navigation.
- **FR-010**: The system MUST require confirmation before starting payment
  processing for an incoming request.
- **FR-010a**: If a request becomes non-payable before final confirmation is
  completed, the system MUST stop the pay flow, surface the latest request
  state, and MUST NOT start a payment attempt.
- **FR-010b**: The simulated pay flow MUST re-read or conditionally validate
  the latest request state immediately before applying a `Paid` transition so a
  stale client cannot mark a request paid after it has already moved to a
  non-payable state.
- **FR-011**: The system MUST validate that a new request amount does not
  exceed `50,000.00` in the backend-configured major currency before creation.
  This limit maps to `5,000,000` integer cents in storage, `50,000.00` is
  allowed, and any value above that threshold MUST be rejected before the
  request is created.
- **FR-012**: The system MUST obtain currency information for requests from the
  backend data source and MUST render request amounts using that backend-driven
  currency in every list, detail, dialog, and share-related view. In this
  polish pass, new requests MUST use a single backend-configured default
  currency rather than user-selected or UI-inferred currency. For the current
  demo environment, that default currency is USD unless backend configuration
  changes it; multi-currency selection, exchange rates, and conversion logic
  are out of scope.
- **FR-013**: The incoming, outgoing, and new request screens MUST remove
  non-essential explanatory banners and technical implementation copy that does
  not help the user complete the flow.
- **FR-013a**: Request-flow forms and asynchronous actions MUST use a shared
  loading and error-handling pattern so button disabled state, spinner
  presentation, validation feedback, and inline action errors remain
  consistent across create, pay, decline, cancel, and copy-link flows.
- **FR-013b**: Any asynchronous request-flow button MUST show a visible spinner
  during loading and MUST block duplicate submission until the action resolves.
- **FR-013c**: Interactive UI primitives in this feature MUST reuse the
  existing Radix-backed shadcn/ui components or direct Radix primitives rather
  than introducing duplicate custom primitive components for dialogs, buttons,
  form controls, or similar building blocks.
- **FR-013d**: Critical request-flow interactions MUST meet an explicit
  accessibility baseline: form fields require programmatically associated
  labels, validation errors must be exposed with accessible semantics, dialogs
  must manage focus correctly, and interactive controls must remain usable via
  keyboard only.
- **FR-013e**: Visible loading, success, and inline error states for create,
  pay, decline, cancel, and copy-link actions MUST be understandable to both
  sighted users and assistive-technology users.
- **FR-014**: Protected request routes and dashboards MUST use centralized auth
  guarding before page-specific logic executes.
- **FR-015**: The request-flow codebase MUST separate raw request persistence
  operations from request use-case orchestration so data access and business
  rules are not mixed in the same modules.
- **FR-016**: The refactored request flow MUST preserve the existing lifecycle
  rules for `Pending`, `Paid`, `Declined`, `Cancelled`, and `Expired` requests.
- **FR-017**: Any monetary value in the feature MUST be represented and
  asserted as integer cents, with display formatting applied only at the
  presentation boundary. This requirement is intentionally elevated in the
  `Money Handling` section above because it is a core fintech correctness rule.
- **FR-018**: Critical flows in this enhancement MUST work on both mobile and
  desktop layouts, including dashboards, create request, confirmation dialogs,
  and post-create dialog behavior.
- **FR-019**: Simple/mock email authentication MAY continue to be used for this
  take-home as long as the centralized guard behavior remains clear.
- **FR-020**: Requirements for this enhancement MUST stay aligned to the P2P
  payment request assignment and MUST not introduce unrelated product scope.
- **FR-020a**: This take-home polish pass MUST prevent accidental duplicate
  client-side submissions for in-flight request actions, but comprehensive
  fintech controls such as server-side rate limiting, fraud detection, abuse
  monitoring, transaction velocity checks, and full audit workflows are
  acknowledged as necessary production concerns and are explicitly out of scope
  for this assignment.
- **FR-020b**: This feature's `Pay` action is a payment-fulfillment simulation
  for the assignment, not a real settlement system. Production-grade
  transactional guarantees such as row-level locking, atomic compare-and-set
  updates, idempotency enforcement, double-spend protection, and ledger-backed
  reconciliation are acknowledged as required before any real-money launch, but
  are outside the scope of this take-home implementation.

### Key Entities *(include if feature involves data)*

- **PaymentRequestListView**: Represents the paginated incoming or outgoing
  request list shown on dashboards, including active query state, cursor or page
  position, and the request cards currently displayed.
- **RequestSharePresentation**: Represents the backend-driven share link and
  currency-aware summary information surfaced on outgoing cards and in the
  post-create dialog.
- **MonetaryRequestConstraint**: Represents the backend-driven currency and the
  exact request amount boundary enforced for new requests, including integer-
  cents storage and the `50,000.00` major-unit cap for this assignment.
- **PaymentConfirmationState**: Represents the recipient confirmation step
  between choosing `Pay` and starting simulated payment processing.
- **RequestFlowAccessBoundary**: Represents the separation between raw request
  persistence operations and higher-level request use cases that enforce
  lifecycle and auth rules.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Reviewers can filter or search either dashboard without an Apply
  button and see updated results after a single interaction.
- **SC-002**: Reviewers can copy a share link from the outgoing dashboard and
  from the post-create dialog without losing their place in the flow.
- **SC-003**: Reviewers can create a request, land on the outgoing dashboard,
  and use the resulting dialog to preview or copy the share link in under 30
  seconds.
- **SC-004**: Reviewers can complete the pay flow with an explicit confirmation
  step and without ambiguous status transitions.
- **SC-005**: Each critical flow affected by this enhancement is covered by
  passing Playwright end-to-end tests with video artifacts available for review.
- **SC-005a**: Playwright coverage for this enhancement includes both the main
  user stories and the highest-risk edge cases, including stale pagination,
  pay-confirmation invalidation, copy-link failure fallback, duplicate-click
  protection, and max-amount validation.
- **SC-006**: The polished request experience remains usable on both mobile and
  desktop without layout breakage, hidden actions, or ambiguous money display.
- **SC-007**: The request-flow refactor preserves lifecycle correctness while
  making data access, use-case orchestration, and auth guarding easier to trace
  in code review.
- **SC-008**: Reviewers can verify from the spec and the product behavior that
  `50,000.00` is the allowed maximum request amount, values above it are
  rejected, and internal money handling remains cents-based.
- **SC-009**: Reviewers can verify from the spec and the UI that the current
  demo flow is backend-driven single-currency behavior, with USD as the default
  environment currency unless configured otherwise.
- **SC-010**: Reviewers can complete the critical create, copy-link, dialog,
  and pay-confirm flows using keyboard navigation and can observe accessible
  validation or action feedback.
- **SC-011**: The spec clearly distinguishes between in-scope duplicate-submit
  prevention and out-of-scope production controls such as rate limiting, fraud
  detection, and abuse monitoring.
- **SC-012**: The spec clearly distinguishes between the in-scope simulated
  payment UX and the out-of-scope production requirements for atomic payment
  state transitions and double-payment protection.

## Assumptions

- The enhancement is a follow-up to the already implemented `001` request flow
  and should preserve its core lifecycle behavior rather than redefine it.
- Infinite scroll may use page-based or cursor-based fetching as long as the
  user experience is append-only and responsive.
- The backend will supply a currency code or equivalent currency identifier for
  every request shown in the UI, and no currency conversion feature is in
  scope. New requests use a single backend-configured default currency, which
  is USD in the current demo configuration unless backend configuration
  changes it.
- The maximum amount rule refers to `50,000.00` major currency units displayed
  to the user, which maps to `5,000,000` integer cents in storage.
- Mock email authentication remains acceptable for the assignment, but auth
  enforcement should move into centralized middleware for protected routes.
- Preventing duplicate in-flight actions is part of the feature, but broader
  rate limiting, abuse prevention, fraud controls, and compliance workflows are
  intentionally outside the scope of this take-home implementation.
- The payment experience in this assignment simulates fulfillment and status
  changes for demo purposes; production-grade transactional guarantees,
  idempotency, and settlement safety are acknowledged requirements for a real
  fintech launch but are not fully implemented in this take-home scope.
- The accessibility target for this polish pass is a solid baseline for the
  critical flows rather than a full formal certification effort, but keyboard
  access, focus management, semantic feedback, and mobile usability are
  mandatory.
