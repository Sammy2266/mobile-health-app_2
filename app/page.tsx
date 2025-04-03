"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/context/app-provider"
import { formatDate, formatDateTime, getNextAppointment } from "@/lib/utils"
import { Activity, Calendar, Heart, User } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HealthSummaryChart } from "@/components/charts/health-summary-chart"
import { calculateProfileCompletion } from "@/lib/profile-utils"
import { translations } from "@/lib/translations"

export default function Dashboard() {
  const { profile, appointments, healthData, currentDate, initialized, settings } = useApp()

  // Get translations based on user's language preference
  const language = settings?.language || "en"
  const t = (key: string) => {
    return translations[language]?.[key] || translations["en"][key] || key
  }

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">{t("loading")}</div>
  }

  // Add null checks for all data
  const safeAppointments = appointments || []
  const safeHealthData = healthData || {
    bloodPressure: [],
    heartRate: [],
    weight: [],
    sleep: [],
  }

  // Ensure all health data arrays are actually arrays
  const validHealthData = {
    bloodPressure: Array.isArray(safeHealthData.bloodPressure) ? safeHealthData.bloodPressure : [],
    heartRate: Array.isArray(safeHealthData.heartRate) ? safeHealthData.heartRate : [],
    weight: Array.isArray(safeHealthData.weight) ? safeHealthData.weight : [],
    sleep: Array.isArray(safeHealthData.sleep) ? safeHealthData.sleep : [],
  }

  const nextAppointment = getNextAppointment(safeAppointments)
  const latestHeartRate =
    validHealthData.heartRate.length > 0 ? validHealthData.heartRate[validHealthData.heartRate.length - 1] : null

  const latestBloodPressure =
    validHealthData.bloodPressure.length > 0
      ? validHealthData.bloodPressure[validHealthData.bloodPressure.length - 1]
      : null

  const getDaysUntil = (date: Date | string): number => {
    const now = new Date()
    const appointmentDate = new Date(date)
    const diff = appointmentDate.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 3600 * 24))
  }

  // Calculate profile completion percentage
  const profileCompletion = calculateProfileCompletion(profile || {})

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
                <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
                <p className="text-muted-foreground">
                  {t("welcome")}
                  {profile && profile.name ? `, ${profile.name.split(" ")[0]}` : ""}! {t("healthOverview")}
                </p>
                <p className="text-sm text-muted-foreground">{formatDate(currentDate)}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("heartRate")}</CardTitle>
                    <Heart className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {latestHeartRate ? `${latestHeartRate.value} BPM` : t("noData")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {latestHeartRate
                        ? `${t("lastUpdated")}: ${new Date(latestHeartRate.date).toLocaleDateString()}`
                        : ""}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("bloodPressure")}</CardTitle>
                    <Activity className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {latestBloodPressure
                        ? `${latestBloodPressure.systolic}/${latestBloodPressure.diastolic}`
                        : t("noData")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {latestBloodPressure
                        ? `${t("lastUpdated")}: ${new Date(latestBloodPressure.date).toLocaleDateString()}`
                        : ""}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("nextAppointment")}</CardTitle>
                    <Calendar className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    {nextAppointment ? (
                      <>
                        <div className="text-2xl font-bold">
                          {nextAppointment.daysUntil} {t("days")}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(new Date(nextAppointment.date))}
                        </p>
                      </>
                    ) : (
                      <div className="text-sm">{t("noUpcomingAppointments")}</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("profileCompletion")}</CardTitle>
                    <User className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{profileCompletion}%</div>
                    <Progress value={profileCompletion} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {profileCompletion < 100 ? (
                        <Link href="/profile" className="text-health-green-500 hover:underline">
                          {t("completeProfile")}
                        </Link>
                      ) : (
                        t("profileComplete")
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>{t("healthTrends")}</CardTitle>
                    <CardDescription>{t("yourHealthMetrics")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HealthSummaryChart healthData={validHealthData} height={200} timeRange="week" />
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>{t("upcomingAppointments")}</CardTitle>
                    <CardDescription>{t("yourScheduledAppointments")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {safeAppointments.filter((a) => !a.completed).length > 0 ? (
                      <div className="space-y-4">
                        {safeAppointments
                          .filter((appointment) => !appointment.completed)
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .slice(0, 3)
                          .map((appointment) => (
                            <div key={appointment.id} className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-health-green-100 dark:bg-health-green-900 flex items-center justify-center text-health-green-500">
                                <Calendar className="h-6 w-6" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{appointment.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDateTime(new Date(appointment.date))}
                                </p>
                              </div>
                              <div className="bg-health-green-100 dark:bg-health-green-900 text-health-green-700 dark:text-health-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {getDaysUntil(appointment.date)} {t("days")}
                              </div>
                            </div>
                          ))}
                        <Button asChild variant="outline" className="w-full mt-2">
                          <Link href="/appointments">{t("viewAll")}</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">{t("noUpcomingAppointments")}</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

