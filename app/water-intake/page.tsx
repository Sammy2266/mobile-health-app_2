"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ProtectedRoute } from "@/components/protected-route"
import { Progress } from "@/components/ui/progress"
import { Droplet, Plus, Minus, RotateCcw } from "lucide-react"
import { BarChart } from "@/components/charts/bar-chart"
import { getLastNDaysFormatted } from "@/lib/chart-utils"

interface WaterIntakeEntry {
  date: string
  amount: number // in ml
}

export default function WaterIntakePage() {
  const { toast } = useToast()
  const [dailyGoal, setDailyGoal] = useState(2000) // Default 2000ml (2L)
  const [currentIntake, setCurrentIntake] = useState(0)
  const [customAmount, setCustomAmount] = useState(250) // Default 250ml
  const [waterHistory, setWaterHistory] = useState<WaterIntakeEntry[]>([])
  const [today] = useState(new Date().toISOString().split("T")[0])

  // Load saved data on component mount
  useEffect(() => {
    const savedGoal = localStorage.getItem("waterIntakeGoal")
    const savedHistory = localStorage.getItem("waterIntakeHistory")

    if (savedGoal) {
      setDailyGoal(Number.parseInt(savedGoal))
    }

    if (savedHistory) {
      const history = JSON.parse(savedHistory) as WaterIntakeEntry[]
      setWaterHistory(history)

      // Set current intake from today's entry if it exists
      const todayEntry = history.find((entry) => entry.date === today)
      if (todayEntry) {
        setCurrentIntake(todayEntry.amount)
      } else {
        setCurrentIntake(0)
      }
    }
  }, [today])

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem("waterIntakeGoal", dailyGoal.toString())
    localStorage.setItem("waterIntakeHistory", JSON.stringify(waterHistory))
  }, [dailyGoal, waterHistory])

  const addWater = (amount: number) => {
    const newIntake = currentIntake + amount
    setCurrentIntake(newIntake)

    // Update history
    const existingEntryIndex = waterHistory.findIndex((entry) => entry.date === today)

    if (existingEntryIndex >= 0) {
      const updatedHistory = [...waterHistory]
      updatedHistory[existingEntryIndex] = {
        ...updatedHistory[existingEntryIndex],
        amount: newIntake,
      }
      setWaterHistory(updatedHistory)
    } else {
      setWaterHistory([...waterHistory, { date: today, amount: newIntake }])
    }

    toast({
      title: "Water intake updated",
      description: `Added ${amount}ml. Total today: ${newIntake}ml`,
    })
  }

  const resetToday = () => {
    setCurrentIntake(0)

    // Update history
    const updatedHistory = waterHistory.filter((entry) => entry.date !== today)
    setWaterHistory(updatedHistory)

    toast({
      title: "Reset complete",
      description: "Today's water intake has been reset to 0ml",
    })
  }

  const updateGoal = (e: React.FormEvent) => {
    e.preventDefault()

    toast({
      title: "Goal updated",
      description: `Your daily water intake goal is now ${dailyGoal}ml`,
    })
  }

  // Calculate percentage of goal achieved
  const goalPercentage = Math.min(Math.round((currentIntake / dailyGoal) * 100), 100)

  // Prepare chart data
  const prepareChartData = () => {
    const labels = getLastNDaysFormatted(7)
    const data = new Array(7).fill(0)

    // Get date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    // Fill in data from history
    waterHistory.forEach((entry) => {
      const entryDate = new Date(entry.date)
      if (entryDate >= sevenDaysAgo) {
        const dayDiff = Math.floor((entryDate.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24))
        if (dayDiff >= 0 && dayDiff < 7) {
          data[dayDiff] = entry.amount
        }
      }
    })

    return {
      labels,
      datasets: [
        {
          label: "Water Intake (ml)",
          data,
          backgroundColor: data.map(
            (amount) =>
              amount >= dailyGoal
                ? "rgba(34, 197, 94, 0.6)" // Green if goal met
                : "rgba(59, 130, 246, 0.6)", // Blue otherwise
          ),
          borderColor: data.map((amount) => (amount >= dailyGoal ? "rgb(34, 197, 94)" : "rgb(59, 130, 246)")),
          borderWidth: 1,
        },
      ],
    }
  }

  const chartData = prepareChartData()

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
                <h1 className="text-3xl font-bold tracking-tight">Water Intake Tracker</h1>
                <p className="text-muted-foreground">Track your daily water consumption to stay hydrated</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Progress</CardTitle>
                    <CardDescription>
                      {today} - Goal: {dailyGoal}ml
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-center">
                      <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-muted stroke-current"
                            strokeWidth="10"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                          ></circle>
                          <circle
                            className="text-blue-500 stroke-current"
                            strokeWidth="10"
                            strokeLinecap="round"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - goalPercentage / 100)}`}
                            transform="rotate(-90 50 50)"
                          ></circle>
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <Droplet className="h-8 w-8 text-blue-500 mb-1" />
                          <span className="text-2xl font-bold">{currentIntake}ml</span>
                          <span className="text-sm text-muted-foreground">{goalPercentage}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>0ml</span>
                        <span>{dailyGoal}ml</span>
                      </div>
                      <Progress value={goalPercentage} className="h-2" />
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => addWater(50)}>
                        <Droplet className="h-4 w-4" />
                        <span>50ml</span>
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => addWater(100)}>
                        <Droplet className="h-4 w-4" />
                        <span>100ml</span>
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => addWater(250)}>
                        <Droplet className="h-4 w-4" />
                        <span>250ml</span>
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => addWater(500)}>
                        <Droplet className="h-4 w-4" />
                        <span>500ml</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Label htmlFor="custom-amount">Custom Amount (ml)</Label>
                        <div className="flex mt-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCustomAmount(Math.max(0, customAmount - 50))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            id="custom-amount"
                            type="number"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(Number.parseInt(e.target.value) || 0)}
                            className="mx-2 text-center"
                          />
                          <Button variant="outline" size="icon" onClick={() => setCustomAmount(customAmount + 50)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button className="mt-6" onClick={() => addWater(customAmount)}>
                        Add
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" className="flex items-center gap-2" onClick={resetToday}>
                      <RotateCcw className="h-4 w-4" />
                      Reset Today
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Set Daily Goal</CardTitle>
                    <CardDescription>Customize your daily water intake target</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={updateGoal} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="daily-goal">Daily Water Goal (ml)</Label>
                        <div className="flex">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setDailyGoal(Math.max(500, dailyGoal - 100))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            id="daily-goal"
                            type="number"
                            value={dailyGoal}
                            onChange={(e) => setDailyGoal(Number.parseInt(e.target.value) || 0)}
                            className="mx-2 text-center"
                            min="500"
                            step="100"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setDailyGoal(dailyGoal + 100)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Recommended daily intake:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Adult women: ~2000ml (2L)</li>
                          <li>Adult men: ~2500ml (2.5L)</li>
                          <li>Adjust based on activity level and climate</li>
                        </ul>
                      </div>

                      <Button type="submit" className="w-full">
                        Save Goal
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Weekly History</CardTitle>
                    <CardDescription>Your water intake over the past 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <BarChart data={chartData} height={300} />
                    </div>
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

