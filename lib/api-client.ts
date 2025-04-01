// API client for interacting with the local storage backend

import type {
  UserProfile,
  UserSettings,
  UserAppointment,
  UserHealthData,
  UserMedication,
  UserDocument,
} from "@/types/database"

import * as localStorageService from "@/lib/local-storage-service"

// Helper function to simulate API latency - reduced for faster loading
const simulateLatency = async (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 100)) // Reduced from 300ms to 100ms
}

// Auth endpoints
export async function login(emailOrUsername: string, password: string) {
  await simulateLatency()

  try {
    // Check if the input is an email or username
    const isEmail = emailOrUsername.includes("@")

    // Get user by email or username
    let user
    if (isEmail) {
      user = await localStorageService.getUserByEmail(emailOrUsername)
    } else {
      user = await localStorageService.getUserByUsername(emailOrUsername)
    }

    // If user not found or password doesn't match
    if (!user || user.password !== password) {
      return { success: false, error: "Invalid credentials" }
    }

    // Return user info (excluding password)
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

export async function signup(username: string, email: string, password: string) {
  await simulateLatency()

  try {
    // Check if email already exists
    const existingUserByEmail = await localStorageService.getUserByEmail(email)
    if (existingUserByEmail) {
      return { success: false, error: "Email already exists" }
    }

    // Check if username already exists
    const existingUserByUsername = await localStorageService.getUserByUsername(username)
    if (existingUserByUsername) {
      return { success: false, error: "Username already exists" }
    }

    // Create new user
    const userId = crypto.randomUUID()
    const newUser = await localStorageService.createUser({
      id: userId,
      username,
      email,
      password, // In a real app, this would be hashed
      createdAt: new Date().toISOString(),
    })

    // Create profile
    await localStorageService.createProfile({
      id: userId,
      name: username,
      email,
    })

    // Generate random data for demo purposes
    await localStorageService.generateRandomData(userId)

    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    }
  } catch (error) {
    console.error("Signup error:", error)
    return { success: false, error: "An error occurred during signup" }
  }
}

export async function forgotPassword(email: string) {
  await simulateLatency()

  const user = await localStorageService.getUserByEmail(email)
  if (!user) {
    throw new Error("No account found with this email")
  }

  // Generate verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 15)

  await localStorageService.createVerificationCode({
    userId: user.id,
    code,
    expiresAt: expiresAt.toISOString(),
    type: "password_reset",
  })

  return {
    success: true,
    userId: user.id,
    code,
    message: `Verification code sent to your email`,
  }
}

export async function resetPassword(userId: string, code: string, newPassword: string) {
  await simulateLatency()

  const verified = await localStorageService.verifyCode(userId, code, "password_reset")
  if (!verified) {
    throw new Error("Invalid or expired verification code")
  }

  await localStorageService.updateUserPassword(userId, newPassword)

  return {
    success: true,
  }
}

export async function verifyUser(userId: string) {
  await simulateLatency()

  const user = await localStorageService.getUserById(userId)
  return {
    exists: !!user,
  }
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  await simulateLatency()

  const user = await localStorageService.getUserById(userId)
  if (!user) {
    throw new Error("User not found")
  }

  if (user.password !== currentPassword) {
    throw new Error("Current password is incorrect")
  }

  await localStorageService.updateUserPassword(userId, newPassword)

  return {
    success: true,
  }
}

// Profile endpoints
export async function getProfile(userId: string) {
  await simulateLatency()
  return localStorageService.getProfileById(userId)
}

export async function updateUserProfile(profile: UserProfile) {
  await simulateLatency()
  return localStorageService.updateProfile(profile)
}

// Settings endpoints
export async function getSettings(userId: string) {
  await simulateLatency()
  return localStorageService.getSettingsForUser(userId)
}

export async function updateUserSettings(userId: string, settings: UserSettings) {
  await simulateLatency()
  return localStorageService.updateSettings(userId, settings)
}

// Appointments endpoints
export async function getAppointments(userId: string) {
  await simulateLatency()
  return localStorageService.getAppointmentsForUser(userId)
}

export async function updateAppointments(userId: string, appointments: UserAppointment[]) {
  await simulateLatency()

  // Get current appointments
  const currentAppointments = await localStorageService.getAppointmentsForUser(userId)

  // Process each appointment
  for (const appointment of appointments) {
    const existingAppointment = currentAppointments.find((a) => a.id === appointment.id)

    if (existingAppointment) {
      // Update existing appointment
      await localStorageService.updateAppointment(userId, appointment)
    } else {
      // Create new appointment
      await localStorageService.createAppointment(userId, appointment)
    }
  }

  // Delete appointments that are not in the new list
  for (const currentAppointment of currentAppointments) {
    if (!appointments.some((a) => a.id === currentAppointment.id)) {
      await localStorageService.deleteAppointment(userId, currentAppointment.id)
    }
  }

  return { success: true }
}

// Health data endpoints
export async function getHealthData(userId: string) {
  await simulateLatency()
  return localStorageService.getHealthDataForUser(userId)
}

export async function updateHealthData(userId: string, data: UserHealthData) {
  await simulateLatency()
  // Ensure we're passing the userId to the local storage service
  const result = await localStorageService.updateHealthData(userId, data)
  console.log("Health data updated:", result)
  return result
}

// Medications endpoints
export async function getMedications(userId: string) {
  await simulateLatency()
  return localStorageService.getMedicationsForUser(userId)
}

export async function updateMedications(userId: string, medications: UserMedication[]) {
  await simulateLatency()

  // Get current medications
  const currentMedications = await localStorageService.getMedicationsForUser(userId)

  // Process each medication
  for (const medication of medications) {
    const existingMedication = currentMedications.find((m) => m.id === medication.id)

    if (existingMedication) {
      // Update existing medication
      await localStorageService.updateMedication(userId, medication)
    } else {
      // Create new medication
      await localStorageService.createMedication(userId, medication)
    }
  }

  // Delete medications that are not in the new list
  for (const currentMedication of currentMedications) {
    if (!medications.some((m) => m.id === currentMedication.id)) {
      await localStorageService.deleteMedication(userId, currentMedication.id)
    }
  }

  return { success: true }
}

// Documents endpoints
export async function getDocuments(userId: string) {
  await simulateLatency()
  return localStorageService.getDocumentsForUser(userId)
}

export async function updateDocuments(userId: string, documents: UserDocument[]) {
  await simulateLatency()

  // Get current documents
  const currentDocuments = await localStorageService.getDocumentsForUser(userId)

  // Process each document
  for (const document of documents) {
    const existingDocument = currentDocuments.find((d) => d.id === document.id)

    if (existingDocument) {
      // Update existing document
      await localStorageService.updateDocument(userId, document)
    } else {
      // Create new document
      await localStorageService.createDocument(userId, document)
    }
  }

  // Delete documents that are not in the new list
  for (const currentDocument of currentDocuments) {
    if (!documents.some((d) => d.id === currentDocument.id)) {
      await localStorageService.deleteDocument(userId, currentDocument.id)
    }
  }

  return { success: true }
}

// Health tips endpoints
export async function searchHealthTips(query: string) {
  await simulateLatency()

  // Mock health tips search
  const allTips = [
    {
      id: "1",
      title: "Stay Hydrated",
      description: "Drink at least 8 glasses of water daily for optimal health.",
      category: "General Health",
      priority: "medium",
    },
    {
      id: "2",
      title: "Regular Exercise",
      description: "Aim for at least 30 minutes of moderate activity most days of the week.",
      category: "Fitness",
      priority: "high",
    },
    {
      id: "3",
      title: "Balanced Diet",
      description: "Include a variety of fruits, vegetables, whole grains, and lean proteins in your meals.",
      category: "Nutrition",
      priority: "high",
    },
    {
      id: "4",
      title: "Adequate Sleep",
      description: "Adults should aim for 7-9 hours of quality sleep each night.",
      category: "Sleep",
      priority: "high",
    },
    {
      id: "5",
      title: "Stress Management",
      description: "Practice relaxation techniques like deep breathing, meditation, or yoga.",
      category: "Mental Health",
      priority: "medium",
    },
  ]

  if (!query) return allTips

  return allTips.filter(
    (tip) =>
      tip.title.toLowerCase().includes(query.toLowerCase()) ||
      tip.description.toLowerCase().includes(query.toLowerCase()) ||
      tip.category.toLowerCase().includes(query.toLowerCase()),
  )
}

export async function getPersonalizedTips(userId: string) {
  await simulateLatency()

  // Mock personalized tips
  return [
    {
      id: "p1",
      title: "Monitor Your Blood Pressure",
      description: "Regular monitoring helps manage hypertension and prevent complications.",
      category: "Heart Health",
      priority: "high",
    },
    {
      id: "p2",
      title: "Take Medications as Prescribed",
      description: "Follow your doctor's instructions for all medications to ensure effectiveness.",
      category: "Medication Management",
      priority: "high",
    },
    {
      id: "p3",
      title: "Schedule Regular Check-ups",
      description: "Regular visits with your healthcare provider help catch issues early.",
      category: "Preventive Care",
      priority: "medium",
    },
  ]
}

