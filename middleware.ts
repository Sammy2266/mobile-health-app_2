import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/privacy-policy", "/terms-of-service"]

  // API routes that don't require authentication
  const publicApiRoutes = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/verify",
  ]

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

  // If it's a public route, allow access
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next()
  }

  // Check if the user is authenticated
  const authToken = request.cookies.get("auth_token")?.value
  const sessionId = request.cookies.get("session_id")?.value

  // For client-side routes, we'll rely on the app-provider to handle authentication
  if (!pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // For API routes, we'll check the auth token
  if (!authToken && !sessionId) {
    // If the user is not authenticated, redirect to login
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}

