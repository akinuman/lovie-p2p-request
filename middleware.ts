import { type NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import {
  getOptimisticAuthRedirectPath,
  hasOptimisticSessionCookie,
} from "@/lib/auth/route-guard";

export function middleware(request: NextRequest) {
  const redirectPath = getOptimisticAuthRedirectPath({
    hasSession: hasOptimisticSessionCookie(
      request.cookies.get(SESSION_COOKIE_NAME)?.value,
    ),
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
  });

  if (!redirectPath) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}

export const config = {
  matcher: ["/", "/sign-in", "/dashboard/:path*", "/requests/:path*"],
};
