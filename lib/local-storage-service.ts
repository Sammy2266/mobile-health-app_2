// This file replaces the db-service.ts with localStorage implementation
import {
  type UserProfile,
  type UserSettings,
  type UserAppointment,
  type UserHealthData,
  type UserMedication,
  type UserDocument,
  type UserCredentials,
  type VerificationCode,
  defaultSettings,
} from "@/types/database"

// Add this debugging function at the top of the file (after imports)
function debugLog(message: string, data?: any) {
  console.log(`[LocalStorageService] ${message}`, data || "")
}

// Storage keys
const STORAGE_KEYS = {
  USERS: "health_app_users",
  PROFILES: "health_app_profiles",
  SETTINGS: "health_app_settings",
  APPOINTMENTS: "health_app_appointments",
  HEALTH_DATA: "health_app_health_data",
  MEDICATIONS: "health_app_medications",
  DOCUMENTS: "health_app_documents",
  VERIFICATION_CODES: "health_app_verification_codes",
}

// Generic read function
function readData<T>(key: string): T[] {
  if (typeof window === "undefined") return []

  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error)
    return []
  }
}

// Generic write function
function writeData<T>(key: string, data: T[]): boolean {
  if (typeof window === "undefined") return false

  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error)
    return false
  }
}

// User functions
export async function getUsers(): Promise<UserCredentials[]> {
  return readData<UserCredentials>(STORAGE_KEYS.USERS)
}

export async function getUserById(id: string): Promise<UserCredentials | null> {
  const users = await getUsers()
  return users.find((user) => user.id === id) || null
}

export async function getUserByEmail(email: string): Promise<UserCredentials | null> {
  const users = await getUsers()
  return users.find((user) => user.email === email) || null
}

export async function getUserByUsername(username: string): Promise<UserCredentials | null> {
  const users = await getUsers()
  return users.find((user) => user.username === username) || null
}

export async function createUser(user: UserCredentials): Promise<UserCredentials> {
  const users = await getUsers()
  users.push(user)
  writeData(STORAGE_KEYS.USERS, users)
  return user
}

export async function updateUser(user: UserCredentials): Promise<UserCredentials> {
  const users = await getUsers()
  const index = users.findIndex((u) => u.id === user.id)
  if (index !== -1) {
    users[index] = user
    writeData(STORAGE_KEYS.USERS, users)
  }
  return user
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getUsers()
  const filteredUsers = users.filter((user) => user.id !== id)
  return writeData(STORAGE_KEYS.USERS, filteredUsers)
}

// Profile functions
export async function getProfiles(): Promise<UserProfile[]> {
  return readData<UserProfile>(STORAGE_KEYS.PROFILES)
}

export async function getProfileById(id: string): Promise<UserProfile | null> {
  const profiles = await getProfiles()
  return profiles.find((profile) => profile.id === id) || null
}

export async function createProfile(profile: UserProfile): Promise<UserProfile> {
  const profiles = await getProfiles()

  // Check if profile already exists
  const existingProfile = profiles.find((p) => p.id === profile.id)
  if (existingProfile) {
    return updateProfile(profile)
  }

  profiles.push(profile)
  writeData(STORAGE_KEYS.PROFILES, profiles)
  return profile
}

export async function updateProfile(profile: UserProfile): Promise<UserProfile> {
  const profiles = await getProfiles()
  const index = profiles.findIndex((p) => p.id === profile.id)
  if (index !== -1) {
    profiles[index] = profile
    writeData(STORAGE_KEYS.PROFILES, profiles)
  } else {
    // If profile doesn't exist, create it
    profiles.push(profile)
    writeData(STORAGE_KEYS.PROFILES, profiles)
  }
  return profile
}

export async function deleteProfile(id: string): Promise<boolean> {
  const profiles = await getProfiles()
  const filteredProfiles = profiles.filter((profile) => profile.id !== id)
  return writeData(STORAGE_KEYS.PROFILES, filteredProfiles)
}

