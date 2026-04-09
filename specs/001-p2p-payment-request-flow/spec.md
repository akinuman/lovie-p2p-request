# Feature Specification: P2P Payment Request Flow

**Feature Branch**: `001-p2p-payment-request-flow`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "P2P payment request flow for a consumer fintech app"

## Clarifications

### Session 2026-04-09

- Q: When someone opens a shareable link and is not currently authenticated as
  the intended recipient, what should happen? → A: Anyone with the link can
  view limited summary info, but only the intended recipient can view full
  details or act.
- Q: How should phone-based requests map to recipient identity under mock email
  auth? → A: A signed-in user can access a phone-addressed request only if
  their profile includes the matching phone number.
- Q: When a sender cancels a pending request, how should that request appear
  afterward? → A: Show it as `Cancelled` in both sender and recipient views,
  with no further actions allowed.
- Q: If a recipient starts `Pay` just before expiry and the processing window
  ends after the request has expired, what should happen? → A: Fail the payment
  and mark the request `Expired` if expiry is reached before processing
  completes.
- Q: Should the system allow a user to create a request to themselves? → A: No,
  block self-requests when the recipient contact matches the signed-in user's
  email or phone.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sender Creates and Shares a Request (Priority: P1)

As an authenticated sender, I want to create a payment request with a recipient
contact, amount, and optional note so I can ask someone to pay me through a
shareable link and track it from my outgoing dashboard.

**Why this priority**: This is the entry point for the entire feature. Without
request creation and sharing, none of the later lifecycle states can happen.

**Independent Test**: Can be fully tested by signing in as a sender, creating a
request with a valid email or phone number and a positive amount, then verifying
that a unique request ID, shareable link, and `Pending` outgoing dashboard entry
are created. Critical flow Playwright coverage must record the run.

**Acceptance Scenarios**:

1. **Given** an authenticated sender, **When** they submit a valid recipient
   email, positive amount, and optional note, **Then** the system creates a
   unique request, generates a shareable link, and shows the request as
   `Pending` in the outgoing dashboard.
2. **Given** an authenticated sender, **When** they enter an invalid contact or
   a non-positive amount, **Then** the system blocks submission and shows inline
   validation feedback without creating a request.
3. **Given** an authenticated sender, **When** they enter their own email or
   phone as the recipient contact, **Then** the system blocks submission and
   explains that self-requests are not allowed.

---

### User Story 2 - Recipient Reviews and Resolves a Request (Priority: P1)

As an authenticated recipient, I want to view incoming requests and either pay,
decline, or inspect the details so I can resolve requests from a clear incoming
dashboard.

**Why this priority**: The feature is not useful unless the recipient can act on
the request and the sender can see the resulting status.

**Independent Test**: Can be fully tested by opening an incoming request as the
recipient, verifying the detail view, triggering `Pay` with a 2-3 second
processing state or `Decline`, and confirming the resulting status in both
sender and recipient views. Critical flow Playwright coverage must record the
run.

**Acceptance Scenarios**:

1. **Given** a pending incoming request, **When** the recipient selects `Pay`,
   **Then** the UI shows a 2-3 second processing state and the request becomes
   `Paid` in both the incoming and outgoing views.
2. **Given** a pending incoming request, **When** the recipient selects
   `Decline`, **Then** the request becomes `Declined` in both the incoming and
   outgoing views.
3. **Given** an incoming request, **When** the recipient opens `View Details`,
   **Then** they can see amount, note, sender, recipient, status, and timestamp.
4. **Given** a recipient starts payment near the expiry boundary, **When** the
   request expires before the simulated processing completes, **Then** the
   payment fails and the final status is `Expired`.

---

### User Story 3 - Users See Accurate Lifecycle Statuses (Priority: P2)

As a sender or recipient, I want request lifecycle rules such as cancellation,
expiration, search/filter, and status sync to behave predictably so I can trust
the request state shown in the app.

**Why this priority**: Lifecycle accuracy is essential for fintech-style trust,
but it depends on the core create and resolve flows already existing.

**Independent Test**: Can be tested by cancelling a pending outgoing request,
opening an expired request, and verifying that expired requests cannot be paid,
that details stay consistent, and that responsive layouts remain usable on
mobile and desktop widths.

**Acceptance Scenarios**:

1. **Given** a pending outgoing request, **When** the sender selects `Cancel`,
   **Then** the request becomes `Cancelled`, remains visible in both sender and
   recipient views, and no longer allows further actions.
2. **Given** a request older than 7 days and still unresolved, **When** either
   participant views it, **Then** it appears as `Expired` and the `Pay` action
   is unavailable.
3. **Given** a user opens dashboards or details on mobile or desktop widths,
   **When** they navigate the primary flows, **Then** the layout remains usable,
   readable, and action buttons remain accessible.
4. **Given** a user has multiple requests in a dashboard, **When** they apply
   search or status filters, **Then** the list updates to show only matching
   requests without changing the underlying data.

## Edge Cases

- A sender enters `0`, a negative number, too many decimal places, or a blank
  amount.
