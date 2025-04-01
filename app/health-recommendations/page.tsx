"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/app-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Info, Heart, Activity, Scale, Moon } from "lucide-react"
import * as api from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface HealthTip {
  id: string
  title: string
  description: string
  category: string
  priority: string
}

export default function HealthRecommendationsPage() {
  const { profile, healthData, medications, currentUserId } = useApp()
  const { toast } = useToast()
  const [personalizedTips, setPersonalizedTips] = useState<HealthTip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [alerts, setAlerts] = useState<{ title: string; description: string; type: "warning" | "info" }[]>([])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        if (currentUserId) {
          const tips = await api.getPersonalizedTips(currentUserId)
          setPersonalizedTips(tips)
        }

        // Check for health alerts
        const healthAlerts = []

        // Check blood pressure
        if (healthData.bloodPressure && healthData.bloodPressure.length > 0) {
          const latestBP = healthData.bloodPressure[healthData.bloodPressure.length - 1]
          if (latestBP.systolic > 140 || latestBP.diastolic > 90) {
            healthAlerts.push({
              title: "High Blood Pressure Alert",
              description: `Your latest blood pressure reading (${latestBP.systolic}/${latestBP.diastolic}) is above the normal range. Consider consulting your healthcare provider.`,
              type: "warning" as const,
            })
          } else if (latestBP.systolic > 130 || latestBP.diastolic > 80) {
            healthAlerts.push({
              title: "Elevated Blood Pressure",
              description: `Your latest blood pressure reading (${latestBP.systolic}/${latestBP.diastolic}) is slightly elevated. Monitor regularly and consider lifestyle changes.`,
              type: "info" as const,
            })
          }
        }

        // Check heart rate
        if (healthData.heartRate && healthData.heartRate.length > 0) {
          const latestHR = healthData.heartRate[healthData.heartRate.length - 1]
          if (latestHR.value > 100) {
            healthAlerts.push({
              title: "Elevated Heart Rate",
              description: `Your latest heart rate reading (${latestHR.value} BPM) is above the normal resting range. If this persists, consider consulting your healthcare provider.`,
              type: "info" as const,
            })
          } else if (latestHR.value < 50) {
            healthAlerts.push({
              title: "Low Heart Rate",
              description: `Your latest heart rate reading (${latestHR.value} BPM) is below the normal resting range. If you're not an athlete, consider consulting your healthcare provider.`,
              type: "warning" as const,
            })
          }
        }

        // Check BMI if height and weight are available
        if (profile.height && profile.weight) {
          const heightInMeters = profile.height / 100
          const bmi = profile.weight / (heightInMeters * heightInMeters)

          if (bmi > 30) {
            healthAlerts.push({
              title: "BMI Alert",
              description: `Your BMI is ${bmi.toFixed(1)}, which falls in the obese range. Consider discussing weight management strategies with your healthcare provider.`,
              type: "warning" as const,
            })
          } else if (bmi > 25) {
            healthAlerts.push({
              title: "BMI Notice",
              description: `Your BMI is ${bmi.toFixed(1)}, which falls in the overweight range. Consider healthy lifestyle changes to manage your weight.`,
              type: "info" as const,
            })
          } else if (bmi < 18.5) {
            healthAlerts.push({
              title: "BMI Alert",
              description: `Your BMI is ${bmi.toFixed(1)}, which falls in the underweight range. Consider discussing nutrition strategies with your healthcare provider.`,
              type: "warning" as const,
            })
          }
        }

        // Check sleep patterns
        if (healthData.sleep && healthData.sleep.length > 0) {
          const recentSleep = healthData.sleep.slice(-7) // Last 7 entries
          const poorSleepCount = recentSleep.filter((s) => s.quality === "poor").length

          if (poorSleepCount >= 3) {
            healthAlerts.push({
              title: "Sleep Quality Alert",
              description:
                "You've reported poor sleep quality multiple times recently. Consider reviewing your sleep habits and environment.",
              type: "info" as const,
            })
          }

          const lowSleepCount = recentSleep.filter((s) => s.hours < 6).length
          if (lowSleepCount >= 3) {
            healthAlerts.push({
              title: "Sleep Duration Alert",
              description:
                "You've been getting less than 6 hours of sleep multiple times recently. Insufficient sleep can impact your health and wellbeing.",
              type: "warning" as const,
            })
          }
        }

        setAlerts(healthAlerts)
      } catch (error) {
        console.error("Error loading health recommendations:", error)
        toast({
          title: "Error",
          description: "Failed to load health recommendations. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [currentUserId, healthData, profile, medications, toast])

  // Group tips by category
  const tipsByCategory: Record<string, HealthTip[]> = {}
  personalizedTips.forEach((tip) => {
    if (!tipsByCategory[tip.category]) {
      tipsByCategory[tip.category] = []
    }
    tipsByCategory[tip.category].push(tip)
  })

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
                <h1 className="text-3xl font-bold tracking-tight">Health Recommendations</h1>
                <p className="text-muted-foreground">
                  Personalized health insights and recommendations based on your data
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-green-500 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading your personalized recommendations...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Health Alerts Section */}
                  {alerts.length > 0 && (
                    <div className="space-y-4 mb-6">
                      <h2 className="text-xl font-semibold">Health Alerts</h2>
                      {alerts.map((alert, index) => (
                        <Alert key={index} variant={alert.type === "warning" ? "destructive" : "default"}>
                          {alert.type === "warning" ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <Info className="h-4 w-4" />
                          )}
                          <AlertTitle>{alert.title}</AlertTitle>
                          <AlertDescription>{alert.description}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  {/* Recommendations Tabs */}
                  <Tabs defaultValue="all">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                      <TabsTrigger value="all">All</TabsTrigger>
                      {Object.keys(tipsByCategory).map((category) => (
                        <TabsTrigger key={category} value={category.toLowerCase().replace(/\s+/g, "-")}>
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value="all">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                        {personalizedTips.map((tip) => (
                          <Card
                            key={tip.id}
                            className={`
                            ${tip.priority === "high" ? "border-health-green-500" : ""}
                            ${tip.priority === "medium" ? "border-yellow-500" : ""}
                            ${tip.priority === "low" ? "border-blue-500" : ""}
                          `}
                          >
                            <CardHeader>
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full
                                  ${tip.priority === "high" ? "bg-health-green-100 text-health-green-700 dark:bg-health-green-900 dark:text-health-green-300" : ""}
                                  ${tip.priority === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" : ""}
                                  ${tip.priority === "low" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : ""}
                                `}
                                >
                                  {tip.category}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full
                                  ${tip.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" : ""}
                                  ${tip.priority === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" : ""}
                                  ${tip.priority === "low" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : ""}
                                `}
                                >
                                  {tip.priority.charAt(0).toUpperCase() + tip.priority.slice(1)} Priority
                                </span>
                              </div>
                              <CardTitle>{tip.title}</CardTitle>
                              <CardDescription>{tip.description}</CardDescription>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {Object.entries(tipsByCategory).map(([category, tips]) => (
                      <TabsContent key={category} value={category.toLowerCase().replace(/\s+/g, "-")}>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                          {tips.map((tip) => (
                            <Card
                              key={tip.id}
                              className={`
                              ${tip.priority === "high" ? "border-health-green-500" : ""}
                              ${tip.priority === "medium" ? "border-yellow-500" : ""}
                              ${tip.priority === "low" ? "border-blue-500" : ""}
                            `}
                            >
                              <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full
                                    ${tip.priority === "high" ? "bg-health-green-100 text-health-green-700 dark:bg-health-green-900 dark:text-health-green-300" : ""}
                                    ${tip.priority === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" : ""}
                                    ${tip.priority === "low" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : ""}
                                  `}
                                  >
                                    {tip.category}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full
                                    ${tip.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" : ""}
                                    ${tip.priority === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" : ""}
                                    ${tip.priority === "low" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : ""}
                                  `}
                                  >
                                    {tip.priority.charAt(0).toUpperCase() + tip.priority.slice(1)} Priority
                                  </span>
                                </div>
                                <CardTitle>{tip.title}</CardTitle>
                                <CardDescription>{tip.description}</CardDescription>
                              </CardHeader>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  {/* Health Data Summary */}
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Your Health Summary</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                          <Activity className="h-4 w-4 text-health-green-500" />
                        </CardHeader>
                        <CardContent>
                          {healthData.bloodPressure.length > 0 ? (
                            <>
                              <div className="text-2xl font-bold">
                                {healthData.bloodPressure[healthData.bloodPressure.length - 1].systolic}/
                                {healthData.bloodPressure[healthData.bloodPressure.length - 1].diastolic} mmHg
                              </div>
                              <Button variant="link" className="p-0 h-auto" asChild>
                                <Link href="/health-data?tab=blood-pressure">View History</Link>
                              </Button>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">No data available</div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                          <Heart className="h-4 w-4 text-health-green-500" />
                        </CardHeader>
                        <CardContent>
                          {healthData.heartRate.length > 0 ? (
                            <>
                              <div className="text-2xl font-bold">
                                {healthData.heartRate[healthData.heartRate.length - 1].value} BPM
                              </div>
                              <Button variant="link" className="p-0 h-auto" asChild>
                                <Link href="/health-data?tab=heart-rate">View History</Link>
                              </Button>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">No data available</div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Weight</CardTitle>
                          <Scale className="h-4 w-4 text-health-green-500" />
                        </CardHeader>
                        <CardContent>
                          {healthData.weight.length > 0 ? (
                            <>
                              <div className="text-2xl font-bold">
                                {healthData.weight[healthData.weight.length - 1].value} kg
                              </div>
                              <Button variant="link" className="p-0 h-auto" asChild>
                                <Link href="/health-data?tab=weight">View History</Link>
                              </Button>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">No data available</div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Sleep</CardTitle>
                          <Moon className="h-4 w-4 text-health-green-500" />
                        </CardHeader>
                        <CardContent>
                          {healthData.sleep.length > 0 ? (
                            <>
                              <div className="text-2xl font-bold">
                                {healthData.sleep[healthData.sleep.length - 1].hours} hrs
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Quality:{" "}
                                {healthData.sleep[healthData.sleep.length - 1].quality.charAt(0).toUpperCase() +
                                  healthData.sleep[healthData.sleep.length - 1].quality.slice(1)}
                              </div>
                              <Button variant="link" className="p-0 h-auto" asChild>
                                <Link href="/health-data?tab=sleep">View History</Link>
                              </Button>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">No data available</div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

