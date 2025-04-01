// This file implements database operations using Prisma
import { PrismaClient } from "@prisma/client"
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

// Create a singleton instance of PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// User functions
export async function getUsers(): Promise<UserCredentials[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      createdAt: true,
    },
  })

  return users.map((user) => ({
    id: user.id,
    username: user.name || user.email.split("@")[0], // Fallback username
    email: user.email,
    password: user.password,
    createdAt: user.createdAt.toISOString(),
  }))
}

export async function getUserById(id: string): Promise<UserCredentials | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      createdAt: true,
    },
  })

  if (!user) return null

  return {
    id: user.id,
    username: user.name || user.email.split("@")[0], // Fallback username
    email: user.email,
    password: user.password,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function getUserByEmail(email: string): Promise<UserCredentials | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      createdAt: true,
    },
  })

  if (!user) return null

  return {
    id: user.id,
    username: user.name || user.email.split("@")[0], // Fallback username
    email: user.email,
    password: user.password,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function getUserByUsername(username: string): Promise<UserCredentials | null> {
  // Since we don't have a dedicated username field, we'll check the name field
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ name: username }, { email: { startsWith: username + "@" } }],
    },
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      createdAt: true,
    },
  })

  if (!user) return null

  return {
    id: user.id,
    username: user.name || user.email.split("@")[0], // Fallback username
    email: user.email,
    password: user.password,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function createUser(user: UserCredentials): Promise<UserCredentials> {
  const newUser = await prisma.user.create({
    data: {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.username,
      createdAt: new Date(user.createdAt),
    },
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      createdAt: true,
    },
  })

  return {
    id: newUser.id,
    username: newUser.name || newUser.email.split("@")[0],
    email: newUser.email,
    password: newUser.password,
    createdAt: newUser.createdAt.toISOString(),
  }
}

