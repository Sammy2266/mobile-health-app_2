"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/context/app-provider"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initialized } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, initialized, router])

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

