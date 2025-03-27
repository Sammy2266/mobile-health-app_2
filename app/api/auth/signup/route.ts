import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, createUser, createProfile, updateSettings, generateRandomData } from "@/lib/db-service"
import { defaultSettings } from "@/types/database"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    // Create new user
    const userId = crypto.randomUUID()
    const newUser = await createUser({
      id: userId,
      username,
      email,
      password, // In a real app, this would be hashed
      createdAt: new Date().toISOString(),
    })

    // Create profile
    await createProfile({
      id: userId,
      name: username,
      email,
    })

    // Create settings
    await updateSettings(userId, defaultSettings)

    // Generate random data for demo purposes
    await generateRandomData(userId)

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

