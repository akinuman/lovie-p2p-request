# Research: P2P Payment Request Flow

## Decision 1: Deliver the feature as a public, responsive web application

- **Decision**: Plan for a publicly deployed web app with authenticated sender
  and recipient views plus shareable request links.
- **Rationale**: The feature requires dashboards, detail screens, responsive
  behavior, and public accessibility, which all map naturally to a web app.
- **Alternatives considered**: Native mobile app was rejected because it would
  add unnecessary scope and make public review harder for a take-home.

## Decision 2: Use mock email authentication as the baseline auth approach

- **Decision**: Treat email-based mock authentication as the default auth model.
- **Rationale**: The constitution explicitly allows simple/mock email auth, and
  it keeps the assignment focused on request lifecycle behavior rather than
  production auth complexity.
- **Alternatives considered**: Full password auth, OAuth, and magic-link email
  delivery were rejected for adding scope without improving the evaluation goal.

## Decision 3: Defer concrete tech stack selection until implementation

- **Decision**: Do not choose language, framework, or hosting vendor in this
  planning phase.
- **Rationale**: The user explicitly requested that stack choices stay open
  unless the planning phase truly requires them. The required behavior can be
  specified through contracts, data modeling, and workflow decisions first.
- **Alternatives considered**: Locking in a stack now was rejected because it
  would constrain later implementation choices without being necessary to define
  the product behavior.

## Decision 4: Model request lifecycle with a single canonical status record

- **Decision**: Each request uses one canonical status state shared by sender
  and recipient views: `Pending`, `Paid`, `Declined`, `Expired`, and an
  implementation-level `Cancelled` terminal state for cancelled requests.
- **Rationale**: A single source of truth is the simplest way to guarantee that
  both dashboards and detail views stay synchronized after state changes.
- **Alternatives considered**: Separate sender-side and recipient-side status
  values were rejected because they increase sync complexity and bug risk.

## Decision 5: Enforce expiry lazily from timestamps instead of background jobs

- **Decision**: Compute expiry from `createdAt + 7 days` and enforce it whenever
  a request is read or acted on.
- **Rationale**: This approach keeps the architecture simple, avoids scheduler
  complexity, and is straightforward to test in Playwright and backend tests.
- **Alternatives considered**: Scheduled expiration jobs were rejected because
  they are more infrastructure-heavy than this assignment needs.

## Decision 6: Simulate payment with an intentional 2-3 second async transition

- **Decision**: `Pay` should enter a temporary processing state for 2-3 seconds
  before transitioning to `Paid`.
- **Rationale**: The requirement is explicit, and a controlled async step makes
  the UI behavior easy to demonstrate and test without real payment rails.
- **Alternatives considered**: Instant payment completion was rejected because
  it would not satisfy the required user experience.

## Decision 7: Protect shareable links with recipient identity checks

- **Decision**: Share links expose the request detail route, but only an
  authenticated user matching the intended recipient contact can pay or decline.
- **Rationale**: This preserves the convenience of sharing while preventing the
  link itself from becoming authorization.
- **Alternatives considered**: Fully public action links were rejected because
  they are too permissive for a fintech-style interaction, even in a mock app.

## Decision 8: Public deployment is a release requirement, not a planning blocker

- **Decision**: Mark public deployment as mandatory while deferring provider
  selection until implementation.
- **Rationale**: The requirement is product-facing, but a hosting vendor choice
  is not needed to define data flow, contracts, or acceptance behavior.
- **Alternatives considered**: Choosing a hosting provider during planning was
  rejected because it is a stack decision the user asked to defer.
