import { type NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/lib/db-service"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const user = await getUserById(userId)

    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error("User verification error:", error)
    return NextResponse.json({ error: "Internal server error", exists: false }, { status: 500 })
  }
}

