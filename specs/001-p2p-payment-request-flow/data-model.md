# Data Model: P2P Payment Request Flow

## Entity: PaymentRequest

**Purpose**: Represents a request from one user to another for a specific amount
of money.

**Fields**

- `id`: opaque unique request identifier used in URLs and API routes
- `senderUserId`: reference to the authenticated sender
- `recipientContactType`: enum of `email` or `phone`
- `recipientContactValue`: normalized contact string
- `recipientUserId`: optional resolved user identity when the recipient signs in
- `amountCents`: integer amount in cents, must be `> 0`
- `note`: optional short free-text note
- `status`: enum of `Pending`, `Paid`, `Declined`, `Expired`, `Cancelled`
- `shareUrl`: generated link for opening the request detail route
- `createdAt`: timestamp when the request was created
- `expiresAt`: timestamp exactly 7 days after `createdAt`
- `paidAt`: nullable timestamp
- `declinedAt`: nullable timestamp
- `cancelledAt`: nullable timestamp
- `lastStatusChangedAt`: timestamp for latest terminal or lifecycle transition

**Validation**

- `amountCents` MUST be a positive integer.
- `recipientContactValue` MUST match the chosen contact type format.
- `note` MAY be empty.
- `status` transitions MUST follow the allowed state machine.

**Relationships**

- Belongs to one sender `UserIdentity`.
- May resolve to one recipient `UserIdentity`.

## Entity: UserIdentity

**Purpose**: Represents a user who can send or receive payment requests.

**Fields**

- `id`: unique user identifier
- `email`: canonical login and display identifier
- `phone`: optional phone number for matching phone-based requests
- `createdAt`: timestamp

**Validation**

- `email` MUST be unique when present.
- `phone` SHOULD be stored in normalized form when present.

**Relationships**

- One user can own many outgoing `PaymentRequest` records.
- One user can receive many incoming `PaymentRequest` records.

## Entity: AuthSession

**Purpose**: Represents a simple/mock authenticated session for the take-home.

**Fields**

- `id`: unique session identifier
- `userId`: reference to `UserIdentity`
- `createdAt`: timestamp
- `expiresAt`: nullable timestamp if the implementation uses session expiry

**Validation**

- A session MUST map to a valid user.

## Derived Views

### OutgoingRequestSummary

- `id`
- `recipientDisplay`
- `amountCents`
- `status`
- `createdAt`
- `expiresAt`
- `shareUrl`
- `canCancel`

### IncomingRequestSummary

- `id`
- `senderDisplay`
- `amountCents`
- `status`
- `createdAt`
- `expiresAt`
- `canPay`
- `canDecline`

## State Transitions

- `Pending -> Paid`
  Trigger: recipient completes simulated payment after 2-3 seconds.
- `Pending -> Declined`
  Trigger: recipient declines the request.
- `Pending -> Cancelled`
  Trigger: sender cancels the outgoing request before resolution.
- `Pending -> Expired`
  Trigger: request is older than 7 days when evaluated.
- `Paid`, `Declined`, `Cancelled`, and `Expired` are terminal states.

## Business Rules

- Expiry MUST be evaluated before allowing `Pay`, `Decline`, or `Cancel`.
- Sender and recipient dashboards MUST read from the same underlying request
  record so status changes stay synchronized.
- Detail views MUST expose the same canonical status and timestamps as the
  dashboards.
