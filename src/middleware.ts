import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const isAuthPage = 
    request.nextUrl.pathname.startsWith("/login") || 
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/forgot-password");

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPage) {
    const redirectUrl = token.type === "fornecedor" 
      ? "/supplier/dashboard" 
      : "/reseller/dashboard";
    
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Protect supplier routes
  if (
    request.nextUrl.pathname.startsWith("/supplier") &&
    (!isAuthenticated || token.type !== "fornecedor")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect reseller routes
  if (
    request.nextUrl.pathname.startsWith("/reseller") &&
    (!isAuthenticated || token.type !== "revendedor")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect unauthenticated users to login page if they try to access protected routes
  if (!isAuthenticated && !isAuthPage && request.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/supplier/:path*", 
    "/reseller/:path*", 
    "/login", 
    "/register", 
    "/forgot-password",
    "/profile",
  ],
};