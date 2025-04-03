// This file simulates a connection to MS Access database
// In a real implementation, you would use a library like 'node-adodb' or similar

import fs from "fs"
import path from "path"
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

// Simulated database file paths (in a real app, these would be MS Access .accdb files)
const DB_DIR = path.join(process.cwd(), "data")
const USERS_DB = path.join(DB_DIR, "users.json")
const PROFILES_DB = path.join(DB_DIR, "profiles.json")
const SETTINGS_DB = path.join(DB_DIR, "settings.json")
const APPOINTMENTS_DB = path.join(DB_DIR, "appointments.json")
const HEALTH_DATA_DB = path.join(DB_DIR, "health_data.json")
const MEDICATIONS_DB = path.join(DB_DIR, "medications.json")
const DOCUMENTS_DB = path.join(DB_DIR, "documents.json")
const VERIFICATION_CODES_DB = path.join(DB_DIR, "verification_codes.json")

// Initialize database files if they don't exist
function initializeDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }

  if (!fs.existsSync(USERS_DB)) {
    fs.writeFileSync(USERS_DB, JSON.stringify([]))
  }

  if (!fs.existsSync(PROFILES_DB)) {
    fs.writeFileSync(PROFILES_DB, JSON.stringify([]))
  }

  if (!fs.existsSync(SETTINGS_DB)) {
    fs.writeFileSync(SETTINGS_DB, JSON.stringify([]))
  }

  if (!fs.existsSync(APPOINTMENTS_DB)) {
    fs.writeFileSync(APPOINTMENTS_DB, JSON.stringify([]))
  }

  if (!fs.existsSync(HEALTH_DATA_DB)) {
    fs.writeFileSync(HEALTH_DATA_DB, JSON.stringify([]))
  }

  if (!fs.existsSync(MEDICATIONS_DB)) {
    fs.writeFileSync(MEDICATIONS_DB, JSON.stringify([]))
  }

  if (!fs.existsSync(DOCUMENTS_DB)) {
    fs.writeFileSync(DOCUMENTS_DB, JSON.stringify([]))
  }

  if (!fs.existsSync(VERIFICATION_CODES_DB)) {
    fs.writeFileSync(VERIFICATION_CODES_DB, JSON.stringify([]))
  }
}

