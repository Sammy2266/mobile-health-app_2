"use client"

import { BarChart } from "./bar-chart"
import { chartColors, getLastNDaysFormatted } from "@/lib/chart-utils"
import type { UserMedication } from "@/lib/local-storage"

interface MedicationAdherenceChartProps {
  medications: UserMedication[]
  height?: number
  days?: number
}

export function MedicationAdherenceChart({ medications, height = 300, days = 7 }: MedicationAdherenceChartProps) {
  // Get last n days
  const dateLabels = getLastNDaysFormatted(days)

  // Count active medications per day
  const activeMedicationsPerDay = dateLabels.map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - index))

    return medications.filter((med) => {
      const startDate = new Date(med.startDate)
      const endDate = med.endDate ? new Date(med.endDate) : new Date(2099, 11, 31) // Far future date if no end date
      return startDate <= date && date <= endDate
    }).length
  })

  // Generate random adherence data (in a real app, this would come from actual tracking data)
  const adherenceData = activeMedicationsPerDay.map((count) => {
    if (count === 0) return 0
    // Random adherence between 70% and 100%
    return Math.floor(Math.random() * 30 + 70)
  })

  const chartData = {
    labels: dateLabels,
    datasets: [
      {
        label: "Medication Adherence (%)",
        data: adherenceData,
        backgroundColor: chartColors.green.background,
        borderColor: chartColors.green.primary,
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
            return [`Adherence: ${value}%`, `Active medications: ${medicationCount}`]
          },
        },
      },
    },
  }

  return <BarChart data={chartData} options={options} height={height} />
}

