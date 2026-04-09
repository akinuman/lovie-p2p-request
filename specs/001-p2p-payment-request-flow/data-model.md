# Data Model: P2P Payment Request Flow

## Overview

The implementation uses a minimal relational schema with two persisted tables:
`users` and `payment_requests`. Mock auth is handled by a signed cookie, so no
database-backed session table is required.

## Entity: User

**Purpose**: Represents an authenticated actor who can send and receive
requests.

**Fields**

- `id`: string primary key (`cuid` or `uuid`)
- `email`: unique, normalized, required
- `phone`: unique when present, normalized, nullable
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Validation**

- `email` MUST be stored lowercase and unique.
- `phone` MUST be normalized before storage when present.

**Relationships**

- One `User` has many outgoing `PaymentRequest` records via `senderUserId`.
- One `User` may be matched to many incoming `PaymentRequest` records via
  `recipientMatchedUserId`.

## Entity: PaymentRequest

**Purpose**: Represents the canonical request lifecycle record used by sender,
recipient, and share-link views.

**Fields**

- `id`: public string identifier used in dashboard/detail routes and share links
- `senderUserId`: foreign key to `users.id`
- `recipientContactType`: enum `email | phone`
- `recipientContactValue`: normalized target email or phone
- `recipientMatchedUserId`: nullable foreign key to `users.id` when the system
  can resolve the intended recipient
- `amountCents`: integer, required, `> 0`
- `note`: nullable text, max 280 characters
- `status`: enum `Pending | Paid | Declined | Cancelled | Expired`
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `expiresAt`: timestamp, always `createdAt + 7 days`
- `paidAt`: nullable timestamp
- `declinedAt`: nullable timestamp
- `cancelledAt`: nullable timestamp
- `lastStatusChangedAt`: timestamp

**Validation**

- `amountCents` MUST be a positive integer.
- `recipientContactValue` MUST match the selected contact type.
- The sender MUST NOT be able to create a request to their own email or phone.
- Only `Pending` requests are mutable.
- `Expired`, `Cancelled`, `Declined`, and `Paid` are terminal states.

**Relationships**

- Belongs to one sender `User`.
- May resolve to one matched recipient `User`.

## Non-Persisted Auth Session

**Purpose**: Represents the current logged-in user through a signed cookie.

**Cookie payload**

- `userId`
- `email`
- `issuedAt`

**Notes**

- The cookie is HTTP-only and signed with a server secret.
- Logout clears the cookie.
- Authorization always re-loads the user from the database using `userId`.

## Derived Query Shapes

### OutgoingDashboardItem

- `id`
- `recipientLabel`
- `amountCents`
- `status`
- `notePreview`
- `createdAt`
- `expiresAt`
- `canCancel`

### IncomingDashboardItem

- `id`
- `senderLabel`
- `amountCents`
- `status`
- `notePreview`
- `createdAt`
- `expiresAt`
- `canPay`
- `canDecline`

### ShareSummaryView

- `id`
- `senderLabel`
- `amountCents`
- `status`
- `notePreview`
- `expiresAt`
- `requiresRecipientAuth`

## State Transition Rules

- `Pending -> Paid`
  Guard: requester is the matched recipient, request is not expired, and the
  final status check after the 2-3 second delay still finds the request valid.
- `Pending -> Declined`
  Guard: requester is the matched recipient and request is not expired.
- `Pending -> Cancelled`
  Guard: requester is the sender and request is not expired.
- `Pending -> Expired`
  Guard: `now >= expiresAt` during read or mutation pre-check.
- `Paid`, `Declined`, `Cancelled`, and `Expired` are terminal states.

## Search and Filter Model

- Outgoing search operates over request `id`, `recipientContactValue`, and
  `note`.
- Incoming search operates over request `id`, sender email, and `note`.
- Status filter applies to the canonical `status` column.
- Search and filter are scoped to the current user only.

## Suggested Indexes

- `users(email)` unique
- `users(phone)` unique where not null
- `payment_requests(sender_user_id, created_at desc)`
- `payment_requests(recipient_matched_user_id, created_at desc)`
- `payment_requests(status, expires_at)`
- `payment_requests(recipient_contact_value, status)`
