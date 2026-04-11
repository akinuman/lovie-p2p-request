# Research: Request Flow Polish

## Decision 1: Keep the single-repo Next.js monolith and refactor inside it

- **Decision**: Preserve the existing App Router monolith and improve the
  request flow within the same repo instead of splitting the app into separate
  frontend and backend services.
- **Rationale**: The assignment still rewards clarity, speed, and reviewability
  more than service decomposition. The current pain is organization inside the
  request flow, not deployment topology.
- **Alternatives considered**: A separate API service was rejected because it
  would add operational and architectural complexity without improving the
  assignment's core user flows.

## Decision 2: Add a data-access layer and request use-case layer

- **Decision**: Move raw request and user persistence into `lib/data-access/*`
  modules and move lifecycle, validation orchestration, auth-aware rules, and
  pagination composition into `lib/use-cases/requests/*`.
- **Rationale**: The current request flow mixes persistence and behavior in a
  way that makes future polish harder to trace. Separating these concerns keeps
  the codebase understandable without introducing a heavyweight domain
  framework.
- **Alternatives considered**: Leaving everything in the current `lib/requests`
  files was rejected because it preserves the same readability problem. A full
  repository pattern with interfaces and factories was rejected as unnecessary
  for this take-home.

## Decision 3: Use centralized middleware for optimistic auth redirects

- **Decision**: Add a root route guard that reads only the signed session cookie
  and redirects public versus protected routes before page logic runs.
- **Rationale**: Current Next.js auth guidance recommends optimistic
  middleware/proxy-style checks for central redirects while keeping secure data
  checks close to the source. This matches the user's request to stop resolving
  persistent signed-in state separately inside page files.
- **Alternatives considered**: Keeping all auth redirects inside pages was
  rejected because it duplicates logic and muddies route ownership. Putting all
  security in middleware alone was rejected because authorization still needs to
  be enforced in use cases and mutations.

## Decision 4: Keep URL-driven query state and add client-side debounce control

- **Decision**: Continue to store dashboard search and status in URL query
  params, but introduce a client controller that debounces search text, applies
  status changes immediately, and clears active state without a submit step.
- **Rationale**: URL state keeps reloads and deep linking stable, while a small
  client controller removes the extra Apply-button friction the user called
  out.
- **Alternatives considered**: Client-only filtering was rejected because the
  data is server-backed and should remain reload-safe. Keeping the current form
  submit pattern was rejected because it adds an unnecessary user step.

## Decision 5: Use cursor-based pagination for infinite scroll

- **Decision**: Support append-only dashboard loading through cursor-based
  pagination ordered by `createdAt desc, id desc`.
- **Rationale**: Cursor pagination is simpler to keep stable under filters and
  new inserts than offset pagination, especially when infinite scroll appends
  more results client-side.
- **Alternatives considered**: Offset pagination was rejected because it is
  more likely to duplicate or skip rows when records change. Fully client-side
  virtual lists were rejected because the demo dataset is small and the extra
  complexity is unnecessary.

## Decision 6: Add small internal route handlers for incremental dashboard fetches

- **Decision**: Keep server-rendered first-page dashboards, then fetch
  additional pages through narrowly scoped internal route handlers for incoming
  and outgoing request slices.
- **Rationale**: Infinite scroll needs a repeatable fetch surface that works
  from client components. Small internal route handlers keep the read contract
  explicit without turning the monolith into a broad REST API.
- **Alternatives considered**: Replacing dashboard reads with a full client
  data layer was rejected because it would overcomplicate the app. Using only
  full page navigations was rejected because it would not satisfy append-style
  infinite scroll.

## Decision 7: Persist backend-driven currency on each request

- **Decision**: Extend the request record and query shapes to carry currency
  from backend data, and format UI amounts from `amountCents + currencyCode`
  together.
- **Rationale**: The user explicitly wants currency to come from the backend,
  not from hardcoded UI assumptions. Persisting currency on the request keeps
  that contract concrete and testable.
