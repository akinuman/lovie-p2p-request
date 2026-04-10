# Web Routes and Interaction Contract: Request Flow Polish

This feature extends the existing App Router and Server Action contract from
`001`. It adds centralized auth guarding, incremental pagination endpoints, and
dialog-driven interaction states while preserving the existing request
lifecycle.

## Route Contract

### `middleware.ts`

- Purpose: optimistic signed-in route guard for protected request-flow screens
- Behavior:
  - reads only the signed auth cookie
  - redirects unauthenticated users away from protected routes
  - redirects authenticated users away from public auth-only screens when
    appropriate
- Constraint:
  - must not be the only security boundary; use cases and actions still verify
    authorization

### `/dashboard/outgoing`

- Purpose: sender dashboard for action-oriented outgoing request cards
- Query params:
  - `q`: optional debounced search text
  - `status`: optional lifecycle filter
  - `created`: optional newly created request id used to open the post-create
    dialog
- Behavior:
  - requires authentication
  - renders the initial outgoing stack on the server
  - opens a dialog when `created` is present and resolvable
  - provides direct card actions for `View details`, `Preview`, `Copy link`,
    and `Cancel` when pending
  - uses the shared request-flow loading and inline error pattern for async
    card actions

### `/dashboard/incoming`

- Purpose: recipient dashboard for action-oriented incoming request cards
- Query params:
  - `q`: optional debounced search text
  - `status`: optional lifecycle filter
- Behavior:
  - requires authentication
  - renders the initial incoming stack on the server
  - appends additional incoming cards through incremental fetches

### `/requests/new`

- Purpose: create request screen
- Behavior:
  - requires authentication
  - uses stricter amount validation including the 50,000 maximum
  - removes non-essential technical explanatory copy
  - uses the shared request-flow form error and button loading pattern

### `/requests/[requestId]`

- Purpose: authenticated full-detail view
- Behavior:
  - requires authentication
  - preserves lifecycle detail behavior from `001`
  - recipient pay action opens a confirmation dialog before server mutation

### `/r/[requestId]`

- Purpose: share-link preview route
- Behavior:
  - remains public summary-first
  - continues to show limited information to non-recipients
  - serves as the destination for `Preview` actions from cards and post-create
    dialog

## Internal Pagination Contract

### `GET /api/requests/outgoing`

- Purpose: fetch the next outgoing dashboard slice for infinite scroll
- Query params:
  - `q`
  - `status`
  - `cursor`
  - `limit`
- Output:
  - `items`
  - `nextCursor`
  - `hasMore`
- Guard rules:
  - authenticated sender only
  - results are scoped to current user

### `GET /api/requests/incoming`

- Purpose: fetch the next incoming dashboard slice for infinite scroll
- Query params:
  - `q`
  - `status`
  - `cursor`
  - `limit`
- Output:
  - `items`
  - `nextCursor`
  - `hasMore`
- Guard rules:
  - authenticated user only
  - results are scoped to requests matched to that user

## Server Action Contract

### `createRequestAction`

- Input:
  - `recipientContact: string`
  - `amount: string`
  - `note?: string`
- Validation rules:
  - amount parses to integer cents
  - amount is greater than zero
  - amount does not exceed 50,000 major currency units
  - recipient contact remains valid and non-self
- Output:
  - creates a `PaymentRequest`
  - persists backend-owned currency on the request
  - redirects to `/dashboard/outgoing?created={requestId}`
  - drives a loading-button spinner state while pending

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
  - drives a loading-button spinner state while pending

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
  - drives a loading-button spinner state while pending

### `payRequestAction`

- Input:
  - `requestId: string`
- Guard rules:
  - current user is matched recipient
  - request status is `Pending`
  - request is confirmed by the recipient through the pay dialog
  - request is not expired before processing starts
- Behavior:
  - starts only after explicit confirmation
  - waits 2-3 seconds to simulate processing
  - re-checks expiry before final commit
- Output:
  - marks request `Paid` or `Expired`
  - revalidates incoming, outgoing, and detail routes
  - drives a loading-button spinner state while pending

## UI Interaction Contract

### Dashboard query behavior

- Search runs after debounce when the user stops typing
- Status filters apply immediately on change
- Clear control is actionable only when `q` or `status` is active
- Changing `q` or `status` resets the incremental stack to the first page
- Async dashboard controls should not expose a separate Apply action

### Outgoing share behavior

- Each outgoing card exposes a share-link copy affordance
- Copy does not navigate away from the dashboard
- `Preview` remains a separate action
- If copy fails, inline feedback appears and the share URL remains available for
  manual copying

### Post-create dialog behavior

- Appears after redirect from request creation
- Shows the newly created request's summary, preview action, and copy-link action
- Closes without losing the refreshed outgoing list state
- Closing clears the dialog-driving URL state

### Pay confirmation behavior

- `Pay` first opens a confirmation dialog
- Confirm triggers processing
- Cancel closes the dialog and leaves the request unchanged
- If the request becomes non-payable before final confirmation completes, the
  dialog closes or updates to the latest state and processing does not start

### Shared request-flow state behavior

- Async buttons use one consistent spinner + disabled-state pattern
- Request forms and async card actions use one consistent inline error style
- Product-specific components should compose existing `components/ui/*`
  primitives or direct Radix primitives rather than introducing duplicate
  primitive layers