- A sender enters an invalid email or phone number format.
- A recipient opens a shareable link for a request that is already paid,
  declined, cancelled, or expired.
- A non-recipient opens a shareable link and must be limited to summary-only
  information without payment actions.
- A sender attempts to create a request to their own email or phone number.
- The sender tries to cancel a request after it has already been resolved.
- A cancelled request remains visible to both participants but no longer allows
  `Pay`, `Decline`, or `Cancel`.
- The recipient clicks `Pay` multiple times during the 2-3 second processing
  window.
- A request reaches its 7-day expiry during the simulated payment processing
  window.
- A request expires while the recipient is viewing it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated sender to create a payment
  request with recipient email or phone, amount, and an optional note.
- **FR-002**: The system MUST validate that the amount is greater than zero
  before creating a request.
- **FR-003**: The system MUST validate recipient contact format as either a
  valid email address or a valid phone number before creating a request.
- **FR-004**: The system MUST generate a unique request ID for each request.
- **FR-005**: The system MUST generate a shareable link for each request.
- **FR-006**: The system MUST show outgoing requests in a sender dashboard with
  at least the statuses `Pending`, `Paid`, `Declined`, and `Expired`.
- **FR-007**: The system MUST show incoming requests in a recipient dashboard
  with the actions `Pay`, `Decline`, and `View Details` when the request is
  actionable.
- **FR-008**: The system MUST provide a detail view that shows amount, note,
  sender, recipient, status, request ID, and relevant timestamp information.
- **FR-009**: The system MUST allow senders to cancel outgoing requests only
  while they are still pending.
- **FR-010**: The system MUST simulate payment processing for 2-3 seconds before
  marking a request as `Paid`.
- **FR-011**: The system MUST update sender and recipient views to reflect the
  latest request status after `Pay` or `Decline`.
- **FR-012**: The system MUST expire unresolved requests 7 days after creation.
- **FR-013**: The system MUST prevent expired requests from being paid.
- **FR-014**: The system MUST support simple email-based or mock authentication.
- **FR-015**: The system MUST work on both mobile and desktop screen sizes.
- **FR-016**: The deployed application MUST be publicly accessible.
- **FR-017**: Any monetary value in the feature MUST be represented and asserted
  as integer cents, with display formatting applied only at the presentation
  boundary.
- **FR-018**: A shareable link MUST allow unauthenticated or non-recipient
  viewers to see only limited summary information, while full details and
  `Pay` or `Decline` actions require authentication as the intended recipient.
- **FR-019**: For phone-addressed requests, the system MUST allow access and
  incoming-dashboard visibility only when the signed-in user's profile includes
  the matching phone number.
- **FR-020**: When a sender cancels a pending request, the system MUST show the
  request as `Cancelled` in both sender and recipient views, and it MUST become
  non-actionable.
- **FR-021**: If a request expires before simulated payment processing
  completes, the system MUST fail the payment and persist the request as
  `Expired`.
- **FR-022**: The system MUST block creation of self-requests when the
  recipient contact matches the signed-in user's email or phone.
- **FR-023**: The system MUST provide dashboard search and status-based
  filtering for incoming and outgoing requests.

### Key Entities *(include if feature involves data)*

- **PaymentRequest**: Represents a money request between a sender and recipient,
  including recipient contact, amount in cents, note, status, timestamps, and
  shareable link metadata.
- **UserIdentity**: Represents an authenticated actor in the system, identified
  by email and optionally linked to phone for request routing and phone-request
  recipient matching.
- **AuthSession**: Represents a simple/mock authenticated session used to act as
  sender or recipient within the app.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A sender can create a valid request and receive a shareable link
  in under 60 seconds during a guided demo.
- **SC-002**: A recipient can resolve a pending request through `Pay` or
  `Decline` without encountering unclear status transitions.
- **SC-003**: Each critical flow is covered by passing Playwright end-to-end
  tests with video artifacts available for review.
- **SC-004**: Reviewers can complete the primary sender and recipient flows on
  both mobile and desktop layouts without layout breakage.
- **SC-005**: Expired requests are consistently blocked from payment in both UI
  behavior and backend state transitions.
- **SC-006**: Dashboard search and status filtering return relevant results for
  the current user in both incoming and outgoing views.

## Assumptions

- Mock authentication is sufficient for the take-home and uses email as the
  canonical identity for the logged-in user.
- Email and phone validation can use pragmatic consumer-app validation rather
  than exhaustive international normalization rules.
- Phone-addressed requests are visible and actionable only for signed-in users
  whose profile already contains the matching phone number.
- Public share links may reveal only limited summary information to anyone with
  the link, but full details and all request actions require authentication as
  the intended recipient.
- Cancelled requests remain accessible for detail/audit purposes, but a
  `Cancelled` status is visible to both participants after cancellation.
- Real payment rails are out of scope; `Pay` only simulates processing and
  status changes.
- Self-requests are out of scope and intentionally blocked to keep the product
  behavior aligned to person-to-person requests.
