import { type NextRequest, NextResponse } from "next/server"
import { getMedicationsForUser, updateMedication, createMedication, deleteMedication } from "@/lib/db-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, medications } = await request.json()

    if (!userId || !medications) {
      return NextResponse.json({ error: "User ID and medications are required" }, { status: 400 })
    }

    // Get current medications
    const currentMedications = await getMedicationsForUser(userId)

    // Process each medication
    for (const medication of medications) {
      const existingMedication = currentMedications.find((m) => m.id === medication.id)

      if (existingMedication) {
        // Update existing medication
        await updateMedication(userId, medication)
      } else {
        // Create new medication
        await createMedication(userId, medication)
      }
    }

    // Delete medications that are not in the new list
    for (const currentMedication of currentMedications) {
      if (!medications.some((m) => m.id === currentMedication.id)) {
        await deleteMedication(userId, currentMedication.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Batch update medications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

