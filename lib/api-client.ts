// Client-side API service

// Base URL for API requests
const API_BASE_URL = "/api"

// Helper function for making API requests
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders = {
    "Content-Type": "application/json",
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    // First check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`API returned non-JSON response: ${await response.text()}`)
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`)
    }

    return data as T
  } catch (error) {
    console.error(`API request failed for ${url}:`, error)
    throw error
  }
}

// Auth API
export async function login(email: string, password: string) {
  return fetchAPI("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function signup(username: string, email: string, password: string) {
  return fetchAPI("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  })
}

export async function forgotPassword(method: "email" | "phone", email?: string, phone?: string) {
  return fetchAPI("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ method, email, phone }),
  })
}

export async function resetPassword(userId: string, code: string, newPassword: string) {
  return fetchAPI("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ userId, code, newPassword }),
  })
}

// Profile API
export async function getProfile(userId: string) {
  return fetchAPI(`/profile?userId=${userId}`)
}

export async function updateUserProfile(profile: any) {
  return fetchAPI("/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  })
}

// Settings API
export async function getSettings(userId: string) {
  return fetchAPI(`/settings?userId=${userId}`)
}

export async function updateUserSettings(userId: string, settings: any) {
  return fetchAPI("/settings", {
    method: "PUT",
    body: JSON.stringify({ userId, ...settings }),
  })
}

// Appointments API
export async function getAppointments(userId: string) {
  return fetchAPI(`/appointments?userId=${userId}`)
}

export async function createAppointment(userId: string, appointment: any) {
  return fetchAPI("/appointments", {
    method: "POST",
    body: JSON.stringify({ userId, ...appointment }),
  })
}

export async function updateAppointment(userId: string, appointment: any) {
  return fetchAPI(`/appointments/${appointment.id}`, {
    method: "PUT",
    body: JSON.stringify({ userId, ...appointment }),
  })
}

export async function deleteAppointment(userId: string, appointmentId: string) {
  return fetchAPI(`/appointments/${appointmentId}?userId=${userId}`, {
    method: "DELETE",
  })
}

// Health Data API
export async function getHealthData(userId: string) {
  return fetchAPI(`/health-data?userId=${userId}`)
}

export async function updateHealthData(userId: string, data: any) {
  return fetchAPI("/health-data", {
    method: "PUT",
    body: JSON.stringify({ userId, ...data }),
  })
}

// Medications API
export async function getMedications(userId: string) {
  return fetchAPI(`/medications?userId=${userId}`)
}

export async function createMedication(userId: string, medication: any) {
  return fetchAPI("/medications", {
    method: "POST",
    body: JSON.stringify({ userId, ...medication }),
  })
}

export async function updateMedication(userId: string, medication: any) {
  return fetchAPI(`/medications/${medication.id}`, {
    method: "PUT",
    body: JSON.stringify({ userId, ...medication }),
  })
}

export async function deleteMedication(userId: string, medicationId: string) {
  return fetchAPI(`/medications/${medicationId}?userId=${userId}`, {
    method: "DELETE",
  })
}

// Documents API
export async function getDocuments(userId: string) {
  return fetchAPI(`/documents?userId=${userId}`)
}

export async function createDocument(userId: string, document: any) {
  return fetchAPI("/documents", {
    method: "POST",
    body: JSON.stringify({ userId, ...document }),
  })
}

export async function updateDocument(userId: string, document: any) {
  return fetchAPI(`/documents/${document.id}`, {
    method: "PUT",
    body: JSON.stringify({ userId, ...document }),
  })
}

export async function deleteDocument(userId: string, documentId: string) {
  return fetchAPI(`/documents/${documentId}?userId=${userId}`, {
    method: "DELETE",
  })
}

