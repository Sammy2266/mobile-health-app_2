"use client"

import { BarChart } from "./bar-chart"
import { getLastNDaysFormatted } from "@/lib/chart-utils"
import type { UserMedication } from "@/lib/local-storage"

interface MedicationAdherenceChartProps {
  medications: UserMedication[]
  height?: number
  days?: number
  startDate?: Date
  endDate?: Date
}

export function MedicationAdherenceChart({
  medications,
  height = 300,
  days = 7,
  startDate,
  endDate,
}: MedicationAdherenceChartProps) {
  // Get date range
  let dateLabels: string[] = []

  if (startDate && endDate) {
    // Calculate days between dates
    const dayDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const dates = []

    for (let i = 0; i <= dayDiff; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      dates.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }))
    }

    dateLabels = dates
  } else {
    // Use last N days
    dateLabels = getLastNDaysFormatted(days)
  }

  // Count active medications per day
  const activeMedicationsPerDay = dateLabels.map((_, index) => {
    let date

    if (startDate && endDate) {
      date = new Date(startDate)
      date.setDate(date.getDate() + index)
    } else {
      date = new Date()
      date.setDate(date.getDate() - (days - 1 - index))
    }

    return medications.filter((med) => {
      const startDate = new Date(med.startDate)
      const endDate = med.endDate ? new Date(med.endDate) : new Date(2099, 11, 31) // Far future date if no end date
      return startDate <= date && date <= endDate
    }).length
  })

  // Generate adherence data (in a real app, this would come from actual tracking data)
  const adherenceData = activeMedicationsPerDay.map((count) => {
    if (count === 0) return 0
    // Random adherence between 50% and 100%
    return Math.floor(Math.random() * 50 + 50)
  })

  // Determine colors based on adherence levels
  const backgroundColors = adherenceData.map((value) => {
    if (value < 60) return "rgba(239, 68, 68, 0.2)" // Red for < 60%
    if (value < 85) return "rgba(234, 179, 8, 0.2)" // Yellow for 60-85%
    return "rgba(34, 197, 94, 0.2)" // Green for > 85%
  })

  const borderColors = adherenceData.map((value) => {
    if (value < 60) return "rgb(239, 68, 68)" // Red for < 60%
    if (value < 85) return "rgb(234, 179, 8)" // Yellow for 60-85%
    return "rgb(34, 197, 94)" // Green for > 85%
  })

  const chartData = {
    labels: dateLabels,
    datasets: [
      {
        label: "Medication Adherence (%)",
        data: adherenceData,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  }

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Adherence (%)",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y
            const index = context.dataIndex
            const medicationCount = activeMedicationsPerDay[index]
            let adherenceStatus = ""

            if (value < 60) adherenceStatus = "Poor"
            else if (value < 85) adherenceStatus = "Moderate"
            else adherenceStatus = "Good"

            return [`Adherence: ${value}% (${adherenceStatus})`, `Active medications: ${medicationCount}`]
          },
        },
      },
    },
  }

  return <BarChart data={chartData} options={options} height={height} />
}

