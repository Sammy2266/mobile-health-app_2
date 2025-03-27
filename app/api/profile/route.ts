import { type NextRequest, NextResponse } from "next/server"
import { getProfileById, updateProfile, createProfile } from "@/lib/db-service"
import { defaultProfile } from "@/types/database"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const profile = await getProfileById(userId)

    if (!profile) {
      // Create a default profile if one doesn't exist
      const newProfile = {
        ...defaultProfile,
        id: userId,
        name: "User",
        email: "user@example.com",
      }

      try {
        const createdProfile = await createProfile(newProfile)
        return NextResponse.json(createdProfile)
      } catch (error) {
        console.error("Error creating default profile:", error)
        return NextResponse.json({ error: "Failed to create default profile" }, { status: 500 })
      }
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const profile = await request.json()

    if (!profile.id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const updatedProfile = await updateProfile(profile)

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

