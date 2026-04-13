export const AUTHENTICATED_HOME_PATH = "/dashboard/outgoing";
export const PROTECTED_REQUEST_ROUTE_PREFIXES = [
  "/dashboard",
  "/requests",
] as const;
export const PUBLIC_AUTH_ONLY_ROUTE_PREFIXES = ["/", "/sign-in"] as const;

export function isProtectedRequestRoute(pathname: string) {
  return PROTECTED_REQUEST_ROUTE_PREFIXES.some(
    (routePrefix) =>
      pathname === routePrefix || pathname.startsWith(`${routePrefix}/`),
  );
}

export function isPublicAuthOnlyRoute(pathname: string) {
  return PUBLIC_AUTH_ONLY_ROUTE_PREFIXES.some(
    (routePrefix) => pathname === routePrefix,
  );
}

// NOTE: This only checks cookie presence — no HMAC signature verification or
// payload decode. The session.ts HMAC check runs server-side on every protected
// action, so forged cookies can't access data. Middleware could HMAC-verify in
// Edge for tighter redirects, but for this take-home's mock auth the focus is
// on the P2P payment flows, not auth middleware hardening.
export function hasOptimisticSessionCookie(cookieValue?: string | null) {
  return Boolean(cookieValue);
}

export function getOptimisticAuthRedirectPath(input: {
  hasSession: boolean;
  pathname: string;
  search?: string;
}) {
  if (!input.hasSession && isProtectedRequestRoute(input.pathname)) {
    const redirectUrl = new URL("/sign-in", "http://localhost");
    const fromPath = `${input.pathname}${input.search ?? ""}`;

    redirectUrl.searchParams.set("from", fromPath);

    return `${redirectUrl.pathname}${redirectUrl.search}`;
  }

  if (input.hasSession && isPublicAuthOnlyRoute(input.pathname)) {
    const from = new URLSearchParams(input.search).get("from");

    if (from && from.startsWith("/") && !from.startsWith("//")) {
      return from;
    }

    return AUTHENTICATED_HOME_PATH;
  }

  if (
    !input.hasSession &&
    isPublicAuthOnlyRoute(input.pathname) &&
    input.pathname === "/"
  ) {
    return "/sign-in";
  }

  return null;
}
