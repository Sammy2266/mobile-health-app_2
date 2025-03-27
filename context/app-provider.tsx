"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type UserProfile,
  type UserSettings,
  type UserAppointment,
  type UserHealthData,
  type UserMedication,
  type UserDocument,
  type UserCredentials,
  defaultProfile,
  defaultSettings,
} from "@/types/database"
import * as api from "@/lib/api-client"

interface AppContextType {
  profile: UserProfile
  settings: UserSettings
  appointments: UserAppointment[]
  healthData: UserHealthData
  medications: UserMedication[]
  documents: UserDocument[]
  updateProfile: (profile: UserProfile) => void
  updateSettings: (settings: UserSettings) => void
  updateAppointments: (appointments: UserAppointment[]) => void
  updateHealthData: (data: UserHealthData) => void
  updateMedications: (medications: UserMedication[]) => void
  updateDocuments: (documents: UserDocument[]) => void
  currentDate: Date
  initialized: boolean
  currentUserId: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Helper to get stored user ID from session storage
const getStoredUserId = (): string | null => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("currentUserId")
  }
  return null
}

// Helper to store user ID in session storage
const storeUserId = (userId: string | null): void => {
  if (typeof window !== "undefined") {
    if (userId) {
      sessionStorage.setItem("currentUserId", userId)
    } else {
      sessionStorage.removeItem("currentUserId")
    }
  }
}

// Local storage fallback functions
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        return JSON.parse(stored) as T
      } catch (error) {
        console.error("Error parsing stored data:", error)
      }
    }
  }
  return defaultValue
}