export async function updateUser(user: UserCredentials): Promise<UserCredentials> {
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      email: user.email,
      password: user.password,
      name: user.username,
    },
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      createdAt: true,
    },
  })

  return {
    id: updatedUser.id,
    username: updatedUser.name || updatedUser.email.split("@")[0],
    email: updatedUser.email,
    password: updatedUser.password,
    createdAt: updatedUser.createdAt.toISOString(),
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await prisma.user.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

// Profile functions
export async function getProfiles(): Promise<UserProfile[]> {
  const profiles = await prisma.profile.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })

  return profiles.map((profile) => ({
    id: profile.id,
    name: profile.user.name || "",
    email: profile.user.email,
    phone: profile.phoneNumber || undefined,
    age: profile.dateOfBirth
      ? Math.floor((new Date().getTime() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : undefined,
    gender: profile.gender || undefined,
    height: profile.height || undefined,
    weight: undefined, // Weight is stored in HealthData
    bloodType: profile.bloodType || undefined,
    allergies: profile.allergies || [],
    medications: [], // This would need to be fetched separately
    emergencyContact: profile.emergencyContact ? JSON.parse(profile.emergencyContact) : undefined,
    profilePicture: undefined, // Not stored in the database
    userId: profile.userId,
  }))
}

export async function getProfileById(id: string): Promise<UserProfile | null> {
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })

  if (!profile) {
    // Try to find by userId instead
    const profileByUserId = await prisma.profile.findUnique({
      where: { userId: id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!profileByUserId) return null

    return {
      id: profileByUserId.id,
      name: profileByUserId.user.name || "",
      email: profileByUserId.user.email,
      phone: profileByUserId.phoneNumber || undefined,
      age: profileByUserId.dateOfBirth
        ? Math.floor(
            (new Date().getTime() - new Date(profileByUserId.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
          )
        : undefined,
      gender: profileByUserId.gender || undefined,
      height: profileByUserId.height || undefined,
      weight: undefined, // Weight is stored in HealthData
      bloodType: profileByUserId.bloodType || undefined,
      allergies: profileByUserId.allergies || [],
      medications: [], // This would need to be fetched separately
      emergencyContact: profileByUserId.emergencyContact ? JSON.parse(profileByUserId.emergencyContact) : undefined,
      profilePicture: undefined, // Not stored in the database
      userId: profileByUserId.userId,
    }
  }

  return {
    id: profile.id,
    name: profile.user.name || "",
    email: profile.user.email,
    phone: profile.phoneNumber || undefined,
    age: profile.dateOfBirth
      ? Math.floor((new Date().getTime() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : undefined,
    gender: profile.gender || undefined,
    height: profile.height || undefined,
    weight: undefined, // Weight is stored in HealthData
    bloodType: profile.bloodType || undefined,
    allergies: profile.allergies || [],
    medications: [], // This would need to be fetched separately
    emergencyContact: profile.emergencyContact ? JSON.parse(profile.emergencyContact) : undefined,
    profilePicture: undefined, // Not stored in the database
    userId: profile.userId,
  }
}

export async function createProfile(profile: UserProfile): Promise<UserProfile> {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: profile.userId || profile.id },
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Calculate date of birth from age if provided
  let dateOfBirth = undefined
  if (profile.age) {
    const date = new Date()
    date.setFullYear(date.getFullYear() - profile.age)
    dateOfBirth = date
  }

  const newProfile = await prisma.profile.create({
    data: {
      id: profile.id || crypto.randomUUID(),
      userId: profile.userId || profile.id,
      dateOfBirth,
      gender: profile.gender,
      height: profile.height,
      emergencyContact: profile.emergencyContact ? JSON.stringify(profile.emergencyContact) : null,
      phoneNumber: profile.phone,
      bloodType: profile.bloodType,
      allergies: profile.allergies || [],
      medicalConditions: [],
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })

  return {
    id: newProfile.id,
    name: newProfile.user.name || "",
    email: newProfile.user.email,
    phone: newProfile.phoneNumber || undefined,
    age: newProfile.dateOfBirth
      ? Math.floor((new Date().getTime() - new Date(newProfile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : undefined,
    gender: newProfile.gender || undefined,
    height: newProfile.height || undefined,
    weight: undefined, // Weight is stored in HealthData
    bloodType: newProfile.bloodType || undefined,
    allergies: newProfile.allergies || [],
    medications: [], // This would need to be fetched separately
    emergencyContact: newProfile.emergencyContact ? JSON.parse(newProfile.emergencyContact) : undefined,
    profilePicture: undefined, // Not stored in the database
    userId: newProfile.userId,
  }
}

export async function updateProfile(profile: UserProfile): Promise<UserProfile> {
  // Calculate date of birth from age if provided
  let dateOfBirth = undefined
  if (profile.age) {
    const date = new Date()
    date.setFullYear(date.getFullYear() - profile.age)
    dateOfBirth = date
  }

  try {
    const updatedProfile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        dateOfBirth,
        gender: profile.gender,
        height: profile.height,
        emergencyContact: profile.emergencyContact ? JSON.stringify(profile.emergencyContact) : null,
        phoneNumber: profile.phone,
        bloodType: profile.bloodType,
        allergies: profile.allergies || [],
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    return {
      id: updatedProfile.id,
      name: updatedProfile.user.name || "",
      email: updatedProfile.user.email,
      phone: updatedProfile.phoneNumber || undefined,
      age: updatedProfile.dateOfBirth
        ? Math.floor(
            (new Date().getTime() - new Date(updatedProfile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
          )
        : undefined,
      gender: updatedProfile.gender || undefined,
      height: updatedProfile.height || undefined,
      weight: undefined, // Weight is stored in HealthData
      bloodType: updatedProfile.bloodType || undefined,
      allergies: updatedProfile.allergies || [],
      medications: [], // This would need to be fetched separately
      emergencyContact: updatedProfile.emergencyContact ? JSON.parse(updatedProfile.emergencyContact) : undefined,
      profilePicture: undefined, // Not stored in the database
      userId: updatedProfile.userId,
    }
  } catch (error) {
    // If profile doesn't exist, create it
    return createProfile(profile)
  }
}

export async function deleteProfile(id: string): Promise<boolean> {
  try {
    await prisma.profile.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error("Error deleting profile:", error)
    return false
  }
}

// Settings functions
export async function getSettingsForUser(userId: string): Promise<UserSettings> {
  // Since we don't have a dedicated settings table, we'll use a combination of user and profile data
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return defaultSettings
  }

  // In a real implementation, you would have a settings table
  // For now, we'll return default settings
  return {
    ...defaultSettings,
    theme: "system", // Default theme
    language: "en", // Default language
  }
}

export async function updateSettings(userId: string, settings: UserSettings): Promise<UserSettings> {
  // In a real implementation, you would update a settings table
  // For now, we'll just return the settings
  return settings
}

// Appointments functions
export async function getAppointmentsForUser(userId: string): Promise<UserAppointment[]> {
  const appointments = await prisma.appointment.findMany({
    where: { userId },
  })

  return appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.title,
    doctorName: appointment.doctorName,
    location: appointment.location,
    date: appointment.date.toISOString(),
    notes: appointment.notes || undefined,
    completed: appointment.reminderSent, // Using reminderSent as a proxy for completed
    userId: appointment.userId,
  }))
}

export async function createAppointment(userId: string, appointment: UserAppointment): Promise<UserAppointment> {
  const newAppointment = await prisma.appointment.create({
    data: {
      id: appointment.id || crypto.randomUUID(),
      userId,
      title: appointment.title,
      doctorName: appointment.doctorName,
      location: appointment.location,
      type: "checkup", // Default type
      date: new Date(appointment.date),
      time: new Date(appointment.date).toLocaleTimeString(),
      notes: appointment.notes,
      reminder: true,
      reminderSent: appointment.completed,
    },
  })

  return {
    id: newAppointment.id,
    title: newAppointment.title,
    doctorName: newAppointment.doctorName,
    location: newAppointment.location,
    date: newAppointment.date.toISOString(),
    notes: newAppointment.notes || undefined,
    completed: newAppointment.reminderSent,
    userId: newAppointment.userId,
  }
}

export async function updateAppointment(userId: string, appointment: UserAppointment): Promise<UserAppointment> {
  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      title: appointment.title,
      doctorName: appointment.doctorName,
      location: appointment.location,
      date: new Date(appointment.date),
      time: new Date(appointment.date).toLocaleTimeString(),
      notes: appointment.notes,
      reminderSent: appointment.completed,
    },
  })

  return {
    id: updatedAppointment.id,
    title: updatedAppointment.title,
    doctorName: updatedAppointment.doctorName,
    location: updatedAppointment.location,
    date: updatedAppointment.date.toISOString(),
    notes: updatedAppointment.notes || undefined,
    completed: updatedAppointment.reminderSent,
    userId: updatedAppointment.userId,
  }
}

export async function deleteAppointment(userId: string, id: string): Promise<boolean> {
  try {
    await prisma.appointment.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return false
  }
}

// Health data functions
export async function getHealthDataForUser(userId: string): Promise<UserHealthData> {
  const healthData = await prisma.healthData.findMany({
    where: { userId },
  })

  // Group by type
  const bloodPressure = healthData
    .filter((data) => data.type === "bloodPressure" && data.systolic && data.diastolic)
    .map((data) => ({
      date: data.date.toISOString(),
      systolic: data.systolic!,
      diastolic: data.diastolic!,
    }))

  const heartRate = healthData
    .filter((data) => data.type === "heartRate" && data.heartRate)
    .map((data) => ({
      date: data.date.toISOString(),
      value: data.heartRate!,
    }))

  const weight = healthData
    .filter((data) => data.type === "weight" && data.weight)
    .map((data) => ({
      date: data.date.toISOString(),
      value: data.weight!,
    }))

  const sleep = healthData
    .filter((data) => data.type === "sleep" && data.sleepHours && data.sleepQuality)
    .map((data) => ({
      date: data.date.toISOString(),
      hours: data.sleepHours!,
      quality: data.sleepQuality as "poor" | "fair" | "good" | "excellent",
    }))

  return {
    userId,
    bloodPressure,
    heartRate,
    weight,
    sleep,
  }
}

export async function updateHealthData(userId: string, data: UserHealthData): Promise<UserHealthData> {
  // We'll handle this by creating new entries for each type of health data

  // Blood pressure
  for (const bp of data.bloodPressure) {
    await prisma.healthData.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        date: new Date(bp.date),
        type: "bloodPressure",
        systolic: bp.systolic,
        diastolic: bp.diastolic,
      },
    })
  }

  // Heart rate
  for (const hr of data.heartRate) {
    await prisma.healthData.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        date: new Date(hr.date),
        type: "heartRate",
        heartRate: hr.value,
      },
    })
  }

  // Weight
  for (const w of data.weight) {
    await prisma.healthData.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        date: new Date(w.date),
        type: "weight",
        weight: w.value,
      },
    })
  }

  // Sleep
  for (const s of data.sleep) {
    await prisma.healthData.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        date: new Date(s.date),
        type: "sleep",
        sleepHours: s.hours,
        sleepQuality: s.quality,
      },
    })
  }

  return data
}

