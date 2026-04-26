import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

type AuthProxy = (
  request: NextRequest,
  event: NextFetchEvent,
) => Response | null | void | Promise<Response | null | void>;

const AUTH_TOKEN_COOKIE = "__convexAuthJWT";
const SECURE_AUTH_TOKEN_COOKIE = `__Host-${AUTH_TOKEN_COOKIE}`;
let authProxyPromise: Promise<AuthProxy> | null = null;

function hasAuthTokenCookie(request: NextRequest) {
  return (
    request.cookies.has(AUTH_TOKEN_COOKIE) ||
    request.cookies.has(SECURE_AUTH_TOKEN_COOKIE)
  );
}

function isProtectedRoute(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  return (
    pathname.startsWith("/projects/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/")
  );
}

function shouldRunAuthProxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  return (
    pathname === "/api/auth" ||
    pathname.startsWith("/api/auth/") ||
    request.nextUrl.searchParams.has("code") ||
    isProtectedRoute(request)
  );
}

function redirectTo(request: NextRequest, route: string) {
  const url = request.nextUrl.clone();
  const parsed = new URL(route, "http://dummy");

  url.pathname = parsed.pathname;
  url.search = "";
  parsed.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  return NextResponse.redirect(url);
}

function getAuthProxy() {
  authProxyPromise ??= import("@convex-dev/auth/nextjs/server").then(
    ({ convexAuthNextjsMiddleware }) =>
      convexAuthNextjsMiddleware(
        async (request, { convexAuth }) => {
          const token = await convexAuth.getToken();

          if (isProtectedRoute(request) && !token) {
            return redirectTo(request, "/login");
          }
        },
        { cookieConfig: { maxAge: 60 * 60 * 24 * 30 } },
      ),
  );

  return authProxyPromise;
}

export default async function proxy(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const isLoginRoute = request.nextUrl.pathname === "/login";
  const hasOAuthCode = request.nextUrl.searchParams.has("code");

  // OAuth callbacks still need Convex Auth for the code exchange.
  if (isLoginRoute && !hasOAuthCode) {
    if (hasAuthTokenCookie(request)) {
      return redirectTo(request, "/projects");
    }

    return NextResponse.next();
  }

  if (!shouldRunAuthProxy(request)) {
    return NextResponse.next();
  }

  const authProxy = await getAuthProxy();

  return authProxy(request, event);
}

export const config = {
  // Run the lightweight proxy broadly, but only load Convex Auth for auth,
  // OAuth callbacks, and protected app paths.
  matcher: ["/((?!$|.*\\..*|_next).*)", "/(api|trpc)(.*)"],
};