// Settings functions
export async function getSettingsForUser(userId: string): Promise<UserSettings> {
  const settings = readData<UserSettings & { userId: string }>(STORAGE_KEYS.SETTINGS)
  const userSettings = settings.find((s) => s.userId === userId)
  if (!userSettings) {
    // Create default settings if they don't exist
    const newSettings = { ...defaultSettings, userId }
    settings.push(newSettings)
    writeData(STORAGE_KEYS.SETTINGS, settings)
    return newSettings
  }
  return userSettings
}

export async function updateSettings(userId: string, settings: UserSettings): Promise<UserSettings> {
  try {
    const allSettings = readData<UserSettings & { userId: string }>(STORAGE_KEYS.SETTINGS)
    const index = allSettings.findIndex((s) => s.userId === userId)
    const updatedSettings = { ...settings, userId }

    if (index !== -1) {
      allSettings[index] = updatedSettings
    } else {
      allSettings.push(updatedSettings)
    }

    // Ensure we write to localStorage synchronously
    const success = writeData(STORAGE_KEYS.SETTINGS, allSettings)

    if (!success) {
      console.error("Failed to write settings to localStorage")
      throw new Error("Failed to save settings")
    }

    console.log("Settings saved successfully:", updatedSettings)
    return updatedSettings
  } catch (error) {
    console.error("Error saving settings:", error)
    throw error
  }
}

// Appointments functions
export async function getAppointmentsForUser(userId: string): Promise<UserAppointment[]> {
  const appointments = readData<UserAppointment & { userId: string }>(STORAGE_KEYS.APPOINTMENTS)
  return appointments.filter((a) => a.userId === userId)
}

export async function createAppointment(userId: string, appointment: UserAppointment): Promise<UserAppointment> {
  const appointments = readData<UserAppointment & { userId: string }>(STORAGE_KEYS.APPOINTMENTS)
  const newAppointment = { ...appointment, userId }
  appointments.push(newAppointment)
  writeData(STORAGE_KEYS.APPOINTMENTS, appointments)
  return newAppointment
}

export async function updateAppointment(userId: string, appointment: UserAppointment): Promise<UserAppointment> {
  const appointments = readData<UserAppointment & { userId: string }>(STORAGE_KEYS.APPOINTMENTS)
  const index = appointments.findIndex((a) => a.id === appointment.id && a.userId === userId)
  if (index !== -1) {
    appointments[index] = { ...appointment, userId }
    writeData(STORAGE_KEYS.APPOINTMENTS, appointments)
  }
  return appointment
}

export async function deleteAppointment(userId: string, id: string): Promise<boolean> {
  const appointments = readData<UserAppointment & { userId: string }>(STORAGE_KEYS.APPOINTMENTS)
  const filteredAppointments = appointments.filter((a) => !(a.id === id && a.userId === userId))
  return writeData(STORAGE_KEYS.APPOINTMENTS, filteredAppointments)
}

// Health data functions
export async function getHealthDataForUser(userId: string): Promise<UserHealthData> {
  debugLog(`Getting health data for user ${userId}`)

  try {
    const healthDataKey = `health_data_${userId}`
    const healthDataJson = localStorage.getItem(healthDataKey)

    if (!healthDataJson) {
      debugLog(`No health data found for user ${userId}, returning default`)
      return {
        bloodPressure: [],
        heartRate: [],
        weight: [],
        sleep: [],
      }
    }

    const healthData = JSON.parse(healthDataJson)
    debugLog(`Retrieved health data for user ${userId}`, healthData)
    return healthData
  } catch (error) {
    console.error("Error getting health data:", error)
    throw error
  }
}

export async function updateHealthData(userId: string, data: UserHealthData): Promise<UserHealthData> {
  debugLog(`Updating health data for user ${userId}`, data)

  try {
    // Get all users
    const users = getUsers()

    // Find the user's health data
    const healthDataKey = `health_data_${userId}`

    // Save the health data to local storage
    localStorage.setItem(healthDataKey, JSON.stringify(data))

    debugLog(`Health data saved successfully for user ${userId}`)
    return data
  } catch (error) {
    console.error("Error updating health data:", error)
    throw error
  }
}

