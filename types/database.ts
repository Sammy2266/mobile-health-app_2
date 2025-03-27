// Database types

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  age?: number
  gender?: string
  height?: number
  weight?: number
  bloodType?: string
  allergies?: string[]
  medications?: string[]
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  profilePicture?: string
  userId?: string // Added for database relations
}

export interface UserSettings {
  theme: "light" | "dark" | "system"
  notifications: {
    appointments: boolean
    medications: boolean
    healthTips: boolean
    updates: boolean
  }
  privacySettings: {
    shareData: boolean
    anonymousAnalytics: boolean
  }
  language: string
  userId?: string // Added for database relations
}

export interface UserAppointment {
  id: string
  title: string
  doctorName: string
  location: string
  date: string // ISO string
  notes?: string
  completed: boolean
  userId?: string // Added for database relations
}

export interface UserHealthData {
  bloodPressure: Array<{
    date: string // ISO string
    systolic: number
    diastolic: number
  }>
  heartRate: Array<{
    date: string // ISO string
    value: number
  }>
  weight: Array<{
    date: string // ISO string
    value: number
  }>
  sleep: Array<{
    date: string // ISO string
    hours: number
    quality: "poor" | "fair" | "good" | "excellent"
  }>
  userId?: string // Added for database relations
}

export interface UserMedication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string // ISO string
  endDate?: string // ISO string
  instructions?: string
  reminderEnabled: boolean
  reminderTimes: string[] // Array of times in 24h format, e.g. "08:00"
  userId?: string // Added for database relations
}

export interface UserDocument {
  id: string
  title: string
  type: "report" | "prescription" | "lab_result" | "other"
  date: string // ISO string
  fileUrl?: string
  notes?: string
  userId?: string // Added for database relations
}

export interface UserCredentials {
  id: string
  username: string
  email: string
  password: string // In a real app, this would be hashed
  createdAt: string // ISO string
}

export interface VerificationCode {
  userId: string
  code: string
  expiresAt: string // ISO string
  type: "password_reset"
}

// Default values
export const defaultSettings: UserSettings = {
  theme: "system",
  notifications: {
    appointments: true,
    medications: true,
    healthTips: true,
    updates: true,
  },
  privacySettings: {
    shareData: false,
    anonymousAnalytics: true,
  },
  language: "en",
}

export const defaultProfile: UserProfile = {
  id: "",
  name: "",
  email: "",
}