// Medications functions
export async function getMedicationsForUser(userId: string): Promise<UserMedication[]> {
  const medications = await prisma.medication.findMany({
    where: { userId },
  })

  return medications.map((medication) => ({
    id: medication.id,
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    startDate: medication.startDate.toISOString(),
    endDate: medication.endDate?.toISOString(),
    instructions: medication.instructions || undefined,
    reminderEnabled: medication.reminder,
    reminderTimes: medication.timeOfDay,
    userId: medication.userId,
  }))
}

export async function createMedication(userId: string, medication: UserMedication): Promise<UserMedication> {
  const newMedication = await prisma.medication.create({
    data: {
      id: medication.id || crypto.randomUUID(),
      userId,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      timeOfDay: medication.reminderTimes,
      startDate: new Date(medication.startDate),
      endDate: medication.endDate ? new Date(medication.endDate) : null,
      instructions: medication.instructions,
      reminder: medication.reminderEnabled,
      reminderSent: false,
    },
  })

  return {
    id: newMedication.id,
    name: newMedication.name,
    dosage: newMedication.dosage,
    frequency: newMedication.frequency,
    startDate: newMedication.startDate.toISOString(),
    endDate: newMedication.endDate?.toISOString(),
    instructions: newMedication.instructions || undefined,
    reminderEnabled: newMedication.reminder,
    reminderTimes: newMedication.timeOfDay,
    userId: newMedication.userId,
  }
}