// Medications functions
export async function getMedicationsForUser(userId: string): Promise<UserMedication[]> {
  const medications = readData<UserMedication & { userId: string }>(STORAGE_KEYS.MEDICATIONS)
  return medications.filter((m) => m.userId === userId)
}

export async function createMedication(userId: string, medication: UserMedication): Promise<UserMedication> {
  const medications = readData<UserMedication & { userId: string }>(STORAGE_KEYS.MEDICATIONS)
  const newMedication = { ...medication, userId }
  medications.push(newMedication)
  writeData(STORAGE_KEYS.MEDICATIONS, medications)
  return newMedication
}

export async function updateMedication(userId: string, medication: UserMedication): Promise<UserMedication> {
  const medications = readData<UserMedication & { userId: string }>(STORAGE_KEYS.MEDICATIONS)
  const index = medications.findIndex((m) => m.id === medication.id && m.userId === userId)
  if (index !== -1) {
    medications[index] = { ...medication, userId }
    writeData(STORAGE_KEYS.MEDICATIONS, medications)
  }
  return medication
}

export async function deleteMedication(userId: string, id: string): Promise<boolean> {
  const medications = readData<UserMedication & { userId: string }>(STORAGE_KEYS.MEDICATIONS)
  const filteredMedications = medications.filter((m) => !(m.id === id && m.userId === userId))
  return writeData(STORAGE_KEYS.MEDICATIONS, filteredMedications)
}

// Documents functions
export async function getDocumentsForUser(userId: string): Promise<UserDocument[]> {
  const documents = readData<UserDocument & { userId: string }>(STORAGE_KEYS.DOCUMENTS)
  return documents.filter((d) => d.userId === userId)
}

export async function createDocument(userId: string, document: UserDocument): Promise<UserDocument> {
  const documents = readData<UserDocument & { userId: string }>(STORAGE_KEYS.DOCUMENTS)
  const newDocument = { ...document, userId }
  documents.push(newDocument)
  writeData(STORAGE_KEYS.DOCUMENTS, documents)
  return newDocument
}

export async function updateDocument(userId: string, document: UserDocument): Promise<UserDocument> {
  const documents = readData<UserDocument & { userId: string }>(STORAGE_KEYS.DOCUMENTS)
  const index = documents.findIndex((d) => d.id === document.id && d.userId === userId)
  if (index !== -1) {
    documents[index] = { ...document, userId }
    writeData(STORAGE_KEYS.DOCUMENTS, documents)
  }
  return document
}

export async function deleteDocument(userId: string, id: string): Promise<boolean> {
  const documents = readData<UserDocument & { userId: string }>(STORAGE_KEYS.DOCUMENTS)
  const filteredDocuments = documents.filter((d) => !(d.id === id && d.userId === userId))
  return writeData(STORAGE_KEYS.DOCUMENTS, filteredDocuments)
}

// Verification code functions
export async function getVerificationCodes(): Promise<VerificationCode[]> {
  return readData<VerificationCode>(STORAGE_KEYS.VERIFICATION_CODES)
}

export async function createVerificationCode(code: VerificationCode): Promise<VerificationCode> {
  const codes = await getVerificationCodes()
  // Remove any existing codes for this user and type
  const filteredCodes = codes.filter((c) => !(c.userId === code.userId && c.type === code.type))
  filteredCodes.push(code)
  writeData(STORAGE_KEYS.VERIFICATION_CODES, filteredCodes)
  return code
}

export async function verifyCode(userId: string, code: string, type: "password_reset"): Promise<boolean> {
  const codes = await getVerificationCodes()
  const now = new Date()

  // Find the code
  const verificationCode = codes.find(
    (c) => c.userId === userId && c.code === code && c.type === type && new Date(c.expiresAt) > now,
  )

  if (verificationCode) {
    // Remove the code after verification
    const updatedCodes = codes.filter((c) => !(c.userId === userId && c.type === type))
    writeData(STORAGE_KEYS.VERIFICATION_CODES, updatedCodes)
    return true
  }

  return false
}

