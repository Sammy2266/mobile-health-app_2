import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, getUserByUsername } from "@/lib/db-service"

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, password } = await request.json()

    if (!emailOrUsername || !password) {
      return NextResponse.json({ error: "Email/username and password are required" }, { status: 400 })
    }

    // Check if the input is an email or username
    const isEmail = emailOrUsername.includes("@")

    // Get user by email or username
    let user
    if (isEmail) {
      user = await getUserByEmail(emailOrUsername)
    } else {
      user = await getUserByUsername(emailOrUsername)
    }

    // If user not found or password doesn't match
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Return user info (excluding password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