export async function updateMedication(userId: string, medication: UserMedication): Promise<UserMedication> {
  const updatedMedication = await prisma.medication.update({
    where: { id: medication.id },
    data: {
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      timeOfDay: medication.reminderTimes,
      startDate: new Date(medication.startDate),
      endDate: medication.endDate ? new Date(medication.endDate) : null,
      instructions: medication.instructions,
      reminder: medication.reminderEnabled,
    },
  })

  return {
    id: updatedMedication.id,
    name: updatedMedication.name,
    dosage: updatedMedication.dosage,
    frequency: updatedMedication.frequency,
    startDate: updatedMedication.startDate.toISOString(),
    endDate: updatedMedication.endDate?.toISOString(),
    instructions: updatedMedication.instructions || undefined,
    reminderEnabled: updatedMedication.reminder,
    reminderTimes: updatedMedication.timeOfDay,
    userId: updatedMedication.userId,
  }
}

export async function deleteMedication(userId: string, id: string): Promise<boolean> {
  try {
    await prisma.medication.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error("Error deleting medication:", error)
    return false
  }
}

// Documents functions
export async function getDocumentsForUser(userId: string): Promise<UserDocument[]> {
  const documents = await prisma.document.findMany({
    where: { userId },
  })

  return documents.map((document) => ({
    id: document.id,
    title: document.name,
    type: document.type as "report" | "prescription" | "lab_result" | "other",
    date: document.uploadDate.toISOString(),
    fileUrl: document.fileUrl,
    notes: document.notes || undefined,
    userId: document.userId,
  }))
}

