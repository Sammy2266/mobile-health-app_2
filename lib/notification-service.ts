// Notification service for handling system notifications and audio alerts
import type { UserMedication } from "@/types/database"

// Store for active timers
interface ReminderTimer {
  id: number
  medicationId: string
  time: string
  nextExecutionTime: Date
}

// Global state
let activeTimers: ReminderTimer[] = []
let notificationSound: HTMLAudioElement | null = null
let isInitialized = false

// Initialize notification system
export const initNotificationSystem = async (): Promise<boolean> => {
  try {
    if (typeof window === "undefined") return false

    // Create audio element for notifications
    notificationSound = new Audio("/sounds/notification.mp3")

    // Preload the sound
    notificationSound.load()

    // Request notification permission if needed
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      await Notification.requestPermission()
    }

    // Mark as initialized
    isInitialized = true

    // Log success
    console.log("Notification system initialized successfully")

    return true
  } catch (error) {
    console.error("Failed to initialize notification system:", error)
    return false
  }
}

// Play notification sound
export const playNotificationSound = async (): Promise<boolean> => {
  try {
    if (!notificationSound) {
      console.warn("Notification sound not initialized")
      return false
    }

    // Reset the audio to the beginning
    notificationSound.currentTime = 0

    // Play the sound
    const playPromise = notificationSound.play()

    // Handle play promise (required for modern browsers)
    if (playPromise !== undefined) {
      await playPromise
    }

    console.log("Notification sound played successfully")
    return true
  } catch (error) {
    console.error("Failed to play notification sound:", error)
    return false
  }
}

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications not supported in this environment")
    return false
  }

  if (Notification.permission === "granted") {
    console.log("Notification permission already granted")
    return true
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission()
      console.log(`Notification permission request result: ${permission}`)
      return permission === "granted"
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return false
    }
  }

  console.warn("Notification permission previously denied")
  return false
}

// Show a notification
export const showNotification = (title: string, options?: NotificationOptions): boolean => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications not supported in this environment")
    return false
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted")
    return false
  }

  try {
    const notification = new Notification(title, {
      icon: "/images/logo.png",
      ...options,
    })

    // Add click handler to focus the app
    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    console.log("Notification shown successfully:", title)
    return true
  } catch (error) {
    console.error("Failed to show notification:", error)
    return false
  }
}

// Schedule medication reminders
export const scheduleMedicationReminders = (medications: UserMedication[]): void => {
  if (typeof window === "undefined") return

  console.log("Scheduling medication reminders...")

  // Clear existing scheduled reminders
  clearAllReminders()

  // Get active medications with reminders enabled
  const activeMedications = medications.filter((med) => {
    // Check if medication is active (no end date or end date is in the future)
    const isActive = !med.endDate || new Date(med.endDate) >= new Date()
    return isActive && med.reminderEnabled && med.reminderTimes.length > 0
  })

  console.log(`Found ${activeMedications.length} active medications with reminders`)

  // Schedule new reminders
  activeMedications.forEach((medication) => {
    medication.reminderTimes.forEach((timeString) => {
      scheduleReminderForMedication(medication, timeString)
    })
  })

  // Save active timers to localStorage for persistence
  saveActiveTimers()

  console.log(`Scheduled ${activeTimers.length} reminders in total`)
}

// Schedule a reminder for a specific medication and time
const scheduleReminderForMedication = (medication: UserMedication, timeString: string): void => {
  try {
    // Parse the time string (format: HH:MM)
    const [hoursStr, minutesStr] = timeString.split(":")
    const hours = Number.parseInt(hoursStr, 10)
    const minutes = Number.parseInt(minutesStr, 10)

    if (isNaN(hours) || isNaN(minutes)) {
      console.error(`Invalid time format: ${timeString}`)
      return
    }

    // Calculate the next occurrence of this time
    const now = new Date()
    const nextExecutionTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0)

    // If the time has already passed today, schedule for tomorrow
    if (nextExecutionTime < now) {
      nextExecutionTime.setDate(nextExecutionTime.getDate() + 1)
    }

    // Calculate delay in milliseconds
    const delay = nextExecutionTime.getTime() - now.getTime()

    // Create a timer
    const timerId = window.setTimeout(() => {
      // Execute the reminder
      executeReminder(medication)

      // Reschedule for tomorrow
      scheduleReminderForMedication(medication, timeString)
    }, delay)

    // Store the timer information
    activeTimers.push({
      id: timerId,
      medicationId: medication.id,
      time: timeString,
      nextExecutionTime: nextExecutionTime,
    })

    console.log(
      `Scheduled reminder for ${medication.name} at ${timeString}, next execution: ${nextExecutionTime.toLocaleString()}`,
    )
  } catch (error) {
    console.error(`Error scheduling reminder for ${medication.name} at ${timeString}:`, error)
  }
}

// Execute a reminder (show notification and play sound)
const executeReminder = async (medication: UserMedication): Promise<void> => {
  try {
    console.log(`Executing reminder for ${medication.name}`)

    // Play sound
    await playNotificationSound()

    // Show notification
    showNotification(`Time to take ${medication.name}`, {
      body: `Dosage: ${medication.dosage}${medication.instructions ? `\nInstructions: ${medication.instructions}` : ""}`,
      tag: `medication-${medication.id}`,
      requireInteraction: true,
    })
  } catch (error) {
    console.error(`Error executing reminder for ${medication.name}:`, error)
  }
}

// Clear all scheduled reminders
export const clearAllReminders = (): void => {
  console.log(`Clearing ${activeTimers.length} active reminders`)

  activeTimers.forEach((timer) => {
    window.clearTimeout(timer.id)
  })

  activeTimers = []

  // Clear from localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("medicationReminders")
  }
}

// Save active timers to localStorage
const saveActiveTimers = (): void => {
  if (typeof window === "undefined") return

  try {
    // We can't store the full timer objects, so just store the essential info
    const timerData = activeTimers.map((timer) => ({
      medicationId: timer.medicationId,
      time: timer.time,
      nextExecutionTime: timer.nextExecutionTime.toISOString(),
    }))

    localStorage.setItem("medicationReminders", JSON.stringify(timerData))
  } catch (error) {
    console.error("Error saving active timers to localStorage:", error)
  }
}

// Restore timers from localStorage (call this on app initialization)
export const restoreReminders = (medications: UserMedication[]): void => {
  if (typeof window === "undefined") return

  try {
    // Just reschedule all reminders based on current medications
    scheduleMedicationReminders(medications)
  } catch (error) {
    console.error("Error restoring reminders:", error)
  }
}

// Check if notifications are supported and enabled
export const areNotificationsEnabled = (): boolean => {
  return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"
}

// Check if the notification system is initialized
export const isNotificationSystemInitialized = (): boolean => {
  return isInitialized
}

// Debug function to get information about active reminders
export const getActiveRemindersInfo = (): any[] => {
  return activeTimers.map((timer) => ({
    medicationId: timer.medicationId,
    time: timer.time,
    nextExecutionTime: timer.nextExecutionTime.toLocaleString(),
  }))
}

