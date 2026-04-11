# Data Model: Request Flow Polish

## Overview

This feature extends the existing `001` request-flow model rather than
replacing it. The primary persisted delta is backend-owned currency on each
request. The main non-persisted additions are dashboard pagination/query state,
post-create dialog state, pay confirmation state, and shared async action
feedback state.

## Persisted Entity Delta: PaymentRequest

**Purpose**: Preserve the canonical lifecycle record while supporting
backend-driven currency and new dashboard/query behavior.

**Existing fields retained**

- `id`
- `senderUserId`
- `recipientContactType`
- `recipientContactValue`
- `recipientMatchedUserId`
- `amountCents`
- `note`
- `status`
- `createdAt`
- `updatedAt`
- `expiresAt`
- `paidAt`
- `declinedAt`
- `cancelledAt`
- `lastStatusChangedAt`

**New or clarified fields**

- `currencyCode`: required backend-owned currency identifier such as `USD`
- `amountCents`: remains required integer cents with validation
  `> 0 && <= 5_000_000`

**Validation**

- `amountCents` MUST stay an integer at all layers.
- `amountCents` MUST be greater than zero.
- `amountCents` MUST NOT exceed the equivalent of 50,000 major currency units.
- `currencyCode` MUST be present on every request record returned to the UI.
- Existing lifecycle and recipient validation rules from `001` remain in force.

## Persisted Entity Delta: User

**Purpose**: Remains the authenticated actor model for sender and recipient
  matching.

**Fields unchanged**

- `id`
- `email`
- `phone`
- `createdAt`
- `updatedAt`

**Notes**

- This feature does not add new user columns.
- User reads and lookups move behind `data-access` modules.

## Non-Persisted Model: DashboardQueryState

**Purpose**: Represents the currently active incoming or outgoing dashboard
query.

**Fields**

- `q`: optional free-text search
- `status`: optional lifecycle filter
- `cursor`: optional pagination cursor for incremental loading
- `limit`: request count for each loaded stack

**Rules**

- `q` and `status` are URL-owned.
- `cursor` is fetch-owned and should not change the user's visible filter
  intent.
- Clearing query state removes `q` and `status` together.

## Non-Persisted Model: DashboardPage

**Purpose**: Represents one server-returned page of request cards for append
behavior.

**Fields**

- `items`: request card rows for the current query
- `nextCursor`: nullable cursor for the next fetch
- `hasMore`: boolean convenience flag

**Rules**

- Pages append in descending recency order.
- A change in `q` or `status` resets the existing appended stack.

## Non-Persisted Model: RequestCardPresentation

**Purpose**: Represents the action-oriented request card shown in incoming and
outgoing dashboards.

**Fields**

- `id`
- `amountCents`
- `currencyCode`
- `status`
- `notePreview`
- `createdAt`
- `expiresAt`
- `recipientLabel` or `senderLabel`
- `shareUrl` for outgoing
- `canCancel`
- `canPreview`
- `canViewDetails`
- `canCopyShareLink`

## Non-Persisted Model: PostCreateDialogState

**Purpose**: Represents the newly created request surfaced on the outgoing
dashboard after redirect.

**Fields**

- `requestId`
- `previewUrl`
- `shareUrl`
- `currencyCode`
- `amountCents`
- `note`
- `open`

**Rules**

- The dialog opens only for a newly created request.
- Closing the dialog preserves the updated dashboard list and removes the
  dialog-driving URL state.

## Non-Persisted Model: PaymentConfirmationState

**Purpose**: Represents the confirmation step between choosing `Pay` and
starting simulated payment processing.

**Fields**

- `requestId`
- `amountCents`
- `currencyCode`
- `statusAtOpen`
- `open`

**Rules**

- Confirmation must occur before the 2-3 second simulated processing starts.
- If the request is no longer payable after confirmation, the action fails and
  the canonical lifecycle state remains the source of truth.

## Non-Persisted Model: AsyncActionFeedbackState

**Purpose**: Represents the shared loading and error behavior used by
request-flow forms, card actions, and dialogs.

**Fields**

- `pending`: boolean
- `errorMessage`: nullable string
- `showSpinner`: boolean
- `disabled`: boolean

**Rules**

- Any async request-flow button sets `pending = true`, `showSpinner = true`,
  and `disabled = true` while the action is unresolved.
- Validation failures and async action errors use inline feedback rather than
  route-breaking navigation.
- Shared UI-state rules apply consistently to create, pay, decline, cancel, and
  copy-link interactions.

## Access Boundary Model

### Data Access Layer

**Purpose**: Own table-level reads and writes only.

**Responsibilities**

- fetch outgoing pages
- fetch incoming pages
- fetch request by id
- create request rows
- update request status rows
- fetch current user and recipient matches

**Non-responsibilities**

- business-rule orchestration
- auth redirect decisions
- lifecycle policy composition across multiple reads/writes

### Request Use-Case Layer

**Purpose**: Own auth-aware orchestration and business rules.

**Responsibilities**

- apply lifecycle guards
- compose dashboard query behavior
- orchestrate create/pay/decline/cancel flows
- compose standardized async feedback state for request-flow interactions
- normalize dialog and dashboard output shapes
- call data-access modules and shared helpers

## State Transition Rules

The canonical request lifecycle from `001` remains unchanged:

- `Pending -> Paid`
- `Pending -> Declined`
- `Pending -> Cancelled`
- `Pending -> Expired`
- `Paid`, `Declined`, `Cancelled`, and `Expired` remain terminal states

## Suggested Index and Query Notes

- Preserve existing sender, recipient, and status indexes from `001`
- Add `currencyCode` to returned select shapes for all request queries
- Preserve query ordering by `createdAt desc, id desc` so cursor pagination is
  stable
- Keep search scoped to the current authenticated user and their matching role
