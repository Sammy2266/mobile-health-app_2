// Notification service for handling system notifications and audio alerts
import type { UserMedication } from "@/types/database"

// Audio context for playing sounds
let audioContext: AudioContext | null = null
let notificationSound: AudioBuffer | null = null

// Initialize audio context (must be triggered by user interaction)
export const initAudioContext = async () => {
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Load notification sound
    const response = await fetch("/sounds/notification.mp3")
    const arrayBuffer = await response.arrayBuffer()
    notificationSound = await audioContext.decodeAudioData(arrayBuffer)

    return true
  } catch (error) {
    console.error("Failed to initialize audio context:", error)
    return false
  }
}

// Play notification sound
export const playNotificationSound = () => {
  if (!audioContext || !notificationSound) {
    console.warn("Audio context not initialized. Call initAudioContext first.")
    return false
  }

  try {
    const source = audioContext.createBufferSource()
    source.buffer = notificationSound
    source.connect(audioContext.destination)
    source.start(0)
    return true
  } catch (error) {
    console.error("Failed to play notification sound:", error)
    return false
  }
}

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return false
}

// Show a notification
export const showNotification = (title: string, options?: NotificationOptions): boolean => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    console.warn("Notifications not supported or permission not granted")
    return false
  }

  try {
    new Notification(title, options)
    return true
  } catch (error) {
    console.error("Failed to show notification:", error)
    return false
  }
}

// Schedule medication reminders
export const scheduleMedicationReminders = (medications: UserMedication[]): void => {
  if (typeof window === "undefined") return

  // Clear existing scheduled reminders
  clearScheduledReminders()

  // Get active medications with reminders enabled
  const activeMedications = medications.filter((med) => {
    // Check if medication is active (no end date or end date is in the future)
    const isActive = !med.endDate || new Date(med.endDate) >= new Date()
    return isActive && med.reminderEnabled && med.reminderTimes.length > 0
  })

  // Schedule new reminders
  activeMedications.forEach((medication) => {
    medication.reminderTimes.forEach((timeString) => {
      const [hours, minutes] = timeString.split(":").map(Number)

      // Schedule the reminder
      const reminderId = scheduleReminderForToday(medication, hours, minutes)

      // Store the reminder ID for later management
      const reminderIds = JSON.parse(localStorage.getItem("scheduledReminders") || "[]")
      reminderIds.push(reminderId)
      localStorage.setItem("scheduledReminders", JSON.stringify(reminderIds))
    })
  })
}

// Schedule a reminder for today at the specified time
const scheduleReminderForToday = (medication: UserMedication, hours: number, minutes: number): number => {
  const now = new Date()
  const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)

  // If the time has already passed today, schedule for tomorrow
  if (reminderTime < now) {
    reminderTime.setDate(reminderTime.getDate() + 1)
  }

  // Calculate delay in milliseconds
  const delay = reminderTime.getTime() - now.getTime()

  // Schedule the reminder
  const reminderId = window.setTimeout(() => {
    // Play sound
    playNotificationSound()

    // Show notification
    showNotification(`Time to take ${medication.name}`, {
      body: `Dosage: ${medication.dosage}\nInstructions: ${medication.instructions || "None"}`,
      icon: "/images/logo.png",
      badge: "/images/logo.png",
      tag: `medication-${medication.id}`,
      requireInteraction: true,
    })

    // Schedule the next reminder for tomorrow
    const nextReminderId = scheduleReminderForToday(medication, hours, minutes)

    // Update the stored reminder IDs
    const reminderIds = JSON.parse(localStorage.getItem("scheduledReminders") || "[]")
    const index = reminderIds.indexOf(reminderId)
    if (index !== -1) {
      reminderIds[index] = nextReminderId
      localStorage.setItem("scheduledReminders", JSON.stringify(reminderIds))
    }
  }, delay)

  return reminderId
}

// Clear all scheduled reminders
export const clearScheduledReminders = (): void => {
  if (typeof window === "undefined") return

  const reminderIds = JSON.parse(localStorage.getItem("scheduledReminders") || "[]")

  reminderIds.forEach((id: number) => {
    window.clearTimeout(id)
  })

  localStorage.setItem("scheduledReminders", "[]")
}

// Check if notifications are supported and enabled
export const areNotificationsEnabled = (): boolean => {
  return "Notification" in window && Notification.permission === "granted"
}

