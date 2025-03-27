"use client"

import { LineChart } from "./line-chart"
import { chartColors, formatChartDate } from "@/lib/chart-utils"
import type { UserHealthData } from "@/lib/local-storage"

interface HealthSummaryChartProps {
  healthData: UserHealthData
  height?: number
}

export function HealthSummaryChart({ healthData, height = 300 }: HealthSummaryChartProps) {
  // Sort all data by date
  const sortedBloodPressure = [...healthData.bloodPressure].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const sortedHeartRate = [...healthData.heartRate].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const sortedWeight = [...healthData.weight].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Get all unique dates
  const allDates = [
    ...sortedBloodPressure.map((item) => item.date),
    ...sortedHeartRate.map((item) => item.date),
    ...sortedWeight.map((item) => item.date),
  ]

  const uniqueDates = [...new Set(allDates)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  // Format dates for labels
  const labels = uniqueDates.map((date) => formatChartDate(date))

  // Normalize data for each date
  const systolicData = uniqueDates.map((date) => {
    const item = sortedBloodPressure.find((bp) => bp.date === date)
    return item ? (item.systolic - 100) / 50 : null // Normalize to 0-1 range (assuming 100-150 range)
  })

  const heartRateData = uniqueDates.map((date) => {
    const item = sortedHeartRate.find((hr) => hr.date === date)
    return item ? (item.value - 60) / 60 : null // Normalize to 0-1 range (assuming 60-120 range)
  })

  const weightData = uniqueDates.map((date) => {
    const item = sortedWeight.find((w) => w.date === date)
    if (!item) return null

    // Find min and max weight for normalization
    const minWeight = Math.min(...sortedWeight.map((w) => w.value))
    const maxWeight = Math.max(...sortedWeight.map((w) => w.value))
    const range = maxWeight - minWeight

    return range > 0 ? (item.value - minWeight) / range : 0.5
  })

  const chartData = {
    labels,
    datasets: [
      {
        label: "Blood Pressure (Systolic)",
        data: systolicData,
        borderColor: chartColors.red.primary,
        backgroundColor: "transparent",
        fill: false,
        yAxisID: "y",
      },
      {
        label: "Heart Rate",
        data: heartRateData,
        borderColor: chartColors.blue.primary,
        backgroundColor: "transparent",
        fill: false,
        yAxisID: "y",
      },
      {
        label: "Weight",
        data: weightData,
        borderColor: chartColors.green.primary,
        backgroundColor: "transparent",
        fill: false,
        yAxisID: "y",
      },
    ],
  }

  const options = {
    scales: {
      y: {
        title: {
          display: true,
          text: "Normalized Value",
        },
        min: 0,
        max: 1,
        ticks: {
          callback: (value: number) => value.toFixed(1),
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || ""
            const index = context.dataIndex
            const date = uniqueDates[index]

            if (label.includes("Blood Pressure")) {
              const item = sortedBloodPressure.find((bp) => bp.date === date)
              return item ? `${label}: ${item.systolic}/${item.diastolic} mmHg` : `${label}: No data`
            } else if (label.includes("Heart Rate")) {
              const item = sortedHeartRate.find((hr) => hr.date === date)
              return item ? `${label}: ${item.value} BPM` : `${label}: No data`
            } else if (label.includes("Weight")) {
              const item = sortedWeight.find((w) => w.date === date)
              return item ? `${label}: ${item.value} kg` : `${label}: No data`
            }

            return `${label}: ${context.parsed.y}`
          },
        },
      },
    },
  }

  return <LineChart data={chartData} options={options} height={height} />
}

