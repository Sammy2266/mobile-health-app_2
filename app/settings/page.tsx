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
import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useTheme } from "next-themes"
import { translations } from "@/lib/translations"

export default function SettingsPage() {
  const { settings, updateSettings, initialized } = useApp()
  const { toast } = useToast()
  const [isResetting, setIsResetting] = useState(false)
  const { setTheme } = useTheme()
  const [currentLanguage, setCurrentLanguage] = useState(settings.language || "en")

  // Get translations based on current language
  const t = (key: string) => {
    return translations[currentLanguage]?.[key] || translations["en"][key] || key
  }

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

  // Update theme when formData.theme changes
  useEffect(() => {
    if (formData.theme) {
      setTheme(formData.theme)
    }
  }, [formData.theme, setTheme])

  // Update language when formData.language changes
  useEffect(() => {
    setCurrentLanguage(formData.language)
  }, [formData.language])

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">{t("loading")}</div>
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Apply theme change immediately
    if (name === "theme") {
      setTheme(value)
    }

    // Apply language change immediately
    if (name === "language") {
      setCurrentLanguage(value)
    }
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

    // Apply theme change immediately
    setTheme("system")

    // Apply language change immediately
    setCurrentLanguage("en")

    updateSettings(defaultSettingsObj)

    toast({
      title: t("settingsReset"),
      description: t("settingsResetMessage"),
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
                <h1 className="text-3xl font-bold tracking-tight">{t("settings")}</h1>
                <p className="text-muted-foreground">{t("configureNotifications")}</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("appearance")}</CardTitle>
                      <CardDescription>{t("customizeAppLooks")}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="theme">{t("theme")}</Label>
                        <Select value={formData.theme} onValueChange={(value) => handleSelectChange("theme", value)}>
                          <SelectTrigger id="theme">
                            <SelectValue placeholder={t("theme")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">{t("light")}</SelectItem>
                            <SelectItem value="dark">{t("dark")}</SelectItem>
                            <SelectItem value="system">{t("system")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="language">{t("language")}</Label>
                        <Select
                          value={formData.language}
                          onValueChange={(value) => handleSelectChange("language", value)}
                        >
                          <SelectTrigger id="language">
                            <SelectValue placeholder={t("language")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">{t("english")}</SelectItem>
                            <SelectItem value="sw">{t("swahili")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t("notifications")}</CardTitle>
                      <CardDescription>{t("configureNotifications")}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifyAppointments" className="flex-1">
                          {t("appointmentReminders")}
                        </Label>
                        <Switch
                          id="notifyAppointments"
                          checked={formData.notifyAppointments}
                          onCheckedChange={(checked) => handleSwitchChange("notifyAppointments", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifyMedications" className="flex-1">
                          {t("medicationReminders")}
                        </Label>
                        <Switch
                          id="notifyMedications"
                          checked={formData.notifyMedications}
                          onCheckedChange={(checked) => handleSwitchChange("notifyMedications", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifyHealthTips" className="flex-1">
                          {t("healthTipsNotifications")}
                        </Label>
                        <Switch
                          id="notifyHealthTips"
                          checked={formData.notifyHealthTips}
                          onCheckedChange={(checked) => handleSwitchChange("notifyHealthTips", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifyUpdates" className="flex-1">
                          {t("appUpdates")}
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
                      <CardTitle>{t("privacy")}</CardTitle>
                      <CardDescription>{t("manageDataSharing")}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="shareData" className="flex-1">
                          {t("shareHealthData")}
                        </Label>
                        <Switch
                          id="shareData"
                          checked={formData.shareData}
                          onCheckedChange={(checked) => handleSwitchChange("shareData", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="anonymousAnalytics" className="flex-1">
                          {t("anonymousAnalytics")}
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
                        {t("resetToDefaults")}
                      </Button>
                      <Button type="submit">{t("saveChanges")}</Button>
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

