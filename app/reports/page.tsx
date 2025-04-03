"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/context/app-provider"
import { BarChart3, Download, LineChart, PieChart } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { HealthSummaryChart } from "@/components/charts/health-summary-chart"
import { BloodPressureChart } from "@/components/charts/blood-pressure-chart"
import { HeartRateChart } from "@/components/charts/heart-rate-chart"
import { SleepChart } from "@/components/charts/sleep-chart"
import { MedicationAdherenceChart } from "@/components/charts/medication-adherence-chart"
import { AppointmentTypesChart } from "@/components/charts/appointment-types-chart"
import { AppointmentLocationsChart } from "@/components/charts/appointment-locations-chart"
import { exportToCSV } from "@/lib/export-utils"

export default function ReportsPage() {
  const { healthData, appointments, medications, initialized } = useApp()
  const [timeRange, setTimeRange] = useState("week")

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Filter data based on selected time range
  const filterDataByTimeRange = (data: any[]) => {
    if (!data || !Array.isArray(data)) return []

    const endDate = new Date()
    let startDate: Date

    switch (timeRange) {
      case "week":
        startDate = new Date(endDate)
        startDate.setDate(endDate.getDate() - 7)
        break
      case "month":
        startDate = new Date(endDate)
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case "quarter":
        startDate = new Date(endDate)
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case "year":
        startDate = new Date(endDate)
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate = new Date(endDate)
        startDate.setDate(endDate.getDate() - 7)
    }

    return data.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  // Filter health data
  const filteredHealthData = {
    bloodPressure: filterDataByTimeRange(healthData.bloodPressure),
    heartRate: filterDataByTimeRange(healthData.heartRate),
    weight: filterDataByTimeRange(healthData.weight),
    sleep: filterDataByTimeRange(healthData.sleep),
  }

  // Filter appointments
  const filteredAppointments = filterDataByTimeRange(appointments)

  // Handle export
  const handleExport = () => {
    const dataToExport = {
      bloodPressure: filteredHealthData.bloodPressure,
      heartRate: filteredHealthData.heartRate,
      weight: filteredHealthData.weight,
      sleep: filteredHealthData.sleep,
      appointments: filteredAppointments,
      medications: medications,
    }

    exportToCSV(dataToExport, `health-report-${timeRange}`)
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
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                  <p className="text-muted-foreground">View and analyze your health data</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last 3 Months</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="vitals">Vitals</TabsTrigger>
                  <TabsTrigger value="medications">Medications</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="col-span-full">
                      <CardHeader>
                        <CardTitle>Health Summary</CardTitle>
                        <CardDescription>Overview of your health metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <HealthSummaryChart healthData={filteredHealthData} height={300} timeRange={timeRange as any} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Blood Pressure Trends</CardTitle>
                        <CardDescription>Systolic and diastolic readings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <BloodPressureChart data={filteredHealthData.bloodPressure} height={200} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Heart Rate Trends</CardTitle>
                        <CardDescription>Average heart rate over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <HeartRateChart data={filteredHealthData.heartRate} height={200} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Sleep Quality</CardTitle>
                        <CardDescription>Sleep duration and quality</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <SleepChart data={filteredHealthData.sleep} height={200} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="vitals">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="col-span-full">
                      <CardHeader>
                        <CardTitle>Vital Signs</CardTitle>
                        <CardDescription>Detailed view of your vital signs</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <HealthSummaryChart healthData={filteredHealthData} height={300} timeRange={timeRange as any} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Blood Pressure Analysis</CardTitle>
                        <CardDescription>Detailed blood pressure analysis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <BloodPressureChart data={filteredHealthData.bloodPressure} height={200} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Heart Rate Analysis</CardTitle>
                        <CardDescription>Detailed heart rate analysis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <HeartRateChart data={filteredHealthData.heartRate} height={200} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="medications">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="col-span-full">
                      <CardHeader>
                        <CardTitle>Medication Adherence</CardTitle>
                        <CardDescription>Track your medication adherence</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <MedicationAdherenceChart medications={medications} height={300} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Medication Schedule</CardTitle>
                        <CardDescription>Your medication schedule</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px] w-full bg-muted rounded-md flex items-center justify-center">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <PieChart className="h-4 w-4" />
                            <span>Medication schedule chart would appear here</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Medication History</CardTitle>
                        <CardDescription>History of your medications</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px] w-full bg-muted rounded-md flex items-center justify-center">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <LineChart className="h-4 w-4" />
                            <span>Medication history chart would appear here</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="appointments">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="col-span-full">
                      <CardHeader>
                        <CardTitle>Appointment History</CardTitle>
                        <CardDescription>History of your medical appointments</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <BarChart3 className="h-4 w-4" />
                            <span>Appointment history chart would appear here</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Appointment Types</CardTitle>
                        <CardDescription>Types of appointments</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AppointmentTypesChart appointments={filteredAppointments} height={200} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Appointment Locations</CardTitle>
                        <CardDescription>Locations of your appointments</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AppointmentLocationsChart appointments={filteredAppointments} height={200} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