// Generic read function
function readData<T>(filePath: string): T[] {
  try {
    const data = fs.readFileSync(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading from ${filePath}:`, error)
    return []
  }
}

// Generic write function
function writeData<T>(filePath: string, data: T[]): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error)
    return false
  }
}

// User functions
export async function getUsers(): Promise<UserCredentials[]> {
  initializeDatabase()
  return readData<UserCredentials>(USERS_DB)
}

export async function getUserById(id: string): Promise<UserCredentials | null> {
  const users = await getUsers()
  return users.find((user) => user.id === id) || null
}

export async function getUserByEmail(email: string): Promise<UserCredentials | null> {
  const users = await getUsers()
  return users.find((user) => user.email === email) || null
}

// Add this function to check for username uniqueness
export async function getUserByUsername(username: string): Promise<UserCredentials | null> {
  const users = await getUsers()
  return users.find((user) => user.username === username) || null
}

export async function createUser(user: UserCredentials): Promise<UserCredentials> {
  const users = await getUsers()
  users.push(user)
  writeData(USERS_DB, users)
  return user
}

export async function updateUser(user: UserCredentials): Promise<UserCredentials> {
  const users = await getUsers()
  const index = users.findIndex((u) => u.id === user.id)
  if (index !== -1) {
    users[index] = user
    writeData(USERS_DB, users)
  }
  return user
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getUsers()
  const filteredUsers = users.filter((user) => user.id !== id)
  return writeData(USERS_DB, filteredUsers)
}

// Profile functions
export async function getProfiles(): Promise<UserProfile[]> {
  initializeDatabase()
  return readData<UserProfile>(PROFILES_DB)
}

export async function getProfileById(id: string): Promise<UserProfile | null> {
  const profiles = await getProfiles()
  return profiles.find((profile) => profile.id === id) || null
}

export async function createProfile(profile: UserProfile): Promise<UserProfile> {
  const profiles = await getProfiles()
  profiles.push(profile)
  writeData(PROFILES_DB, profiles)
  return profile
}

export async function updateProfile(profile: UserProfile): Promise<UserProfile> {
  const profiles = await getProfiles()
  const index = profiles.findIndex((p) => p.id === profile.id)
  if (index !== -1) {
    profiles[index] = profile
    writeData(PROFILES_DB, profiles)
  } else {
    // If profile doesn't exist, create it
    profiles.push(profile)
    writeData(PROFILES_DB, profiles)
  }
  return profile
}

export async function deleteProfile(id: string): Promise<boolean> {
  const profiles = await getProfiles()
  const filteredProfiles = profiles.filter((profile) => profile.id !== id)
  return writeData(PROFILES_DB, filteredProfiles)
}

// Settings functions
export async function getSettingsForUser(userId: string): Promise<UserSettings> {
  initializeDatabase()
  const settings = readData<UserSettings & { userId: string }>(SETTINGS_DB)
  const userSettings = settings.find((s) => s.userId === userId)
  if (!userSettings) {
    // Create default settings if they don't exist
    const newSettings = { ...defaultSettings, userId }
    settings.push(newSettings)
    writeData(SETTINGS_DB, settings)
    return newSettings
  }
  return userSettings
}

export async function updateSettings(userId: string, settings: UserSettings): Promise<UserSettings> {
  const allSettings = readData<UserSettings & { userId: string }>(SETTINGS_DB)
  const index = allSettings.findIndex((s) => s.userId === userId)
  const updatedSettings = { ...settings, userId }

  if (index !== -1) {
    allSettings[index] = updatedSettings
  } else {
    allSettings.push(updatedSettings)
  }

  writeData(SETTINGS_DB, allSettings)
  return updatedSettings
}

// Appointments functions
export async function getAppointmentsForUser(userId: string): Promise<UserAppointment[]> {
  initializeDatabase()
  const appointments = readData<UserAppointment & { userId: string }>(APPOINTMENTS_DB)
  return appointments.filter((a) => a.userId === userId)
}

export async function createAppointment(userId: string, appointment: UserAppointment): Promise<UserAppointment> {
  const appointments = readData<UserAppointment & { userId: string }>(APPOINTMENTS_DB)
  const newAppointment = { ...appointment, userId }
  appointments.push(newAppointment)
  writeData(APPOINTMENTS_DB, appointments)
  return newAppointment
}

export async function updateAppointment(userId: string, appointment: UserAppointment): Promise<UserAppointment> {
  const appointments = readData<UserAppointment & { userId: string }>(APPOINTMENTS_DB)
  const index = appointments.findIndex((a) => a.id === appointment.id && a.userId === userId)
  if (index !== -1) {
    appointments[index] = { ...appointment, userId }
    writeData(APPOINTMENTS_DB, appointments)
  }
  return appointment
}

export async function deleteAppointment(userId: string, id: string): Promise<boolean> {
  const appointments = readData<UserAppointment & { userId: string }>(APPOINTMENTS_DB)
  const filteredAppointments = appointments.filter((a) => !(a.id === id && a.userId === userId))
  return writeData(APPOINTMENTS_DB, filteredAppointments)
}

// Health data functions
export async function getHealthDataForUser(userId: string): Promise<UserHealthData> {
  initializeDatabase()
  const healthData = readData<UserHealthData & { userId: string }>(HEALTH_DATA_DB)
  const userData = healthData.find((d) => d.userId === userId)
  if (!userData) {
    return {
      userId,
      bloodPressure: [],
      heartRate: [],
      weight: [],
      sleep: [],
    }
  }
  return userData
}

export async function updateHealthData(userId: string, data: UserHealthData): Promise<UserHealthData> {
  const healthData = readData<UserHealthData & { userId: string }>(HEALTH_DATA_DB)
  const index = healthData.findIndex((d) => d.userId === userId)
  const updatedData = { ...data, userId }

  if (index !== -1) {
    healthData[index] = updatedData
  } else {
    healthData.push(updatedData)
  }

  writeData(HEALTH_DATA_DB, healthData)
  return updatedData
}

// Medications functions
export async function getMedicationsForUser(userId: string): Promise<UserMedication[]> {
  initializeDatabase()
  const medications = readData<UserMedication & { userId: string }>(MEDICATIONS_DB)
  return medications.filter((m) => m.userId === userId)
}

export async function createMedication(userId: string, medication: UserMedication): Promise<UserMedication> {
  const medications = readData<UserMedication & { userId: string }>(MEDICATIONS_DB)
  const newMedication = { ...medication, userId }
  medications.push(newMedication)
  writeData(MEDICATIONS_DB, medications)
  return newMedication
}

export async function updateMedication(userId: string, medication: UserMedication): Promise<UserMedication> {
  const medications = readData<UserMedication & { userId: string }>(MEDICATIONS_DB)
  const index = medications.findIndex((m) => m.id === medication.id && m.userId === userId)
  if (index !== -1) {
    medications[index] = { ...medication, userId }
    writeData(MEDICATIONS_DB, medications)
  }
  return medication
}

export async function deleteMedication(userId: string, id: string): Promise<boolean> {
  const medications = readData<UserMedication & { userId: string }>(MEDICATIONS_DB)
  const filteredMedications = medications.filter((m) => !(m.id === id && m.userId === userId))
  return writeData(MEDICATIONS_DB, filteredMedications)
}

// Documents functions
export async function getDocumentsForUser(userId: string): Promise<UserDocument[]> {
  initializeDatabase()
  const documents = readData<UserDocument & { userId: string }>(DOCUMENTS_DB)
  return documents.filter((d) => d.userId === userId)
}

export async function createDocument(userId: string, document: UserDocument): Promise<UserDocument> {
  const documents = readData<UserDocument & { userId: string }>(DOCUMENTS_DB)
  const newDocument = { ...document, userId }
  documents.push(newDocument)
  writeData(DOCUMENTS_DB, documents)
  return newDocument
}

export async function updateDocument(userId: string, document: UserDocument): Promise<UserDocument> {
  const documents = readData<UserDocument & { userId: string }>(DOCUMENTS_DB)
  const index = documents.findIndex((d) => d.id === document.id && d.userId === userId)
  if (index !== -1) {
    documents[index] = { ...document, userId }
    writeData(DOCUMENTS_DB, documents)
  }
  return document
}

export async function deleteDocument(userId: string, id: string): Promise<boolean> {
  const documents = readData<UserDocument & { userId: string }>(DOCUMENTS_DB)
  const filteredDocuments = documents.filter((d) => !(d.id === id && d.userId === userId))
  return writeData(DOCUMENTS_DB, filteredDocuments)
}

// Verification code functions
export async function getVerificationCodes(): Promise<VerificationCode[]> {
  initializeDatabase()
  return readData<VerificationCode>(VERIFICATION_CODES_DB)
}

export async function createVerificationCode(code: VerificationCode): Promise<VerificationCode> {
  const codes = await getVerificationCodes()
  // Remove any existing codes for this user and type
  const filteredCodes = codes.filter((c) => !(c.userId === code.userId && c.type === code.type))
  filteredCodes.push(code)
  writeData(VERIFICATION_CODES_DB, filteredCodes)
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
    writeData(VERIFICATION_CODES_DB, updatedCodes)
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
  return writeData(USERS_DB, users)
}

// Generate random data for demo purposes
export async function generateRandomData(userId: string): Promise<void> {
  // Generate random appointments
  const now = new Date()
  const appointments: (UserAppointment & { userId: string })[] = []

  // Kenyan hospitals
  const hospitals = [
    { name: "Kenyatta National Hospital", location: "Hospital Road, Nairobi" },
    { name: "Nairobi Hospital", location: "Argwings Kodhek Road, Nairobi" },
    { name: "Aga Khan University Hospital", location: "3rd Parklands Avenue, Nairobi" },
    { name: "Moi Teaching and Referral Hospital", location: "Nandi Road, Eldoret" },
    { name: "Coast General Hospital", location: "Moi Avenue, Mombasa" },
    { name: "Gertrude's Children's Hospital", location: "Muthaiga Road, Nairobi" },
    { name: "MP Shah Hospital", location: "Shivachi Road, Nairobi" },
    { name: "Karen Hospital", location: "Karen Road, Nairobi" },
  ]

  // Kenyan doctor names
  const doctors = [
    "Dr. Wanjiku Kamau",
    "Dr. Omondi Ochieng",
    "Dr. Njeri Mwangi",
    "Dr. Kipchoge Kipruto",
    "Dr. Akinyi Otieno",
    "Dr. Muthoni Kariuki",
    "Dr. Otieno Odinga",
    "Dr. Wambui Gathoni",
  ]

  // Past appointment (completed)
  const pastDate = new Date(now)
  pastDate.setDate(pastDate.getDate() - 14)
  const pastHospital = hospitals[Math.floor(Math.random() * hospitals.length)]
  appointments.push({
    id: crypto.randomUUID(),
    userId,
    title: "General Checkup",
    doctorName: doctors[Math.floor(Math.random() * doctors.length)],
    location: pastHospital.name + ", " + pastHospital.location,
    date: pastDate.toISOString(),
    notes: "Annual physical examination",
    completed: true,
  })

  // Upcoming appointments
  const upcomingDate1 = new Date(now)
  upcomingDate1.setDate(upcomingDate1.getDate() + 7)
  const upcomingHospital1 = hospitals[Math.floor(Math.random() * hospitals.length)]
  appointments.push({
    id: crypto.randomUUID(),
    userId,
    title: "Dental Cleaning",
    doctorName: doctors[Math.floor(Math.random() * doctors.length)],
    location: upcomingHospital1.name + ", " + upcomingHospital1.location,
    date: upcomingDate1.toISOString(),
    completed: false,
  })

  const upcomingDate2 = new Date(now)
  upcomingDate2.setDate(upcomingDate2.getDate() + 21)
  const upcomingHospital2 = hospitals[Math.floor(Math.random() * hospitals.length)]
  appointments.push({
    id: crypto.randomUUID(),
    userId,
    title: "Eye Examination",
    doctorName: doctors[Math.floor(Math.random() * doctors.length)],
    location: upcomingHospital2.name + ", " + upcomingHospital2.location,
    date: upcomingDate2.toISOString(),
    notes: "Bring current glasses",
    completed: false,
  })

  // Save appointments
  const existingAppointments = readData<UserAppointment & { userId: string }>(APPOINTMENTS_DB)
  writeData(APPOINTMENTS_DB, [...existingAppointments, ...appointments])

  // Generate health data
  const healthData: UserHealthData & { userId: string } = {
    userId,
    bloodPressure: [],
    heartRate: [],
    weight: [],
    sleep: [],
  }

  // Generate data for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString()

    // Blood pressure (normal range with some variation)
    healthData.bloodPressure.push({
      date: dateStr,
      systolic: Math.floor(Math.random() * 20 + 110), // 110-130
      diastolic: Math.floor(Math.random() * 15 + 70), // 70-85
    })

    // Heart rate (normal range with some variation)
    healthData.heartRate.push({
      date: dateStr,
      value: Math.floor(Math.random() * 30 + 60), // 60-90
    })

    // Weight (consistent with small variations)
    healthData.weight.push({
      date: dateStr,
      value: Math.floor(Math.random() * 2 * 10 + 650) / 10, // 65.0-66.9
    })

    // Sleep data
    const sleepHours = Math.floor(Math.random() * 3 * 10 + 60) / 10 // 6.0-8.9
    let quality: "poor" | "fair" | "good" | "excellent"

    if (sleepHours < 6.5) quality = "poor"
    else if (sleepHours < 7.5) quality = "fair"
    else if (sleepHours < 8.5) quality = "good"
    else quality = "excellent"

    healthData.sleep.push({
      date: dateStr,
      hours: sleepHours,
      quality,
    })
  }

  // Save health data
  const existingHealthData = readData<UserHealthData & { userId: string }>(HEALTH_DATA_DB)
  const filteredHealthData = existingHealthData.filter((d) => d.userId !== userId)
  writeData(HEALTH_DATA_DB, [...filteredHealthData, healthData])

  // Generate medications
  const medications: (UserMedication & { userId: string })[] = []

  // Medication 1
  const startDate1 = new Date(now)
  startDate1.setDate(startDate1.getDate() - 30)

  const endDate1 = new Date(now)
  endDate1.setDate(endDate1.getDate() + 60)

  medications.push({
    id: crypto.randomUUID(),
    userId,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    startDate: startDate1.toISOString(),
    endDate: endDate1.toISOString(),
    instructions: "Take in the morning with food",
    reminderEnabled: true,
    reminderTimes: ["08:00"],
  })

  // Medication 2
  const startDate2 = new Date(now)
  startDate2.setDate(startDate2.getDate() - 15)

  medications.push({
    id: crypto.randomUUID(),
    userId,
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    startDate: startDate2.toISOString(),
    instructions: "Take with meals",
    reminderEnabled: true,
    reminderTimes: ["08:00", "20:00"],
  })

  // Medication 3
  const startDate3 = new Date(now)
  startDate3.setDate(startDate3.getDate() - 7)

  const endDate3 = new Date(now)
  endDate3.setDate(endDate3.getDate() + 7)

  medications.push({
    id: crypto.randomUUID(),
    userId,
    name: "Amoxicillin",
    dosage: "500mg",
    frequency: "Three times daily",
    startDate: startDate3.toISOString(),
    endDate: endDate3.toISOString(),
    instructions: "Take until completed, even if feeling better",
    reminderEnabled: true,
    reminderTimes: ["08:00", "14:00", "20:00"],
  })

  // Save medications
  const existingMedications = readData<UserMedication & { userId: string }>(MEDICATIONS_DB)
  writeData(MEDICATIONS_DB, [...existingMedications, ...medications])

  // Generate documents
  const documents: (UserDocument & { userId: string })[] = []

  // Document 1
  const date1 = new Date(now)
  date1.setDate(date1.getDate() - 30)

  documents.push({
    id: crypto.randomUUID(),
    userId,
    title: "Annual Physical Examination",
    type: "report",
    date: date1.toISOString(),
    notes: "Routine annual physical examination report",
  })

  // Document 2
  const date2 = new Date(now)
  date2.setDate(date2.getDate() - 15)

  documents.push({
    id: crypto.randomUUID(),
    userId,
    title: "Blood Test Results",
    type: "lab_result",
    date: date2.toISOString(),
    notes: "Complete blood count and metabolic panel",
  })

  // Document 3
  const date3 = new Date(now)
  date3.setDate(date3.getDate() - 7)

  documents.push({
    id: crypto.randomUUID(),
    userId,
    title: "Prescription for Amoxicillin",
    type: "prescription",
    date: date3.toISOString(),
    notes: "For respiratory infection",
  })

  // Save documents
  const existingDocuments = readData<UserDocument & { userId: string }>(DOCUMENTS_DB)
  writeData(DOCUMENTS_DB, [...existingDocuments, ...documents])
}

