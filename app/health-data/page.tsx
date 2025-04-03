"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useApp } from "@/context/app-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BloodPressureChart } from "@/components/charts/blood-pressure-chart"
import { HeartRateChart } from "@/components/charts/heart-rate-chart"
import { WeightChart } from "@/components/charts/weight-chart"
import { SleepChart } from "@/components/charts/sleep-chart"
import { v4 as uuidv4 } from "uuid"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface HealthData {
  id: string
  date: string
  value: number | string
  notes?: string
}

interface BloodPressureData extends HealthData {
  systolic: number
  diastolic: number
}

export default function HealthDataPage() {
  const { healthData, updateHealthData, initialized } = useApp()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("blood-pressure")

  // Get current date in YYYY-MM-DD format for date inputs
  const today = new Date().toISOString().split("T")[0]

  // Form states
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [bpDate, setBpDate] = useState(today)

  const [heartRate, setHeartRate] = useState("")
  const [hrDate, setHrDate] = useState(today)

  const [weight, setWeight] = useState("")
  const [weightDate, setWeightDate] = useState(today)

  const [sleepHours, setSleepHours] = useState("")
  const [sleepDate, setSleepDate] = useState(today)

  // Edit states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editType, setEditType] = useState("")
  const [editIndex, setEditIndex] = useState(-1)
  const [editData, setEditData] = useState<any>({})

  // Add sleep quality state
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "excellent">("good")

  // Add delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState("")
  const [deleteIndex, setDeleteIndex] = useState(-1)

  useEffect(() => {}, [healthData])

  const handleBloodPressureSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!systolic || !diastolic || !bpDate) {
      toast({
        title: "Missing values",
        description: "Please enter both systolic and diastolic values, and select a date.",
        variant: "destructive",
      })
      return
    }

    const systolicValue = Number.parseInt(systolic)
    const diastolicValue = Number.parseInt(diastolic)

    if (isNaN(systolicValue) || isNaN(diastolicValue)) {
      toast({
        title: "Invalid values",
        description: "Please enter valid numbers for blood pressure.",
        variant: "destructive",
      })
      return
    }

    // Create date with time set to noon to avoid timezone issues
    const selectedDate = new Date(bpDate)
    selectedDate.setHours(12, 0, 0, 0)
    const dateString = selectedDate.toISOString()

    // Check for duplicate entries by date only (ignoring time)
    const isDuplicate = healthData.bloodPressure.some((bp) => {
      const bpDate = new Date(bp.date)
      const selectedDateOnly = new Date(selectedDate)

      // Set both dates to start of day for comparison
      bpDate.setHours(0, 0, 0, 0)
      selectedDateOnly.setHours(0, 0, 0, 0)

      return bpDate.getTime() === selectedDateOnly.getTime()
    })

    if (isDuplicate) {
      toast({
        title: "Duplicate entry",
        description: "You already have a blood pressure reading for this date. Please edit the existing entry instead.",
        variant: "destructive",
      })
      return
    }

    const newBloodPressure = [
      ...healthData.bloodPressure,
      {
        id: uuidv4(),
        date: dateString,
        systolic: systolicValue,
        diastolic: diastolicValue,
      },
    ]

    updateHealthData({
      ...healthData,
      bloodPressure: newBloodPressure,
    })
      .then(() => {
        toast({
          title: "Blood pressure added",
          description: "Your blood pressure reading has been saved.",
        })
        setSystolic("")
        setDiastolic("")
        // Keep the date as is for convenience
      })
      .catch((error) => {
        console.error("Error saving blood pressure:", error)
        toast({
          title: "Error",
          description: "Failed to save blood pressure reading. Please try again.",
          variant: "destructive",
        })
      })
  }

  const handleHeartRateSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!heartRate || !hrDate) {
      toast({
        title: "Missing values",
        description: "Please enter a heart rate value and select a date.",
        variant: "destructive",
      })
      return
    }

    const heartRateValue = Number.parseInt(heartRate)

    if (isNaN(heartRateValue)) {
      toast({
        title: "Invalid value",
        description: "Please enter a valid number for heart rate.",
        variant: "destructive",
      })
      return
    }

    // Create date with time set to noon to avoid timezone issues
    const selectedDate = new Date(hrDate)
    selectedDate.setHours(12, 0, 0, 0)
    const dateString = selectedDate.toISOString()

    // Check for duplicate entries by date only (ignoring time)
    const isDuplicate = healthData.heartRate.some((hr) => {
      const hrDate = new Date(hr.date)
      const selectedDateOnly = new Date(selectedDate)

      // Set both dates to start of day for comparison
      hrDate.setHours(0, 0, 0, 0)
      selectedDateOnly.setHours(0, 0, 0, 0)

      return hrDate.getTime() === selectedDateOnly.getTime()
    })

    if (isDuplicate) {
      toast({
        title: "Duplicate entry",
        description: "You already have a heart rate reading for this date. Please edit the existing entry instead.",
        variant: "destructive",
      })
      return
    }

    const newHeartRate = [
      ...healthData.heartRate,
      {
        id: uuidv4(),
        date: dateString,
        value: heartRateValue,
      },
    ]

    updateHealthData({
      ...healthData,
      heartRate: newHeartRate,
    })
      .then(() => {
        toast({
          title: "Heart rate added",
          description: "Your heart rate reading has been saved.",
        })
        setHeartRate("")
        // Keep the date as is for convenience
      })
      .catch((error) => {
        console.error("Error saving heart rate:", error)
        toast({
          title: "Error",
          description: "Failed to save heart rate reading. Please try again.",
          variant: "destructive",
        })
      })
  }

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!weight || !weightDate) {
      toast({
        title: "Missing values",
        description: "Please enter a weight value and select a date.",
        variant: "destructive",
      })
      return
    }

    const weightValue = Number.parseFloat(weight)

    if (isNaN(weightValue)) {
      toast({
        title: "Invalid value",
        description: "Please enter a valid number for weight.",
        variant: "destructive",
      })
      return
    }

    // Create date with time set to noon to avoid timezone issues
    const selectedDate = new Date(weightDate)
    selectedDate.setHours(12, 0, 0, 0)
    const dateString = selectedDate.toISOString()

    // Check for duplicate entries by date only (ignoring time)
    const isDuplicate = healthData.weight.some((w) => {
      const wDate = new Date(w.date)
      const selectedDateOnly = new Date(selectedDate)

      // Set both dates to start of day for comparison
      wDate.setHours(0, 0, 0, 0)
      selectedDateOnly.setHours(0, 0, 0, 0)

      return wDate.getTime() === selectedDateOnly.getTime()
    })

    if (isDuplicate) {
      toast({
        title: "Duplicate entry",
        description: "You already have a weight reading for this date. Please edit the existing entry instead.",
        variant: "destructive",
      })
      return
    }

    const newWeight = [
      ...healthData.weight,
      {
        id: uuidv4(),
        date: dateString,
        value: weightValue,
      },
    ]

    updateHealthData({
      ...healthData,
      weight: newWeight,
    })
      .then(() => {
        toast({
          title: "Weight added",
          description: "Your weight reading has been saved.",
        })
        setWeight("")
        // Keep the date as is for convenience
      })
      .catch((error) => {
        console.error("Error saving weight:", error)
        toast({
          title: "Error",
          description: "Failed to save weight reading. Please try again.",
          variant: "destructive",
        })
      })
  }

  // Update the handleSleepSubmit function to properly check for duplicates
  const handleSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!sleepHours || !sleepDate) {
      toast({
        title: "Missing values",
        description: "Please enter sleep hours and select a date.",
        variant: "destructive",
      })
      return
    }

    const sleepValue = Number.parseFloat(sleepHours)

    if (isNaN(sleepValue)) {
      toast({
        title: "Invalid value",
        description: "Please enter a valid number for sleep hours.",
        variant: "destructive",
      })
      return
    }

    // Create date with time set to noon to avoid timezone issues
    const selectedDate = new Date(sleepDate)
    selectedDate.setHours(12, 0, 0, 0)
    const dateString = selectedDate.toISOString()

    // Check for duplicate entries by date only (ignoring time)
    const isDuplicate = healthData.sleep.some((s) => {
      const sDate = new Date(s.date)
      const selectedDateOnly = new Date(selectedDate)

      // Set both dates to start of day for comparison
      sDate.setHours(0, 0, 0, 0)
      selectedDateOnly.setHours(0, 0, 0, 0)

      return sDate.getTime() === selectedDateOnly.getTime()
    })

    if (isDuplicate) {
      toast({
        title: "Duplicate entry",
        description: "You already have a sleep record for this date. Please edit the existing entry instead.",
        variant: "destructive",
      })
      return
    }

    const newSleep = [
      ...healthData.sleep,
      {
        id: uuidv4(),
        date: dateString,
        hours: sleepValue,
        quality: sleepQuality,
      },
    ]

    updateHealthData({
      ...healthData,
      sleep: newSleep,
    })
      .then(() => {
        toast({
          title: "Sleep added",
          description: "Your sleep hours have been saved.",
        })
        setSleepHours("")
        // Keep the date and quality as is for convenience
      })
      .catch((error) => {
        console.error("Error saving sleep hours:", error)
        toast({
          title: "Error",
          description: "Failed to save sleep hours. Please try again.",
          variant: "destructive",
        })
      })
  }

  // Open edit dialog for a specific reading
  const openEditDialog = (type: string, index: number) => {
    setEditType(type)
    setEditIndex(index)

    let dataToEdit = {}

    switch (type) {
      case "blood-pressure":
        const bpDate = new Date(healthData.bloodPressure[index].date)
        dataToEdit = {
          systolic: healthData.bloodPressure[index].systolic.toString(),
          diastolic: healthData.bloodPressure[index].diastolic.toString(),
          date: bpDate.toISOString().split("T")[0],
        }
        break
      case "heart-rate":
        const hrDate = new Date(healthData.heartRate[index].date)
        dataToEdit = {
          value: healthData.heartRate[index].value.toString(),
          date: hrDate.toISOString().split("T")[0],
        }
        break
      case "weight":
        const weightDate = new Date(healthData.weight[index].date)
        dataToEdit = {
          value: healthData.weight[index].value.toString(),
          date: weightDate.toISOString().split("T")[0],
        }
        break
      case "sleep":
        const sleepDate = new Date(healthData.sleep[index].date)
        dataToEdit = {
          hours: healthData.sleep[index].hours.toString(),
          date: sleepDate.toISOString().split("T")[0],
          quality: healthData.sleep[index].quality || "good",
        }
        break
    }

    setEditData(dataToEdit)
    setEditDialogOpen(true)
  }

  // Handle edit form input changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    })
  }

  // Save edited reading
  const saveEditedReading = () => {
    if (editIndex === -1) return

    const updatedHealthData = { ...healthData }

    // Create date with time set to noon to avoid timezone issues
    const selectedDate = new Date(editData.date)
    selectedDate.setHours(12, 0, 0, 0)
    const dateString = selectedDate.toISOString()

    switch (editType) {
      case "blood-pressure":
        const systolicValue = Number.parseInt(editData.systolic)
        const diastolicValue = Number.parseInt(editData.diastolic)

        if (isNaN(systolicValue) || isNaN(diastolicValue)) {
          toast({
            title: "Invalid values",
            description: "Please enter valid numbers for blood pressure.",
            variant: "destructive",
          })
          return
        }

        updatedHealthData.bloodPressure[editIndex] = {
          ...updatedHealthData.bloodPressure[editIndex],
          systolic: systolicValue,
          diastolic: diastolicValue,
          date: dateString,
        }
        break

      case "heart-rate":
        const heartRateValue = Number.parseInt(editData.value)

        if (isNaN(heartRateValue)) {
          toast({
            title: "Invalid value",
            description: "Please enter a valid number for heart rate.",
            variant: "destructive",
          })
          return
        }

        updatedHealthData.heartRate[editIndex] = {
          ...updatedHealthData.heartRate[editIndex],
          value: heartRateValue,
          date: dateString,
        }
        break

      case "weight":
        const weightValue = Number.parseFloat(editData.value)

        if (isNaN(weightValue)) {
          toast({
            title: "Invalid value",
            description: "Please enter a valid number for weight.",
            variant: "destructive",
          })
          return
        }

        updatedHealthData.weight[editIndex] = {
          ...updatedHealthData.weight[editIndex],
          value: weightValue,
          date: dateString,
        }
        break

      case "sleep":
        const sleepValue = Number.parseFloat(editData.hours)

        if (isNaN(sleepValue)) {
          toast({
            title: "Invalid value",
            description: "Please enter a valid number for sleep hours.",
            variant: "destructive",
          })
          return
        }

        updatedHealthData.sleep[editIndex] = {
          ...updatedHealthData.sleep[editIndex],
          hours: sleepValue,
          date: dateString,
          quality: editData.quality,
        }
        break
    }

    updateHealthData(updatedHealthData)
      .then(() => {
        toast({
          title: "Reading updated",
          description: "Your health reading has been updated successfully.",
        })
        setEditDialogOpen(false)
      })
      .catch((error) => {
        console.error("Error updating reading:", error)
        toast({
          title: "Error",
          description: "Failed to update reading. Please try again.",
          variant: "destructive",
        })
      })
  }

  // Open delete confirmation dialog
  const confirmDelete = (type: string, index: number) => {
    setDeleteType(type)
    setDeleteIndex(index)
    setDeleteDialogOpen(true)
  }

  // Delete a reading
  const deleteReading = () => {
    if (deleteIndex === -1) return

    const updatedHealthData = { ...healthData }

    switch (deleteType) {
      case "blood-pressure":
        updatedHealthData.bloodPressure = updatedHealthData.bloodPressure.filter((_, i) => i !== deleteIndex)
        break
      case "heart-rate":
        updatedHealthData.heartRate = updatedHealthData.heartRate.filter((_, i) => i !== deleteIndex)
        break
      case "weight":
        updatedHealthData.weight = updatedHealthData.weight.filter((_, i) => i !== deleteIndex)
        break
      case "sleep":
        updatedHealthData.sleep = updatedHealthData.sleep.filter((_, i) => i !== deleteIndex)
        break
    }

    updateHealthData(updatedHealthData)
      .then(() => {
        toast({
          title: "Reading deleted",
          description: "Your health reading has been deleted successfully.",
        })
        setDeleteDialogOpen(false)
      })
      .catch((error) => {
        console.error("Error deleting reading:", error)
        toast({
          title: "Error",
          description: "Failed to delete reading. Please try again.",
        })
      })
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Health Data</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="blood-pressure">Blood Pressure</TabsTrigger>
          <TabsTrigger value="heart-rate">Heart Rate</TabsTrigger>
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
        </TabsList>

        <TabsContent value="blood-pressure">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Blood Pressure Reading</CardTitle>
                <CardDescription>Enter your systolic and diastolic blood pressure values.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBloodPressureSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bp-date">Date</Label>
                    <Input
                      id="bp-date"
                      type="date"
                      value={bpDate}
                      onChange={(e) => setBpDate(e.target.value)}
                      max={today}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="systolic">Systolic (mmHg)</Label>
                      <Input
                        id="systolic"
                        type="number"
                        placeholder="120"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
                      <Input
                        id="diastolic"
                        type="number"
                        placeholder="80"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Save Reading
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure History</CardTitle>
                <CardDescription>Your recent blood pressure readings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BloodPressureChart data={healthData.bloodPressure} />
                </div>

                <div className="mt-4 max-h-[200px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Systolic</TableHead>
                        <TableHead>Diastolic</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {healthData.bloodPressure.length > 0 ? (
                        [...healthData.bloodPressure]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((bp, index) => (
                            <TableRow key={bp.id || index}>
                              <TableCell>{format(new Date(bp.date), "MMM d, yyyy")}</TableCell>
                              <TableCell>{bp.systolic}</TableCell>
                              <TableCell>{bp.diastolic}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog("blood-pressure", index)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => confirmDelete("blood-pressure", index)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No readings yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="heart-rate">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Heart Rate Reading</CardTitle>
                <CardDescription>Enter your heart rate in beats per minute (BPM).</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleHeartRateSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hr-date">Date</Label>
                    <Input
                      id="hr-date"
                      type="date"
                      value={hrDate}
                      onChange={(e) => setHrDate(e.target.value)}
                      max={today}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heart-rate">Heart Rate (BPM)</Label>
                    <Input
                      id="heart-rate"
                      type="number"
                      placeholder="75"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Save Reading
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Heart Rate History</CardTitle>
                <CardDescription>Your recent heart rate readings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <HeartRateChart data={healthData.heartRate} />
                </div>

                <div className="mt-4 max-h-[200px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>BPM</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {healthData.heartRate.length > 0 ? (
                        [...healthData.heartRate]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((hr, index) => (
                            <TableRow key={hr.id || index}>
                              <TableCell>{format(new Date(hr.date), "MMM d, yyyy")}</TableCell>
                              <TableCell>{hr.value}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog("heart-rate", index)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => confirmDelete("heart-rate", index)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            No readings yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weight">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Weight Reading</CardTitle>
                <CardDescription>Enter your weight in kilograms (kg).</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWeightSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight-date">Date</Label>
                    <Input
                      id="weight-date"
                      type="date"
                      value={weightDate}
                      onChange={(e) => setWeightDate(e.target.value)}
                      max={today}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Save Reading
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weight History</CardTitle>
                <CardDescription>Your recent weight readings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <WeightChart data={healthData.weight} />
                </div>

                <div className="mt-4 max-h-[200px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Weight (kg)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {healthData.weight.length > 0 ? (
                        [...healthData.weight]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((w, index) => (
                            <TableRow key={w.id || index}>
                              <TableCell>{format(new Date(w.date), "MMM d, yyyy")}</TableCell>
                              <TableCell>{w.value}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => openEditDialog("weight", index)}>
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => confirmDelete("weight", index)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            No readings yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sleep">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Sleep Reading</CardTitle>
                <CardDescription>Enter your sleep duration in hours and quality.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSleepSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sleep-date">Date</Label>
                    <Input
                      id="sleep-date"
                      type="date"
                      value={sleepDate}
                      onChange={(e) => setSleepDate(e.target.value)}
                      max={today}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleep">Sleep (hours)</Label>
                    <Input
                      id="sleep"
                      type="number"
                      step="0.5"
                      placeholder="8"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleep-quality">Sleep Quality</Label>
                    <select
                      id="sleep-quality"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(e.target.value as "poor" | "fair" | "good" | "excellent")}
                    >
                      <option value="poor">Poor</option>
                      <option value="fair">Fair</option>
                      <option value="good">Good</option>
                      <option value="excellent">Excellent</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    Save Reading
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sleep History</CardTitle>
                <CardDescription>Your recent sleep durations.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <SleepChart data={healthData.sleep} />
                </div>

                <div className="mt-4 max-h-[200px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Quality</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {healthData.sleep.length > 0 ? (
                        [...healthData.sleep]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((s, index) => (
                            <TableRow key={s.id || index}>
                              <TableCell>{format(new Date(s.date), "MMM d, yyyy")}</TableCell>
                              <TableCell>{s.hours}</TableCell>
                              <TableCell className="capitalize">{s.quality || "good"}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => openEditDialog("sleep", index)}>
                                    Edit
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => confirmDelete("sleep", index)}>
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No readings yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Health Reading</DialogTitle>
            <DialogDescription>Make changes to your health reading below.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mb-4">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              name="date"
              type="date"
              value={editData.date || ""}
              onChange={handleEditChange}
              max={today}
            />
          </div>

          {editType === "blood-pressure" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-systolic">Systolic (mmHg)</Label>
                <Input
                  id="edit-systolic"
                  name="systolic"
                  type="number"
                  value={editData.systolic || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-diastolic">Diastolic (mmHg)</Label>
                <Input
                  id="edit-diastolic"
                  name="diastolic"
                  type="number"
                  value={editData.diastolic || ""}
                  onChange={handleEditChange}
                />
              </div>
            </div>
          )}

          {editType === "heart-rate" && (
            <div className="space-y-2">
              <Label htmlFor="edit-heart-rate">Heart Rate (BPM)</Label>
              <Input
                id="edit-heart-rate"
                name="value"
                type="number"
                value={editData.value || ""}
                onChange={handleEditChange}
              />
            </div>
          )}

          {editType === "weight" && (
            <div className="space-y-2">
              <Label htmlFor="edit-weight">Weight (kg)</Label>
              <Input
                id="edit-weight"
                name="value"
                type="number"
                step="0.1"
                value={editData.value || ""}
                onChange={handleEditChange}
              />
            </div>
          )}

          {editType === "sleep" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-sleep">Sleep (hours)</Label>
                <Input
                  id="edit-sleep"
                  name="hours"
                  type="number"
                  step="0.5"
                  value={editData.hours || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sleep-quality">Sleep Quality</Label>
                <select
                  id="edit-sleep-quality"
                  name="quality"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={editData.quality || "good"}
                  onChange={(e) => setEditData({ ...editData, quality: e.target.value })}
                >
                  <option value="poor">Poor</option>
                  <option value="fair">Fair</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditedReading}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this health reading.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteReading}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