export async function createDocument(userId: string, document: UserDocument): Promise<UserDocument> {
  const newDocument = await prisma.document.create({
    data: {
      id: document.id || crypto.randomUUID(),
      userId,
      name: document.title,
      type: document.type,
      fileUrl: document.fileUrl || "",
      fileSize: 0, // This would need to be calculated
      uploadDate: new Date(document.date),
      notes: document.notes,
    },
  })

  return {
    id: newDocument.id,
    title: newDocument.name,
    type: newDocument.type as "report" | "prescription" | "lab_result" | "other",
    date: newDocument.uploadDate.toISOString(),
    fileUrl: newDocument.fileUrl,
    notes: newDocument.notes || undefined,
    userId: newDocument.userId,
  }
}

export async function updateDocument(userId: string, document: UserDocument): Promise<UserDocument> {
  const updatedDocument = await prisma.document.update({
    where: { id: document.id },
    data: {
      name: document.title,
      type: document.type,
      fileUrl: document.fileUrl || "",
      uploadDate: new Date(document.date),
      notes: document.notes,
    },
  })

  return {
    id: updatedDocument.id,
    title: updatedDocument.name,
    type: updatedDocument.type as "report" | "prescription" | "lab_result" | "other",
    date: updatedDocument.uploadDate.toISOString(),
    fileUrl: updatedDocument.fileUrl,
    notes: updatedDocument.notes || undefined,
    userId: updatedDocument.userId,
  }
}

export async function deleteDocument(userId: string, id: string): Promise<boolean> {
  try {
    await prisma.document.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error("Error deleting document:", error)
    return false
  }
}

// Verification code functions
export async function getVerificationCodes(): Promise<VerificationCode[]> {
  // In a real implementation, you would have a verification codes table
  // For now, we'll return an empty array
  return []
}

export async function createVerificationCode(code: VerificationCode): Promise<VerificationCode> {
  // In a real implementation, you would create a verification code in the database
  // For now, we'll just return the code
  return code
}

export async function verifyCode(userId: string, code: string, type: "password_reset"): Promise<boolean> {
  // In a real implementation, you would verify the code in the database
  // For now, we'll just return true
  return true
}

export async function findUserByPhone(phone: string): Promise<UserCredentials | null> {
  const profile = await prisma.profile.findFirst({
    where: { phoneNumber: phone },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          createdAt: true,
        },
      },
    },
  })

  if (!profile || !profile.user) return null

  return {
    id: profile.user.id,
    username: profile.user.name || profile.user.email.split("@")[0],
    email: profile.user.email,
    password: profile.user.password,
    createdAt: profile.user.createdAt.toISOString(),
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    })
    return true
  } catch (error) {
    console.error("Error updating user password:", error)
    return false
  }
}

