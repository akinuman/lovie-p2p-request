# Web Route and Action Contract

This application is a single Next.js App Router monolith. The primary contract
surface is page routes plus Server Actions rather than a public REST API.

## Route Contract

### `/`

- Purpose: lightweight landing page that routes authenticated users to the
  dashboard and unauthenticated users to sign-in.

### `/sign-in`

- Purpose: mock email sign-in screen.
- Inputs:
  - `email` required
- Behavior:
  - looks up or creates a `User`
  - sets signed HTTP-only auth cookie
  - redirects to `/dashboard/outgoing`

### `/dashboard/outgoing`

- Purpose: sender dashboard for created requests.
- Query params:
  - `q`: free-text search over request id, recipient contact, or note
  - `status`: optional lifecycle filter
- Behavior:
  - requires authentication
  - lists current user's outgoing requests
  - exposes create-request CTA and cancel controls where allowed

### `/dashboard/incoming`

- Purpose: recipient dashboard for matched incoming requests.
- Query params:
  - `q`: free-text search over request id, sender email, or note
  - `status`: optional lifecycle filter
- Behavior:
  - requires authentication
  - lists requests where the signed-in user is the intended recipient
  - exposes `Pay`, `Decline`, and `View Details` where allowed

### `/requests/new`

- Purpose: request creation screen.
- Behavior:
  - requires authentication
  - submits through `createRequestAction`

### `/requests/[requestId]`

- Purpose: authenticated full-detail view.
- Behavior:
  - sender can view their own request
  - intended recipient can view full detail
  - shows a live expiration countdown derived from `expiresAt`
  - non-participants are rejected

### `/r/[requestId]`

- Purpose: share-link entry page.
- Behavior:
  - public route
  - shows limited summary to any viewer
  - upgrades to full detail and actions only when the signed-in user matches
    the intended recipient

## Server Action Contract

### `signInAction`

- Input:
  - `email: string`
- Output:
  - success redirect to `/dashboard/outgoing`
- Errors:
  - invalid email

### `logoutAction`

- Input: none
- Output:
  - clears auth cookie
  - redirects to `/sign-in`

### `createRequestAction`

- Input:
  - `recipientContact: string`
  - `amount: string`
  - `note?: string`
- Validation rules:
  - amount parses to positive integer cents
  - recipient contact is valid email or phone
  - recipient contact does not match current user's email or phone
- Output:
  - creates `PaymentRequest`
  - revalidates outgoing dashboard
  - redirects to `/requests/[requestId]`

### `cancelRequestAction`

- Input:
  - `requestId: string`
- Guard rules:
  - current user is sender
  - request status is `Pending`
  - request is not expired
- Output:
  - marks request `Cancelled`
  - revalidates outgoing, incoming, and detail routes

### `declineRequestAction`

- Input:
  - `requestId: string`
- Guard rules:
  - current user is matched recipient
  - request status is `Pending`
  - request is not expired
- Output:
  - marks request `Declined`
  - revalidates incoming, outgoing, and detail routes

### `payRequestAction`

- Input:
  - `requestId: string`
- Guard rules:
  - current user is matched recipient
  - request status is `Pending`
  - request is not expired before processing starts
- Behavior:
  - waits 2-3 seconds to simulate processing
  - re-checks expiry before final commit
- Output:
  - marks request `Paid` or `Expired`
  - revalidates incoming, outgoing, and detail routes

## Authorization Rules

- Sender permissions:
  - create requests
  - view own outgoing requests
  - cancel own pending requests
- Recipient permissions:
  - view incoming requests only when their stored profile matches the target
    contact
  - pay or decline only pending, non-expired requests
- Public viewers:
  - may view limited summary on `/r/[requestId]`
  - may not see full detail or perform actions
