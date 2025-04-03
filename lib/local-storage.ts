export function getLocalStorage(key: string): any {
  if (typeof window === "undefined") {
    return null
  }
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error("Error getting item from localStorage:", error)
    return null
  }
}

export function setLocalStorage(key: string, value: any): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Error setting item to localStorage:", error)
    }
  }
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

