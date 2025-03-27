"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/context/app-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { Activity, Heart, Plus, Scale, Moon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
// At the top of the file, import ProtectedRoute
import { ProtectedRoute } from "@/components/protected-route"
// Update the imports at the top of the file
import { BloodPressureChart } from "@/components/charts/blood-pressure-chart"
import { HeartRateChart } from "@/components/charts/heart-rate-chart"
import { WeightChart } from "@/components/charts/weight-chart"
import { SleepChart } from "@/components/charts/sleep-chart"

const bloodPressureFormSchema = z.object({
  systolic: z.coerce.number().min(70).max(220),
  diastolic: z.coerce.number().min(40).max(120),
  date: z.date({
    required_error: "Please select a date.",
  }),
})

const heartRateFormSchema = z.object({
  value: z.coerce.number().min(40).max(220),
  date: z.date({
    required_error: "Please select a date.",
  }),
})

const weightFormSchema = z.object({
  value: z.coerce.number().min(20).max(500),
  date: z.date({
    required_error: "Please select a date.",
  }),
})

const sleepFormSchema = z.object({
  hours: z.coerce.number().min(0).max(24),
  quality: z.enum(["poor", "fair", "good", "excellent"]),
  date: z.date({
    required_error: "Please select a date.",
  }),
})

type BloodPressureFormValues = z.infer<typeof bloodPressureFormSchema>
type HeartRateFormValues = z.infer<typeof heartRateFormSchema>
type WeightFormValues = z.infer<typeof weightFormSchema>
type SleepFormValues = z.infer<typeof sleepFormSchema>

