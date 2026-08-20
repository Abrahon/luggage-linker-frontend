// middleware.ts
import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // 1. Keep your existing header logic
  res.headers.set("x-pathname", request.nextUrl.pathname);

  // 2. Read the same cookie written by setAccessToken during sign-in.
  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 3. Define protected pages
  const protectedRoutes = ["/profile", "/dashboard", "/verification"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // 4. Redirect to login if user has no token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return res;
}

export const config = {
  // Run on all pages except static assets and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
