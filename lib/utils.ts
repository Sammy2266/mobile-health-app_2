import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function getDaysUntil(dateString: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(dateString)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

export function getNextAppointment(
  appointments: Array<{ date: string; completed: boolean }>,
): { date: string; daysUntil: number } | null {
  const now = new Date()
  const upcomingAppointments = appointments
    .filter((appointment) => !appointment.completed && new Date(appointment.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (upcomingAppointments.length === 0) {
    return null
  }

  const nextAppointment = upcomingAppointments[0]
  return {
    date: nextAppointment.date,
    daysUntil: getDaysUntil(nextAppointment.date),
  }
}