- **Alternatives considered**: Hardcoding a single display currency in the UI
  was rejected because it violates the requested behavior. Live currency
  conversion was rejected because it is outside assignment scope.

## Decision 8: Add a maximum request amount of 50,000 major units

- **Decision**: Enforce a maximum creation amount equal to 50,000 major currency
  units, while continuing to parse and store money as integer cents.
- **Rationale**: This adds a clear product limit without changing the existing
  money architecture.
- **Alternatives considered**: No upper limit was rejected because the user
  asked for stronger validation. Storing the cap as a floating-point value was
  rejected because it conflicts with the constitution.

## Decision 9: Use accessible controlled dialogs for pay confirmation and post-create success

- **Decision**: Add a controlled confirmation dialog before pay processing and
  replace the current post-create banner with a controlled dialog on the
  outgoing dashboard.
- **Rationale**: The current project already uses Radix-aligned UI primitives,
  and Radix Dialog provides accessible focus management and close behavior that
  fits both flows.
- **Alternatives considered**: Inline confirmation text was rejected because it
  is easier to miss in a money action. Browser-native `confirm()` was rejected
  because it would be visually inconsistent and less controllable for review.

## Decision 10: Remove non-essential technical copy from the primary screens

- **Decision**: Remove extra explanation banners and technical implementation
  copy from the incoming, outgoing, and new request pages, leaving the pages
  focused on cards and actions.
- **Rationale**: The user wants cleaner, more product-like screens for the
  interview demo.
- **Alternatives considered**: Keeping the current banners was rejected because
  they compete with the actual task flow. Removing all descriptive text was
  rejected because the pages still need enough context to stay understandable.

## Decision 11: Follow modern React component best practices for request-flow UI

- **Decision**: Implement the polish pass using small focused React components,
  named function components, render-time derivation where possible, and minimal
  effect usage in line with the repo's React best-practice skill guidance.
- **Rationale**: The request-flow polish introduces more client-side behavior
  such as debounce, infinite scroll, dialogs, and copy feedback. Constraining
  the implementation style reduces the risk of state duplication and brittle
  `useEffect`-driven logic.
- **Alternatives considered**: Ad hoc local state and effect-heavy components
  were rejected because they would make the refactor harder to maintain and
  easier to regress.

## Decision 12: Reuse Radix-backed shadcn/ui primitives instead of creating duplicate primitives

- **Decision**: Reuse or extend the existing `components/ui/*` primitives and
  direct Radix primitives for dialogs, buttons, labels, inputs, and related UI
  building blocks instead of creating parallel custom primitive components.
- **Rationale**: The project already owns Radix-backed shadcn/ui source. This
  keeps behavior accessible and visually consistent while honoring the user's
  request not to create separate component abstractions when Radix-backed ones
  already exist.
- **Alternatives considered**: Creating new primitive-style button, dialog, or
  form-control components outside the existing Radix/shadcn layer was rejected
  because it would fragment behavior and styling.

## Decision 13: Standardize async button and form feedback across the request flow

- **Decision**: Introduce one shared request-flow pattern for loading,
  disabled, validation, and inline action-error states, including a visible
  spinner in loading buttons for create, pay, decline, cancel, and copy-link
  actions.
- **Rationale**: Multiple new async interactions are being added or changed in
  this feature. A shared pattern improves consistency for users and makes E2E
  assertions simpler and less brittle.
- **Alternatives considered**: Letting each page or action define its own
  loading and error style was rejected because it would create inconsistent
  user feedback and increase implementation drift.

## Decision 14: Expand Playwright coverage to story-level and edge-case-level validation

- **Decision**: Update Playwright coverage so each affected user story is
  validated end-to-end and the highest-risk edge cases are explicitly covered
  with video artifacts.
- **Rationale**: This feature changes both the happy path and several async edge
  conditions. Browser-level proof needs to cover more than the main path to
  give reviewers confidence in the polish pass.
- **Alternatives considered**: Limiting E2E coverage to happy paths only was
  rejected because the new debounce, infinite scroll, dialog, and async error
  handling behaviors are exactly where regressions are most likely.
