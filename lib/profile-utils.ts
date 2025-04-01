import type { UserProfile } from "@/types/database"

export function calculateProfileCompletion(profile: UserProfile): number {
  const fields = [
    profile.name,
    profile.email,
    profile.phone,
    profile.age,
    profile.gender,
    profile.height,
    profile.weight,
    profile.bloodType,
    profile.allergies?.length > 0,
    profile.emergencyContact?.name,
    profile.emergencyContact?.relationship,
    profile.emergencyContact?.phone,
  ]

  const filledFields = fields.filter((field) => {
    if (field === undefined || field === null) return false
    if (typeof field === "string") return field.trim() !== ""
    return true
  }).length

  return Math.round((filledFields / fields.length) * 100)
}

