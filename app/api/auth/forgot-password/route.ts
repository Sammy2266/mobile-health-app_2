import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, findUserByPhone, createVerificationCode } from "@/lib/db-service"

export async function POST(request: NextRequest) {
  try {
    const { email, phone, method } = await request.json()

    let user
    if (method === "email") {
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 })
      }
      user = await getUserByEmail(email)
    } else if (method === "phone") {
      if (!phone) {
        return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
      }
      user = await findUserByPhone(phone)
    } else {
      return NextResponse.json({ error: "Invalid method" }, { status: 400 })
    }

    if (!user) {
      return NextResponse.json(
        { error: method === "email" ? "No account found with this email" : "No account found with this phone number" },
        { status: 404 },
      )
    }

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    await createVerificationCode({
      userId: user.id,
      code,
      expiresAt: expiresAt.toISOString(),
      type: "password_reset",
    })

    // In a real app, you would send the code via email or SMS
    // For demo purposes, we'll just return it in the response
    return NextResponse.json({
      success: true,
      userId: user.id,
      code,
      message: `Verification code sent to your ${method === "email" ? "email" : "phone"}`,
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

