export const PROTECTED_REQUEST_ROUTE_PREFIXES = ["/dashboard", "/requests"] as const;
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
    return "/dashboard/outgoing";
  }

  return null;
}
