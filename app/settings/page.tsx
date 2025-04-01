"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/context/app-provider"
import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function SettingsPage() {
  const { settings, updateSettings, initialized } = useApp()
  const { toast } = useToast()
  const [isResetting, setIsResetting] = useState(false)

  const [formData, setFormData] = useState({
    theme: settings.theme,
    language: settings.language,
    notifyAppointments: settings.notifications.appointments,
    notifyMedications: settings.notifications.medications,
    notifyHealthTips: settings.notifications.healthTips,
    notifyUpdates: settings.notifications.updates,
    shareData: settings.privacySettings.shareData,
    anonymousAnalytics: settings.privacySettings.anonymousAnalytics,
  })

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updatedSettings = {
      ...settings,
      theme: formData.theme as "light" | "dark" | "system",
      language: formData.language,
      notifications: {
        appointments: formData.notifyAppointments,
        medications: formData.notifyMedications,
        healthTips: formData.notifyHealthTips,
        updates: formData.notifyUpdates,
      },
      privacySettings: {
        shareData: formData.shareData,
        anonymousAnalytics: formData.anonymousAnalytics,
      },
    }

    updateSettings(updatedSettings)
  }

  const handleResetToDefaults = () => {
    setIsResetting(true)

    // Reset form data to default settings
    setFormData({
      theme: "system",
      language: "en",
      notifyAppointments: true,
      notifyMedications: true,
      notifyHealthTips: true,
      notifyUpdates: true,
      shareData: false,
      anonymousAnalytics: true,
    })

    // Update settings with defaults
    const defaultSettingsObj = {
      ...settings,
      theme: "system" as "light" | "dark" | "system",
      language: "en",
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
    }

    updateSettings(defaultSettingsObj)

    toast({
      title: "Settings Reset",
      description: "Your settings have been reset to defaults.",
    })

    setIsResetting(false)
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <aside className="hidden w-64 border-r bg-[#1a2e22] md:block">
            <Sidebar />
          </aside>
          <main className="flex-1 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:gap-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your app preferences and notifications</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                      <CardDescription>Customize how the app looks</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={formData.theme} onValueChange={(value) => handleSelectChange("theme", value)}>
                          <SelectTrigger id="theme">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={formData.language}
                          onValueChange={(value) => handleSelectChange("language", value)}
                        >
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>Configure your notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifyAppointments" className="flex-1">
                          Appointment Reminders
                        </Label>
                        <Switch
                          id="notifyAppointments"
                          checked={formData.notifyAppointments}
                          onCheckedChange={(checked) => handleSwitchChange("notifyAppointments", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifyMedications" className="flex-1">
                          Medication Reminders
                        </Label>
                        <Switch
                          id="notifyMedications"
                          checked={formData.notifyMedications}
                          onCheckedChange={(checked) => handleSwitchChange("notifyMedications", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifyHealthTips" className="flex-1">
                          Health Tips
                        </Label>
                        <Switch
                          id="notifyHealthTips"
                          checked={formData.notifyHealthTips}
                          onCheckedChange={(checked) => handleSwitchChange("notifyHealthTips", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifyUpdates" className="flex-1">
                          App Updates
                        </Label>
                        <Switch
                          id="notifyUpdates"
                          checked={formData.notifyUpdates}
                          onCheckedChange={(checked) => handleSwitchChange("notifyUpdates", checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Privacy</CardTitle>
                      <CardDescription>Manage your data sharing preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="shareData" className="flex-1">
                          Share Health Data with Providers
                        </Label>
                        <Switch
                          id="shareData"
                          checked={formData.shareData}
                          onCheckedChange={(checked) => handleSwitchChange("shareData", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="anonymousAnalytics" className="flex-1">
                          Anonymous Analytics
                        </Label>
                        <Switch
                          id="anonymousAnalytics"
                          checked={formData.anonymousAnalytics}
                          onCheckedChange={(checked) => handleSwitchChange("anonymousAnalytics", checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardFooter className="flex justify-between pt-6">
                      <Button variant="outline" type="button" onClick={handleResetToDefaults} disabled={isResetting}>
                        Reset to Defaults
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </CardFooter>
                  </Card>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

