import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Pages anyone can see, logged in or not
const PUBLIC_PATHS = ["/", "/about", "/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never touch API routes here — each API route enforces its own auth
  // checks internally (see getCurrentUser() calls in route.ts files).
  // Blocking API calls here breaks server components that fetch their
  // own app's API internally (the fetch would get redirected to an
  // HTML login page instead of JSON, crashing JSON.parse on the page).
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Always allow public pages and static files
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not logged in → redirect to login for anything else (e.g. /rides, /create)
  if (!token) {
    console.log(`[middleware] no session, redirecting from ${pathname} to /login`);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route except static assets, which we don't need to check
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};