// Generate random data for demo purposes
export async function generateRandomData(userId: string): Promise<void> {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Generate random appointments
  const now = new Date()

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
  await prisma.appointment.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      title: "General Checkup",
      doctorName: doctors[Math.floor(Math.random() * doctors.length)],
      location: pastHospital.name + ", " + pastHospital.location,
      type: "checkup",
      date: pastDate,
      time: pastDate.toLocaleTimeString(),
      notes: "Annual physical examination",
      reminder: true,
      reminderSent: true,
    },
  })

  // Upcoming appointments
  const upcomingDate1 = new Date(now)
  upcomingDate1.setDate(upcomingDate1.getDate() + 7)
  const upcomingHospital1 = hospitals[Math.floor(Math.random() * hospitals.length)]
  await prisma.appointment.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      title: "Dental Cleaning",
      doctorName: doctors[Math.floor(Math.random() * doctors.length)],
      location: upcomingHospital1.name + ", " + upcomingHospital1.location,
      type: "dental",
      date: upcomingDate1,
      time: upcomingDate1.toLocaleTimeString(),
      reminder: true,
      reminderSent: false,
    },
  })

  const upcomingDate2 = new Date(now)
  upcomingDate2.setDate(upcomingDate2.getDate() + 21)
  const upcomingHospital2 = hospitals[Math.floor(Math.random() * hospitals.length)]
  await prisma.appointment.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      title: "Eye Examination",
      doctorName: doctors[Math.floor(Math.random() * doctors.length)],
      location: upcomingHospital2.name + ", " + upcomingHospital2.location,
      type: "vision",
      date: upcomingDate2,
      time: upcomingDate2.toLocaleTimeString(),
      notes: "Bring current glasses",
      reminder: true,
      reminderSent: false,
    },
  })

  // Generate health data
  // Generate data for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Blood pressure (normal range with some variation)
    await prisma.healthData.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        date,
        type: "bloodPressure",
        systolic: Math.floor(Math.random() * 20 + 110), // 110-130
        diastolic: Math.floor(Math.random() * 15 + 70), // 70-85
      },
    })

    // Heart rate (normal range with some variation)
    await prisma.healthData.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        date,
        type: "heartRate",
        heartRate: Math.floor(Math.random() * 30 + 60), // 60-90
      },
    })

    // Weight (consistent with small variations)
    await prisma.healthData.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        date,
        type: "weight",
        weight: Math.floor(Math.random() * 2 * 10 + 650) / 10, // 65.0-66.9
      },
    })

    // Sleep data
    const sleepHours = Math.floor(Math.random() * 3 * 10 + 60) / 10 // 6.0-8.9
    let quality: "poor" | "fair" | "good" | "excellent"

    if (sleepHours < 6.5) quality = "poor"
    else if (sleepHours < 7.5) quality = "fair"
    else if (sleepHours < 8.5) quality = "good"
    else quality = "excellent"

    await prisma.healthData.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        date,
        type: "sleep",
        sleepHours,
        sleepQuality: quality,
      },
    })
  }

  // Generate medications
  // Medication 1
  const startDate1 = new Date(now)
  startDate1.setDate(startDate1.getDate() - 30)

  const endDate1 = new Date(now)
  endDate1.setDate(endDate1.getDate() + 60)

  await prisma.medication.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      timeOfDay: ["08:00"],
      startDate: startDate1,
      endDate: endDate1,
      instructions: "Take in the morning with food",
      reminder: true,
      reminderSent: false,
    },
  })

  // Medication 2
  const startDate2 = new Date(now)
  startDate2.setDate(startDate2.getDate() - 15)

  await prisma.medication.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      timeOfDay: ["08:00", "20:00"],
      startDate: startDate2,
      instructions: "Take with meals",
      reminder: true,
      reminderSent: false,
    },
  })

  // Medication 3
  const startDate3 = new Date(now)
  startDate3.setDate(startDate3.getDate() - 7)

  const endDate3 = new Date(now)
  endDate3.setDate(endDate3.getDate() + 7)

  await prisma.medication.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "Three times daily",
      timeOfDay: ["08:00", "14:00", "20:00"],
      startDate: startDate3,
      endDate: endDate3,
      instructions: "Take until completed, even if feeling better",
      reminder: true,
      reminderSent: false,
    },
  })

  // Generate documents
  // Document 1
  const date1 = new Date(now)
  date1.setDate(date1.getDate() - 30)

  await prisma.document.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      name: "Annual Physical Examination",
      type: "report",
      fileUrl: "",
      fileSize: 0,
      uploadDate: date1,
      notes: "Routine annual physical examination report",
    },
  })

  // Document 2
  const date2 = new Date(now)
  date2.setDate(date2.getDate() - 15)

  await prisma.document.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      name: "Blood Test Results",
      type: "lab_result",
      fileUrl: "",
      fileSize: 0,
      uploadDate: date2,
      notes: "Complete blood count and metabolic panel",
    },
  })

  // Document 3
  const date3 = new Date(now)
  date3.setDate(date3.getDate() - 7)

  await prisma.document.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      name: "Prescription for Amoxicillin",
      type: "prescription",
      fileUrl: "",
      fileSize: 0,
      uploadDate: date3,
      notes: "For respiratory infection",
    },
  })
}