const saveToLocalStorage = <T,>(key: string, data: T): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [appointments, setAppointments] = useState<UserAppointment[]>([])
  const [healthData, setHealthData] = useState<UserHealthData>({
    bloodPressure: [],
    heartRate: [],
    weight: [],
    sleep: [],
  })
  const [medications, setMedications] = useState<UserMedication[]>([])
  const [documents, setDocuments] = useState<UserDocument[]>([])
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [initialized, setInitialized] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [useLocalStorage, setUseLocalStorage] = useState(false)

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      const storedUserId = getStoredUserId()

      if (storedUserId) {
        setCurrentUserId(storedUserId)

        try {
          // Try to load user data from API
          let userProfile = null
          let userSettings = null
          let userAppointments = []
          let userHealthData = null
          let userMedications = []
          let userDocuments = []

          try {
            userProfile = await api.getProfile(storedUserId)
          } catch (error) {
            console.log("Profile not found, creating default profile")
            // Create a default profile if one doesn't exist
            const defaultUserProfile = {
              ...defaultProfile,
              id: storedUserId,
              name: "User",
              email: "user@example.com",
            }

            try {
              userProfile = await api.updateUserProfile(defaultUserProfile)
            } catch (profileError) {
              console.error("Error creating default profile:", profileError)
              // Fall back to using the default profile in memory
              userProfile = defaultUserProfile
            }
          }

          try {
            userSettings = await api.getSettings(storedUserId)
          } catch (error) {
            console.log("Settings not found, using defaults")
          }

          try {
            userAppointments = await api.getAppointments(storedUserId)
          } catch (error) {
            console.log("No appointments found")
          }

          try {
            userHealthData = await api.getHealthData(storedUserId)
          } catch (error) {
            console.log("No health data found")
          }

          try {
            userMedications = await api.getMedications(storedUserId)
          } catch (error) {
            console.log("No medications found")
          }

          try {
            userDocuments = await api.getDocuments(storedUserId)
          } catch (error) {
            console.log("No documents found")
          }

          // If API calls succeed, use the data
          if (userProfile) setProfile(userProfile)
          if (userSettings) setSettings(userSettings)
          if (userAppointments) setAppointments(userAppointments)
          if (userHealthData) setHealthData(userHealthData)
          if (userMedications) setMedications(userMedications)
          if (userDocuments) setDocuments(userDocuments)
        } catch (error) {
          console.error("Error loading user data from API:", error)

          // Fall back to localStorage
          setUseLocalStorage(true)

          // Load from localStorage
          setProfile(
            getFromLocalStorage("health_app_profile", {
              ...defaultProfile,
              id: storedUserId,
              name: "User",
              email: "user@example.com",
            }),
          )
          setSettings(getFromLocalStorage("health_app_settings", defaultSettings))
          setAppointments(getFromLocalStorage("health_app_appointments", []))
          setHealthData(
            getFromLocalStorage("health_app_health_data", {
              bloodPressure: [],
              heartRate: [],
              weight: [],
              sleep: [],
            }),
          )
          setMedications(getFromLocalStorage("health_app_medications", []))
          setDocuments(getFromLocalStorage("health_app_documents", []))
        }
      } else {
        // No user is logged in, use default values
        setUseLocalStorage(true)
      }

      setInitialized(true)
      setLoading(false)
    }

    initializeData()
  }, [])

  // Update current date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Update functions
  const updateProfile = async (newProfile: UserProfile) => {
    if (!currentUserId) return

    setProfile(newProfile)

    if (useLocalStorage) {
      saveToLocalStorage("health_app_profile", newProfile)
      return
    }

    try {
      await api.updateUserProfile({
        ...newProfile,
        id: currentUserId,
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      // Fall back to localStorage
      setUseLocalStorage(true)
      saveToLocalStorage("health_app_profile", newProfile)
    }
  }

  const updateSettings = async (newSettings: UserSettings) => {
    if (!currentUserId) return

    setSettings(newSettings)

    if (useLocalStorage) {
      saveToLocalStorage("health_app_settings", newSettings)
      return
    }

    try {
      await api.updateUserSettings(currentUserId, newSettings)
    } catch (error) {
      console.error("Error updating settings:", error)
      // Fall back to localStorage
      setUseLocalStorage(true)
      saveToLocalStorage("health_app_settings", newSettings)
    }
  }

  const updateAppointments = async (newAppointments: UserAppointment[]) => {
    if (!currentUserId) return

    setAppointments(newAppointments)

    if (useLocalStorage) {
      saveToLocalStorage("health_app_appointments", newAppointments)
      return
    }

    // In a real app, you would sync with the server here
    // This is simplified for the demo
    saveToLocalStorage("health_app_appointments", newAppointments)
  }

  const updateHealthData = async (newData: UserHealthData) => {
    if (!currentUserId) return

    setHealthData(newData)

    if (useLocalStorage) {
      saveToLocalStorage("health_app_health_data", newData)
      return
    }

    try {
      await api.updateHealthData(currentUserId, newData)
    } catch (error) {
      console.error("Error updating health data:", error)
      // Fall back to localStorage
      setUseLocalStorage(true)
      saveToLocalStorage("health_app_health_data", newData)
    }
  }

  const updateMedications = async (newMedications: UserMedication[]) => {
    if (!currentUserId) return

    setMedications(newMedications)

    if (useLocalStorage) {
      saveToLocalStorage("health_app_medications", newMedications)
      return
    }

    // In a real app, you would sync with the server here
    // This is simplified for the demo
    saveToLocalStorage("health_app_medications", newMedications)
  }

  const updateDocuments = async (newDocuments: UserDocument[]) => {
    if (!currentUserId) return

    setDocuments(newDocuments)

    if (useLocalStorage) {
      saveToLocalStorage("health_app_documents", newDocuments)
      return
    }

    // In a real app, you would sync with the server here
    // This is simplified for the demo
    saveToLocalStorage("health_app_documents", newDocuments)
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (useLocalStorage) {
        // Simplified login for localStorage fallback
        const users = getFromLocalStorage<UserCredentials[]>("health_app_users", [])
        const user = users.find((u) => u.email === email && u.password === password)

        if (user) {
          setCurrentUserId(user.id)
          storeUserId(user.id)

          // Load user data from localStorage
          setProfile(
            getFromLocalStorage("health_app_profile", {
              ...defaultProfile,
              id: user.id,
              name: user.username,
              email: user.email,
            }),
          )
          setSettings(getFromLocalStorage("health_app_settings", defaultSettings))
          setAppointments(getFromLocalStorage("health_app_appointments", []))
          setHealthData(
            getFromLocalStorage("health_app_health_data", {
              bloodPressure: [],
              heartRate: [],
              weight: [],
              sleep: [],
            }),
          )
          setMedications(getFromLocalStorage("health_app_medications", []))
          setDocuments(getFromLocalStorage("health_app_documents", []))

          return true
        }

        return false
      }

      // Try API login
      try {
        const response = await api.login(email, password)

        if (response.success) {
          const userId = response.user.id
          setCurrentUserId(userId)
          storeUserId(userId)

          // Load user data
          try {
            let userProfile = null

            try {
              userProfile = await api.getProfile(userId)
            } catch (profileError) {
              console.log("Profile not found, creating default profile")
              // Create a default profile if one doesn't exist
              const defaultUserProfile = {
                ...defaultProfile,
                id: userId,
                name: response.user.username || "User",
                email: response.user.email,
              }

              try {
                userProfile = await api.updateUserProfile(defaultUserProfile)
              } catch (createProfileError) {
                console.error("Error creating default profile:", createProfileError)
                // Fall back to using the default profile in memory
                userProfile = defaultUserProfile
              }
            }

            const userSettings = await api.getSettings(userId).catch(() => null)
            const userAppointments = await api.getAppointments(userId).catch(() => [])
            const userHealthData = await api.getHealthData(userId).catch(() => null)
            const userMedications = await api.getMedications(userId).catch(() => [])
            const userDocuments = await api.getDocuments(userId).catch(() => [])

            if (userProfile) setProfile(userProfile)
            if (userSettings) setSettings(userSettings)
            if (userAppointments) setAppointments(userAppointments)
            if (userHealthData) setHealthData(userHealthData)
            if (userMedications) setMedications(userMedications)
            if (userDocuments) setDocuments(userDocuments)
          } catch (error) {
            console.error("Error loading user data:", error)
            setUseLocalStorage(true)
          }

          return true
        }

        return false
      } catch (error) {
        console.error("Login API error:", error)
        setUseLocalStorage(true)

        // Try localStorage login as fallback
        return login(email, password)
      }
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      if (useLocalStorage) {
        // Simplified signup for localStorage fallback
        const users = getFromLocalStorage<UserCredentials[]>("health_app_users", [])

        // Check if email already exists
        if (users.some((u) => u.email === email)) {
          return false
        }

        const userId = crypto.randomUUID()
        const newUser = {
          id: userId,
          username,
          email,
          password,
          createdAt: new Date().toISOString(),
        }

        // Save user
        saveToLocalStorage("health_app_users", [...users, newUser])

        // Create profile
        const newProfile = {
          ...defaultProfile,
          id: userId,
          name: username,
          email,
        }
        saveToLocalStorage("health_app_profile", newProfile)

        // Create settings
        saveToLocalStorage("health_app_settings", {
          ...defaultSettings,
          userId,
        })

        // Auto login
        setCurrentUserId(userId)
        storeUserId(userId)
        setProfile(newProfile)
        setSettings(defaultSettings)

        return true
      }

      // Try API signup
      try {
        const response = await api.signup(username, email, password)

        if (response.success) {
          const userId = response.user.id
          setCurrentUserId(userId)
          storeUserId(userId)

          // Create a profile for the new user
          const newProfile = {
            ...defaultProfile,
            id: userId,
            name: username,
            email,
          }

          try {
            await api.updateUserProfile(newProfile)
          } catch (profileError) {
            console.error("Error creating profile during signup:", profileError)
          }

          // Load user data
          try {
            const userProfile = await api.getProfile(userId).catch(() => newProfile)
            const userSettings = await api.getSettings(userId).catch(() => null)
            const userAppointments = await api.getAppointments(userId).catch(() => [])
            const userHealthData = await api.getHealthData(userId).catch(() => null)
            const userMedications = await api.getMedications(userId).catch(() => [])
            const userDocuments = await api.getDocuments(userId).catch(() => [])

            if (userProfile) setProfile(userProfile)
            if (userSettings) setSettings(userSettings)
            if (userAppointments) setAppointments(userAppointments)
            if (userHealthData) setHealthData(userHealthData)
            if (userMedications) setMedications(userMedications)
            if (userDocuments) setDocuments(userDocuments)
          } catch (error) {
            console.error("Error loading user data:", error)
            setUseLocalStorage(true)
          }

          return true
        }

        return false
      } catch (error) {
        console.error("Signup API error:", error)
        setUseLocalStorage(true)

        // Try localStorage signup as fallback
        return signup(username, email, password)
      }
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const logout = () => {
    setCurrentUserId(null)
    storeUserId(null)

    // Reset state
    setProfile(defaultProfile)
    setSettings(defaultSettings)
    setAppointments([])
    setHealthData({
      bloodPressure: [],
      heartRate: [],
      weight: [],
      sleep: [],
    })
    setMedications([])
    setDocuments([])
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AppContext.Provider
      value={{
        profile,
        settings,
        appointments,
        healthData,
        medications,
        documents,
        updateProfile,
        updateSettings,
        updateAppointments,
        updateHealthData,
        updateMedications,
        updateDocuments,
        currentDate,
        initialized,
        currentUserId,
        isAuthenticated: !!currentUserId,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