export default function HealthDataPage() {
  const { healthData, updateHealthData, initialized } = useApp()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("blood-pressure")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const bloodPressureForm = useForm<BloodPressureFormValues>({
    resolver: zodResolver(bloodPressureFormSchema),
    defaultValues: {
      systolic: 120,
      diastolic: 80,
      date: new Date(),
    },
  })

  const heartRateForm = useForm<HeartRateFormValues>({
    resolver: zodResolver(heartRateFormSchema),
    defaultValues: {
      value: 70,
      date: new Date(),
    },
  })

  const weightForm = useForm<WeightFormValues>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: {
      value: 70,
      date: new Date(),
    },
  })

  const sleepForm = useForm<SleepFormValues>({
    resolver: zodResolver(sleepFormSchema),
    defaultValues: {
      hours: 8,
      quality: "good",
      date: new Date(),
    },
  })

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const onSubmitBloodPressure = (data: BloodPressureFormValues) => {
    const newData = {
      ...healthData,
      bloodPressure: [
        ...healthData.bloodPressure,
        {
          date: data.date.toISOString(),
          systolic: data.systolic,
          diastolic: data.diastolic,
        },
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    }

    updateHealthData(newData)

    toast({
      title: "Blood Pressure Added",
      description: "Your blood pressure reading has been saved.",
    })

    bloodPressureForm.reset()
    setIsDialogOpen(false)
  }

  const onSubmitHeartRate = (data: HeartRateFormValues) => {
    const newData = {
      ...healthData,
      heartRate: [
        ...healthData.heartRate,
        {
          date: data.date.toISOString(),
          value: data.value,
        },
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    }

    updateHealthData(newData)

    toast({
      title: "Heart Rate Added",
      description: "Your heart rate reading has been saved.",
    })

    heartRateForm.reset()
    setIsDialogOpen(false)
  }

  const onSubmitWeight = (data: WeightFormValues) => {
    const newData = {
      ...healthData,
      weight: [
        ...healthData.weight,
        {
          date: data.date.toISOString(),
          value: data.value,
        },
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    }

    updateHealthData(newData)

    toast({
      title: "Weight Added",
      description: "Your weight reading has been saved.",
    })

    weightForm.reset()
    setIsDialogOpen(false)
  }

  const onSubmitSleep = (data: SleepFormValues) => {
    const newData = {
      ...healthData,
      sleep: [
        ...healthData.sleep,
        {
          date: data.date.toISOString(),
          hours: data.hours,
          quality: data.quality,
        },
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    }

    updateHealthData(newData)

    toast({
      title: "Sleep Data Added",
      description: "Your sleep data has been saved.",
    })

    sleepForm.reset()
    setIsDialogOpen(false)
  }

  const getLatestBloodPressure = () => {
    if (healthData.bloodPressure.length === 0) return null
    return healthData.bloodPressure[healthData.bloodPressure.length - 1]
  }

  const getLatestHeartRate = () => {
    if (healthData.heartRate.length === 0) return null
    return healthData.heartRate[healthData.heartRate.length - 1]
  }

  const getLatestWeight = () => {
    if (healthData.weight.length === 0) return null
    return healthData.weight[healthData.weight.length - 1]
  }

  const getLatestSleep = () => {
    if (healthData.sleep.length === 0) return null
    return healthData.sleep[healthData.sleep.length - 1]
  }

  const latestBloodPressure = getLatestBloodPressure()
  const latestHeartRate = getLatestHeartRate()
  const latestWeight = getLatestWeight()
  const latestSleep = getLatestSleep()

  // Wrap the return statement with ProtectedRoute
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
                  <h1 className="text-3xl font-bold tracking-tight">Health Data</h1>
                  <p className="text-muted-foreground">Track and monitor your health metrics</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Reading
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Health Data</DialogTitle>
                      <DialogDescription>Enter your health metrics to track your progress.</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="blood-pressure" value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-4 mb-4">
                        <TabsTrigger value="blood-pressure">BP</TabsTrigger>
                        <TabsTrigger value="heart-rate">HR</TabsTrigger>
                        <TabsTrigger value="weight">Weight</TabsTrigger>
                        <TabsTrigger value="sleep">Sleep</TabsTrigger>
                      </TabsList>
                      <TabsContent value="blood-pressure">
                        <Form {...bloodPressureForm}>
                          <form onSubmit={bloodPressureForm.handleSubmit(onSubmitBloodPressure)} className="space-y-4">
                            <FormField
                              control={bloodPressureForm.control}
                              name="systolic"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Systolic (mmHg)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={bloodPressureForm.control}
                              name="diastolic"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Diastolic (mmHg)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={bloodPressureForm.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                      onChange={(e) => field.onChange(new Date(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">Save</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </TabsContent>
                      <TabsContent value="heart-rate">
                        <Form {...heartRateForm}>
                          <form onSubmit={heartRateForm.handleSubmit(onSubmitHeartRate)} className="space-y-4">
                            <FormField
                              control={heartRateForm.control}
                              name="value"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Heart Rate (BPM)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={heartRateForm.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                      onChange={(e) => field.onChange(new Date(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">Save</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </TabsContent>
                      <TabsContent value="weight">
                        <Form {...weightForm}>
                          <form onSubmit={weightForm.handleSubmit(onSubmitWeight)} className="space-y-4">
                            <FormField
                              control={weightForm.control}
                              name="value"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Weight (kg)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={weightForm.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                      onChange={(e) => field.onChange(new Date(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">Save</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </TabsContent>
                      <TabsContent value="sleep">
                        <Form {...sleepForm}>
                          <form onSubmit={sleepForm.handleSubmit(onSubmitSleep)} className="space-y-4">
                            <FormField
                              control={sleepForm.control}
                              name="hours"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sleep Duration (hours)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={sleepForm.control}
                              name="quality"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sleep Quality</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select sleep quality" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="poor">Poor</SelectItem>
                                      <SelectItem value="fair">Fair</SelectItem>
                                      <SelectItem value="good">Good</SelectItem>
                                      <SelectItem value="excellent">Excellent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={sleepForm.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                      onChange={(e) => field.onChange(new Date(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">Save</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    <CardTitle className="text-sm font-medium">Weight</CardTitle>
                    <Scale className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{latestWeight ? `${latestWeight.value} kg` : "No data"}</div>
                    <p className="text-xs text-muted-foreground">
                      {latestWeight ? `Last updated: ${new Date(latestWeight.date).toLocaleDateString()}` : ""}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sleep</CardTitle>
                    <Moon className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{latestSleep ? `${latestSleep.hours} hrs` : "No data"}</div>
                    <p className="text-xs text-muted-foreground">
                      {latestSleep
                        ? `Quality: ${latestSleep.quality.charAt(0).toUpperCase() + latestSleep.quality.slice(1)}`
                        : ""}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="blood-pressure">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="blood-pressure">Blood Pressure</TabsTrigger>
                  <TabsTrigger value="heart-rate">Heart Rate</TabsTrigger>
                  <TabsTrigger value="weight">Weight</TabsTrigger>
                  <TabsTrigger value="sleep">Sleep</TabsTrigger>
                </TabsList>
                {/* Replace the placeholder chart divs with actual charts */}
                {/* For example, in the Blood Pressure tab content: */}
                <TabsContent value="blood-pressure">
                  <Card>
                    <CardHeader>
                      <CardTitle>Blood Pressure History</CardTitle>
                      <CardDescription>Your blood pressure readings over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {healthData.bloodPressure.length > 0 ? (
                        <div className="space-y-8">
                          <BloodPressureChart data={healthData.bloodPressure} height={200} />
                          <div className="space-y-2">
                            {healthData.bloodPressure
                              .slice()
                              .reverse()
                              .map((reading, index) => (
                                <div key={index} className="flex justify-between items-center p-2 border-b">
                                  <div className="font-medium">{new Date(reading.date).toLocaleDateString()}</div>
                                  <div className="text-health-green-500">
                                    {reading.systolic}/{reading.diastolic} mmHg
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No blood pressure data available</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="heart-rate">
                  <Card>
                    <CardHeader>
                      <CardTitle>Heart Rate History</CardTitle>
                      <CardDescription>Your heart rate readings over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {healthData.heartRate.length > 0 ? (
                        <div className="space-y-8">
                          <HeartRateChart data={healthData.heartRate} height={200} />
                          <div className="space-y-2">
                            {healthData.heartRate
                              .slice()
                              .reverse()
                              .map((reading, index) => (
                                <div key={index} className="flex justify-between items-center p-2 border-b">
                                  <div className="font-medium">{new Date(reading.date).toLocaleDateString()}</div>
                                  <div className="text-health-green-500">{reading.value} BPM</div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No heart rate data available</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="weight">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weight History</CardTitle>
                      <CardDescription>Your weight readings over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {healthData.weight.length > 0 ? (
                        <div className="space-y-8">
                          <WeightChart data={healthData.weight} height={200} />
                          <div className="space-y-2">
                            {healthData.weight
                              .slice()
                              .reverse()
                              .map((reading, index) => (
                                <div key={index} className="flex justify-between items-center p-2 border-b">
                                  <div className="font-medium">{new Date(reading.date).toLocaleDateString()}</div>
                                  <div className="text-health-green-500">{reading.value} kg</div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No weight data available</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="sleep">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sleep History</CardTitle>
                      <CardDescription>Your sleep patterns over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {healthData.sleep.length > 0 ? (
                        <div className="space-y-8">
                          <SleepChart data={healthData.sleep} height={200} />
                          <div className="space-y-2">
                            {healthData.sleep
                              .slice()
                              .reverse()
                              .map((reading, index) => (
                                <div key={index} className="flex justify-between items-center p-2 border-b">
                                  <div className="font-medium">{new Date(reading.date).toLocaleDateString()}</div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-health-green-500">{reading.hours} hrs</span>
                                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                      {reading.quality.charAt(0).toUpperCase() + reading.quality.slice(1)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No sleep data available</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

