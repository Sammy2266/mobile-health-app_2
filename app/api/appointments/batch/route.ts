import { type NextRequest, NextResponse } from "next/server"
import { getAppointmentsForUser, updateAppointment, createAppointment, deleteAppointment } from "@/lib/db-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, appointments } = await request.json()

    if (!userId || !appointments) {
      return NextResponse.json({ error: "User ID and appointments are required" }, { status: 400 })
    }

    // Get current appointments
    const currentAppointments = await getAppointmentsForUser(userId)

    // Process each appointment
    for (const appointment of appointments) {
      const existingAppointment = currentAppointments.find((a) => a.id === appointment.id)

      if (existingAppointment) {
        // Update existing appointment
        await updateAppointment(userId, appointment)
      } else {
        // Create new appointment
        await createAppointment(userId, appointment)
      }
    }

    // Delete appointments that are not in the new list
    for (const currentAppointment of currentAppointments) {
      if (!appointments.some((a) => a.id === currentAppointment.id)) {
        await deleteAppointment(userId, currentAppointment.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Batch update appointments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

