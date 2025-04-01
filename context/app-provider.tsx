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
  defaultProfile,
  defaultSettings,
} from "@/types/database"
import * as api from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

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
  login: (emailOrUsername: string, password: string) => Promise<boolean>
  signup: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Helper to get stored user ID from session storage (not local storage)
const getStoredUserId = (): string | null => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("currentUserId")
  }
  return null
}

// Helper to store user ID in session storage (not local storage)
const storeUserId = (userId: string | null): void => {
  if (typeof window !== "undefined") {
    if (userId) {
      sessionStorage.setItem("currentUserId", userId)
    } else {
      sessionStorage.removeItem("currentUserId")
    }
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

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      const storedUserId = getStoredUserId()

      if (storedUserId) {
        setCurrentUserId(storedUserId)

        try {
          // Verify the user exists in the database
          const userExists = await api.verifyUser(storedUserId).catch(() => false)

          if (!userExists) {
            console.error("User not found in database, logging out")
            logout()
            return
          }

          // Load user data in parallel for faster loading
          const loadDataPromises = [
            api
              .getProfile(storedUserId)
              .then((userProfile) => {
                if (userProfile) setProfile(userProfile)
              })
              .catch((error) => {
                console.error("Error loading profile:", error)
                throw error // Re-throw to be caught by Promise.allSettled
              }),

            api
              .getSettings(storedUserId)
              .then((userSettings) => {
                if (userSettings) setSettings(userSettings)
              })
              .catch((error) => {
                console.error("Error loading settings:", error)
                // Use default settings
                setSettings({ ...defaultSettings, userId: storedUserId })
              }),

            api
              .getAppointments(storedUserId)
              .then((userAppointments) => {
                if (userAppointments) setAppointments(userAppointments)
              })
              .catch((error) => {
                console.error("Error loading appointments:", error)
                setAppointments([])
              }),

            api
              .getHealthData(storedUserId)
              .then((userHealthData) => {
                if (userHealthData) setHealthData(userHealthData)
              })
              .catch((error) => {
                console.error("Error loading health data:", error)
                setHealthData({
                  bloodPressure: [],
                  heartRate: [],
                  weight: [],
                  sleep: [],
                })
              }),

            api
              .getMedications(storedUserId)
              .then((userMedications) => {
                if (userMedications) setMedications(userMedications)
              })
              .catch((error) => {
                console.error("Error loading medications:", error)
                setMedications([])
              }),

            api
              .getDocuments(storedUserId)
              .then((userDocuments) => {
                if (userDocuments) setDocuments(userDocuments)
              })
              .catch((error) => {
                console.error("Error loading documents:", error)
                setDocuments([])
              }),
          ]

          // Wait for all promises to settle (either resolve or reject)
          const results = await Promise.allSettled(loadDataPromises)

          // Check if profile loading failed (first promise)
          if (results[0].status === "rejected") {
            console.error("Critical error loading profile, logging out")
            logout()
            return
          }
        } catch (error) {
          console.error("Error loading user data from API:", error)
          logout()
          return
        }
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

    try {
      await api.updateUserProfile({
        ...newProfile,
        id: currentUserId,
      })
      setProfile(newProfile)
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      })
    }
  }

  const updateSettings = async (newSettings: UserSettings) => {
    if (!currentUserId) return

    try {
      await api.updateUserSettings(currentUserId, newSettings)
      setSettings(newSettings)
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Update Failed",
        description: "There was a problem updating your settings.",
        variant: "destructive",
      })
    }
  }

  const updateAppointments = async (newAppointments: UserAppointment[]) => {
    if (!currentUserId) return

    try {
      await api.updateAppointments(currentUserId, newAppointments)
      setAppointments(newAppointments)
      toast({
        title: "Appointments Updated",
        description: "Your appointments have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating appointments:", error)
      toast({
        title: "Update Failed",
        description: "There was a problem updating your appointments.",
        variant: "destructive",
      })
    }
  }

  const updateHealthData = async (newData: UserHealthData) => {
    if (!currentUserId) {
      console.error("Cannot update health data: No user ID")
      return
    }

    try {
      console.log("Updating health data for user:", currentUserId)
      console.log("New health data:", newData)

      // Make sure we're passing the userId to the API
      const result = await api.updateHealthData(currentUserId, newData)
      console.log("Health data update result:", result)

      // Update the state with the new data
      setHealthData(newData)

      // Don't show toast here as it's handled in the component
    } catch (error) {
      console.error("Error updating health data:", error)
      throw error // Re-throw to allow handling in the component
    }
  }

  const updateMedications = async (newMedications: UserMedication[]) => {
    if (!currentUserId) return

    try {
      await api.updateMedications(currentUserId, newMedications)
      setMedications(newMedications)
      toast({
        title: "Medications Updated",
        description: "Your medications have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating medications:", error)
      toast({
        title: "Update Failed",
        description: "There was a problem updating your medications.",
        variant: "destructive",
      })
    }
  }

  const updateDocuments = async (newDocuments: UserDocument[]) => {
    if (!currentUserId) return

    try {
      await api.updateDocuments(currentUserId, newDocuments)
      setDocuments(newDocuments)
      toast({
        title: "Documents Updated",
        description: "Your documents have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating documents:", error)
      toast({
        title: "Update Failed",
        description: "There was a problem updating your documents.",
        variant: "destructive",
      })
    }
  }

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    try {
      // Try API login
      const response = await api.login(emailOrUsername, password)

      if (response.success) {
        const userId = response.user.id

        // Update state first
        setCurrentUserId(userId)
        storeUserId(userId)
        setInitialized(true)

        // Show success toast
        toast({
          title: "Login Successful",
          description: "Welcome back to your health dashboard!",
        })

        // Load user data with better error handling
        try {
          // Load data in parallel for faster loading
          const loadDataPromises = [
            api
              .getProfile(userId)
              .then((userProfile) => {
                if (userProfile) setProfile(userProfile)
                else {
                  // Use a basic profile based on login info
                  const defaultUserProfile = {
                    ...defaultProfile,
                    id: userId,
                    name: response.user.username || "User",
                    email: response.user.email,
                  }
                  setProfile(defaultUserProfile)
                }
              })
              .catch((error) => {
                console.error("Error loading profile:", error)
                // Use a basic profile based on login info
                const defaultUserProfile = {
                  ...defaultProfile,
                  id: userId,
                  name: response.user.username || "User",
                  email: response.user.email,
                }
                setProfile(defaultUserProfile)
              }),

            api
              .getSettings(userId)
              .then((userSettings) => {
                if (userSettings) setSettings(userSettings)
                else setSettings({ ...defaultSettings, userId })
              })
              .catch(() => {
                setSettings({ ...defaultSettings, userId })
              }),

            api
              .getAppointments(userId)
              .then((userAppointments) => {
                if (userAppointments) setAppointments(userAppointments)
                else setAppointments([])
              })
              .catch(() => {
                setAppointments([])
              }),

            api
              .getHealthData(userId)
              .then((userHealthData) => {
                if (userHealthData) setHealthData(userHealthData)
                else
                  setHealthData({
                    bloodPressure: [],
                    heartRate: [],
                    weight: [],
                    sleep: [],
                  })
              })
              .catch(() => {
                setHealthData({
                  bloodPressure: [],
                  heartRate: [],
                  weight: [],
                  sleep: [],
                })
              }),

            api
              .getMedications(userId)
              .then((userMedications) => {
                if (userMedications) setMedications(userMedications)
                else setMedications([])
              })
              .catch(() => {
                setMedications([])
              }),

            api
              .getDocuments(userId)
              .then((userDocuments) => {
                if (userDocuments) setDocuments(userDocuments)
                else setDocuments([])
              })
              .catch(() => {
                setDocuments([])
              }),
          ]

          // Wait for all promises to settle
          await Promise.allSettled(loadDataPromises)
        } catch (error) {
          console.error("Error loading user data:", error)
          // Even if we can't load all data, the login was successful
          // We'll just use default values for now
        }

        return true
      }

      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      })
      return false
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.signup(username, email, password)

      if (response.success) {
        const userId = response.user.id

        // Update state first
        setCurrentUserId(userId)
        storeUserId(userId)
        setInitialized(true)

        // Show success toast
        toast({
          title: "Account Created",
          description: "Welcome to your health dashboard! Your account has been created successfully.",
        })

        // Load user data with better error handling
        try {
          // Load data in parallel for faster loading
          const loadDataPromises = [
            api
              .getProfile(userId)
              .then((userProfile) => {
                if (userProfile) setProfile(userProfile)
                else {
                  // Create a default profile if one doesn't exist
                  const defaultUserProfile = {
                    ...defaultProfile,
                    id: userId,
                    name: username,
                    email,
                  }
                  setProfile(defaultUserProfile)

                  // Try to save it
                  api.updateUserProfile(defaultUserProfile).catch((error) => {
                    console.error("Error creating default profile:", error)
                  })
                }
              })
              .catch(() => {
                // Create a default profile if one doesn't exist
                const defaultUserProfile = {
                  ...defaultProfile,
                  id: userId,
                  name: username,
                  email,
                }
                setProfile(defaultUserProfile)

                // Try to save it
                api.updateUserProfile(defaultUserProfile).catch((error) => {
                  console.error("Error creating default profile:", error)
                })
              }),

            api
              .getSettings(userId)
              .then((userSettings) => {
                if (userSettings) setSettings(userSettings)
                else setSettings({ ...defaultSettings, userId })
              })
              .catch(() => {
                setSettings({ ...defaultSettings, userId })
              }),

            api
              .getAppointments(userId)
              .then((userAppointments) => {
                if (userAppointments) setAppointments(userAppointments)
                else setAppointments([])
              })
              .catch(() => {
                setAppointments([])
              }),

            api
              .getHealthData(userId)
              .then((userHealthData) => {
                if (userHealthData) setHealthData(userHealthData)
                else
                  setHealthData({
                    bloodPressure: [],
                    heartRate: [],
                    weight: [],
                    sleep: [],
                  })
              })
              .catch(() => {
                setHealthData({
                  bloodPressure: [],
                  heartRate: [],
                  weight: [],
                  sleep: [],
                })
              }),

            api
              .getMedications(userId)
              .then((userMedications) => {
                if (userMedications) setMedications(userMedications)
                else setMedications([])
              })
              .catch(() => {
                setMedications([])
              }),

            api
              .getDocuments(userId)
              .then((userDocuments) => {
                if (userDocuments) setDocuments(userDocuments)
                else setDocuments([])
              })
              .catch(() => {
                setDocuments([])
              }),
          ]

          // Wait for all promises to settle
          await Promise.allSettled(loadDataPromises)
        } catch (error) {
          console.error("Error loading user data:", error)
          // Even if we can't load all data, the signup was successful
          // We'll just use default values for now
        }

        return true
      }

      toast({
        title: "Signup Failed",
        description: response.message || "Could not create account. Please try again.",
        variant: "destructive",
      })
      return false
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Signup Error",
        description: "An error occurred during account creation. Please try again.",
        variant: "destructive",
      })
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

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
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