export async function findUserByPhone(phone: string): Promise<UserCredentials | null> {
  const users = await getUsers()
  const profiles = await getProfiles()

  for (const profile of profiles) {
    if (profile.phone === phone) {
      const user = users.find((u) => u.id === profile.id)
      if (user) {
        return user
      }
    }
  }

  return null
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  const users = await getUsers()
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    return false
  }

  // Update the password
  users[userIndex].password = newPassword
  return writeData(STORAGE_KEYS.USERS, users)
}

// Generate random data for demo purposes
export async function generateRandomData(userId: string): Promise<void> {
  // Check if user already has data
  const existingAppointments = await getAppointmentsForUser(userId)
  const existingHealthData = await getHealthDataForUser(userId)
  const existingMedications = await getMedicationsForUser(userId)
  const existingDocuments = await getDocumentsForUser(userId)

  // Only generate data if the user doesn't have any
  if (
    existingAppointments.length > 0 ||
    existingHealthData.bloodPressure.length > 0 ||
    existingMedications.length > 0 ||
    existingDocuments.length > 0
  ) {
    console.log("User already has data, skipping random data generation")
    return
  }

  // Generate random appointments
  const now = new Date()
  const appointments: (UserAppointment & { userId: string })[] = []

  // Kenyan hospitals with their associated doctors
  const hospitals = [
    {
      name: "Kenyatta National Hospital",
      location: "Hospital Road, Nairobi",
      doctors: ["Dr. Wanjiku Kamau", "Dr. Omondi Ochieng", "Dr. Njeri Mwangi"],
    },
    {
      name: "Nairobi Hospital",
      location: "Argwings Kodhek Road, Nairobi",
      doctors: ["Dr. Kipchoge Kipruto", "Dr. Akinyi Otieno"],
    },
    {
      name: "Aga Khan University Hospital",
      location: "3rd Parklands Avenue, Nairobi",
      doctors: ["Dr. Muthoni Kariuki", "Dr. Otieno Odinga"],
    },
    {
      name: "Moi Teaching and Referral Hospital",
      location: "Nandi Road, Eldoret",
      doctors: ["Dr. Wambui Gathoni", "Dr. James Maina"],
    },
    {
      name: "Coast General Hospital",
      location: "Moi Avenue, Mombasa",
      doctors: ["Dr. Hassan Ali", "Dr. Fatuma Omar"],
    },
  ]

  // Past appointment (completed)
  const pastDate = new Date(now)
  pastDate.setDate(pastDate.getDate() - 14)
  const pastHospital = hospitals[Math.floor(Math.random() * hospitals.length)]
  const pastDoctor = pastHospital.doctors[Math.floor(Math.random() * pastHospital.doctors.length)]
  appointments.push({
    id: crypto.randomUUID(),
    userId,
    title: "General Checkup",
    doctorName: pastDoctor,
    location: pastHospital.name + ", " + pastHospital.location,
    date: pastDate.toISOString(),
    notes: "Annual physical examination",
    completed: true,
  })

  // Upcoming appointments
  const upcomingDate1 = new Date(now)
  upcomingDate1.setDate(upcomingDate1.getDate() + 7)
  const upcomingHospital1 = hospitals[Math.floor(Math.random() * hospitals.length)]
  const upcomingDoctor1 = upcomingHospital1.doctors[Math.floor(Math.random() * upcomingHospital1.doctors.length)]
  appointments.push({
    id: crypto.randomUUID(),
    userId,
    title: "Dental Cleaning",
    doctorName: upcomingDoctor1,
    location: upcomingHospital1.name + ", " + upcomingHospital1.location,
    date: upcomingDate1.toISOString(),
    completed: false,
  })

  const upcomingDate2 = new Date(now)
  upcomingDate2.setDate(upcomingDate2.getDate() + 21)
  const upcomingHospital2 = hospitals[Math.floor(Math.random() * hospitals.length)]
  const upcomingDoctor2 = upcomingHospital2.doctors[Math.floor(Math.random() * upcomingHospital2.doctors.length)]
  appointments.push({
    id: crypto.randomUUID(),
    userId,
    title: "Eye Examination",
    doctorName: upcomingDoctor2,
    location: upcomingHospital2.name + ", " + upcomingHospital2.location,
    date: upcomingDate2.toISOString(),
    notes: "Bring current glasses",
    completed: false,
  })

  // Save appointments
  const existingAppointmentsAll = readData<UserAppointment & { userId: string }>(STORAGE_KEYS.APPOINTMENTS)
  const existingAppointmentsFiltered = existingAppointmentsAll.filter((a) => a.userId !== userId)
  writeData(STORAGE_KEYS.APPOINTMENTS, [...existingAppointmentsFiltered, ...appointments])
}

