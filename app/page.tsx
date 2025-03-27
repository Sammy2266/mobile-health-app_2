"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/context/app-provider"
import { formatDate, formatDateTime, getNextAppointment } from "@/lib/utils"
import { Activity, Calendar, Heart, User } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HealthSummaryChart } from "@/components/charts/health-summary-chart"

export default function Dashboard() {
  const { profile, appointments, healthData, currentDate, initialized } = useApp()

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const nextAppointment = getNextAppointment(appointments)
  const latestHeartRate = healthData.heartRate.length > 0 ? healthData.heartRate[healthData.heartRate.length - 1] : null
  const latestBloodPressure =
    healthData.bloodPressure.length > 0 ? healthData.bloodPressure[healthData.bloodPressure.length - 1] : null

  const getDaysUntil = (date: Date | string): number => {
    const now = new Date()
    const appointmentDate = new Date(date)
    const diff = appointmentDate.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 3600 * 24))
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
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back{profile.name ? `, ${profile.name.split(' ')[0]}` : ""}! Here's your health overview.
                </p>
                <p className="text-sm text-muted-foreground">{formatDate(currentDate)}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                    <Heart className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {latestHeartRate ? `${latestHeartRate.value} BPM` : "No data"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {latestHeartRate ? `Last updated: ${new Date(latestHeartRate.date).toLocaleDateString()}` : ""}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                    <Activity className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {latestBloodPressure
                        ? `${latestBloodPressure.systolic}/${latestBloodPressure.diastolic}`
                        : "No data"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {latestBloodPressure
                        ? `Last updated: ${new Date(latestBloodPressure.date).toLocaleDateString()}`
                        : ""}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                    <Calendar className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    {nextAppointment ? (
                      <>
                        <div className="text-2xl font-bold">{nextAppointment.daysUntil} days</div>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(new Date(nextAppointment.date))}
                        </p>
                      </>
                    ) : (
                      <div className="text-sm">No upcoming appointments</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
                    <User className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{profile.name ? "40%" : "10%"}</div>
                    <Progress value={profile.name ? 40 : 10} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">Complete your profile for better insights</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Health Trends</CardTitle>
                    <CardDescription>Your health metrics over the past week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HealthSummaryChart healthData={healthData} height={200} />
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {appointments.filter((a) => !a.completed).length > 0 ? (
                      <div className="space-y-4">
                        {appointments
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
                                {getDaysUntil(appointment.date)} days
                              </div>
                            </div>
                          ))}
                        <Button asChild variant="outline" className="w-full mt-2">
                          <Link href="/appointments">View All</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">No upcoming appointments</div>
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

