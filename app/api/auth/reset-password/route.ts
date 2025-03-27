import { type NextRequest, NextResponse } from "next/server"
import { verifyCode, updateUserPassword } from "@/lib/db-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, code, newPassword } = await request.json()

    if (!userId || !code || !newPassword) {
      return NextResponse.json({ error: "User ID, code, and new password are required" }, { status: 400 })
    }

    // Verify the code
    const isValid = await verifyCode(userId, code, "password_reset")
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 401 })
    }

    // Update the password
    const success = await updateUserPassword(userId, newPassword)
    if (!success) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

