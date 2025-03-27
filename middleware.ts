import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the request is for an API route
  if (path.startsWith("/api/")) {
    // Set the content type to application/json for all API routes
    const response = NextResponse.next()
    response.headers.set("Content-Type", "application/json")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}

