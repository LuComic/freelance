import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/projects",
  "/projects/(.*)",
  "/settings",
  "/settings(.*)",
]);

const authProxy = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const token = await convexAuth.getToken();

    if (isProtectedRoute(request) && !token) {
      return nextjsMiddlewareRedirect(request, "/login");
    }
  },
  { cookieConfig: { maxAge: 60 * 60 * 24 * 30 } },
);

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const isLoginRoute = request.nextUrl.pathname === "/login";
  const hasOAuthCode = request.nextUrl.searchParams.has("code");

  // OAuth callbacks still need Convex Auth for the code exchange.
  if (isLoginRoute && !hasOAuthCode) {
    return NextResponse.next();
  }

  return authProxy(request, event);
}

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets and the landing page.
  matcher: ["/((?!$|.*\\..*|_next).*)", "/(api|trpc)(.*)"],
};