// Export the hospital-doctor mapping for use in the appointment form
export const getHospitalsWithDoctors = () => {
  return [
    {
      name: "Kenyatta National Hospital",
      location: "Hospital Road, Nairobi",
      doctors: ["Dr. Wanjiku Kamau", "Dr. Omondi Ochieng", "Dr. Njeri Mwangi", "Dr. Kimani Njoroge", "Dr. Auma Otieno"],
    },
    {
      name: "Nairobi Hospital",
      location: "Argwings Kodhek Road, Nairobi",
      doctors: ["Dr. Kipchoge Kipruto", "Dr. Akinyi Otieno", "Dr. Muthoni Wangari", "Dr. Juma Hassan"],
    },
    {
      name: "Aga Khan University Hospital",
      location: "3rd Parklands Avenue, Nairobi",
      doctors: ["Dr. Muthoni Kariuki", "Dr. Otieno Odinga", "Dr. Fatuma Omar", "Dr. Ahmed Ali", "Dr. Zipporah Wekesa"],
    },
    {
      name: "Moi Teaching and Referral Hospital",
      location: "Nandi Road, Eldoret",
      doctors: ["Dr. Wambui Gathoni", "Dr. James Maina", "Dr. Chebet Kiptoo", "Dr. Kipchumba Sang"],
    },
    {
      name: "Coast General Hospital",
      location: "Moi Avenue, Mombasa",
      doctors: ["Dr. Hassan Ali", "Dr. Fatuma Omar", "Dr. Salim Mohammed", "Dr. Amina Hussein"],
    },
    {
      name: "Gertrude's Children's Hospital",
      location: "Muthaiga Road, Nairobi",
      doctors: ["Dr. Sarah Kimani", "Dr. Peter Oduor", "Dr. Jane Wanjiru", "Dr. Michael Omondi"],
    },
    {
      name: "MP Shah Hospital",
      location: "Shivachi Road, Nairobi",
      doctors: ["Dr. Amina Hussein", "Dr. David Njoroge", "Dr. Esther Wambui", "Dr. Rajesh Patel"],
    },
    {
      name: "Karen Hospital",
      location: "Karen Road, Nairobi",
      doctors: ["Dr. Elizabeth Wangari", "Dr. John Kamau", "Dr. Betty Chepkorir", "Dr. Samuel Mwangi"],
    },
    {
      name: "Kisumu County Referral Hospital",
      location: "Kisumu-Kakamega Road, Kisumu",
      doctors: ["Dr. Onyango Opiyo", "Dr. Achieng Awuor", "Dr. Okoth Omondi", "Dr. Adhiambo Akinyi"],
    },
    {
      name: "Nakuru County Referral Hospital",
      location: "Kenyatta Avenue, Nakuru",
      doctors: ["Dr. Kipkorir Sang", "Dr. Chepkoech Jemutai", "Dr. Kiprop Kibet", "Dr. Jelagat Cherono"],
    },
    {
      name: "Machakos Level 5 Hospital",
      location: "Machakos Town, Machakos",
      doctors: ["Dr. Mutuku Mwende", "Dr. Muthama Nzisa", "Dr. Kioko Mueni", "Dr. Nduku Musyoka"],
    },
    {
      name: "Nyeri County Referral Hospital",
      location: "Nyeri Town, Nyeri",
      doctors: ["Dr. Wachira Mwangi", "Dr. Nyawira Wanjiku", "Dr. Gichuki Nderitu", "Dr. Wairimu Kamau"],
    },
  ]
}

