"use client"

import { LineChart } from "./line-chart"
import { chartColors } from "@/lib/chart-utils"
import type { UserHealthData } from "@/lib/local-storage"

interface HealthSummaryChartProps {
  healthData: UserHealthData
  height?: number
  timeRange?: "week" | "month" | "quarter" | "year"
}

export function HealthSummaryChart({ healthData, height = 300, timeRange = "week" }: HealthSummaryChartProps) {
  // Ensure healthData and its properties are arrays
  const bloodPressureArray = Array.isArray(healthData?.bloodPressure) ? healthData.bloodPressure : []
  const heartRateArray = Array.isArray(healthData?.heartRate) ? healthData.heartRate : []
  const weightArray = Array.isArray(healthData?.weight) ? healthData.weight : []

  // Get the current date and calculate the start date based on timeRange
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

  // Filter data by date range
  const filterByDateRange = (item: any) => {
    const itemDate = new Date(item.date)
    return itemDate >= startDate && itemDate <= endDate
  }

  // Filter and sort data
  const filteredBloodPressure = bloodPressureArray.filter(filterByDateRange)
  const filteredHeartRate = heartRateArray.filter(filterByDateRange)
  const filteredWeight = weightArray.filter(filterByDateRange)

  // Sort all data by date
  const sortedBloodPressure = [...filteredBloodPressure].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const sortedHeartRate = [...filteredHeartRate].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const sortedWeight = [...filteredWeight].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Get all unique dates - use date string without time component to avoid duplicates
  const allDatesMap = new Map()

  // Process all dates and keep only unique ones by date (ignoring time)
  ;[...sortedBloodPressure, ...sortedHeartRate, ...sortedWeight].forEach((item) => {
    const dateObj = new Date(item.date)
    const dateString = dateObj.toISOString().split("T")[0] // YYYY-MM-DD format
    if (!allDatesMap.has(dateString)) {
      allDatesMap.set(dateString, item.date) // Store the original date string
    }
  })

  // Convert map to array and sort chronologically
  const uniqueDates = Array.from(allDatesMap.values()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  // Format dates for labels - use a more compact format to avoid overlapping
  const labels = uniqueDates.map((date) => {
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  })

  // Helper function to find data for a specific date
  const findDataForDate = (dataArray, date) => {
    const dateObj = new Date(date)
    const dateString = dateObj.toISOString().split("T")[0]

    return dataArray.find((item) => {
      const itemDateObj = new Date(item.date)
      const itemDateString = itemDateObj.toISOString().split("T")[0]
      return itemDateString === dateString
    })
  }

  // Normalize data for each date
  const systolicData = uniqueDates.map((date) => {
    const item = findDataForDate(sortedBloodPressure, date)
    return item ? (item.systolic - 100) / 50 : null // Normalize to 0-1 range (assuming 100-150 range)
  })

  const heartRateData = uniqueDates.map((date) => {
    const item = findDataForDate(sortedHeartRate, date)
    return item ? (item.value - 60) / 60 : null // Normalize to 0-1 range (assuming 60-120 range)
  })

  const weightData = uniqueDates.map((date) => {
    const item = findDataForDate(sortedWeight, date)
    if (!item) return null

    // Find min and max weight for normalization
    const minWeight = sortedWeight.length > 0 ? Math.min(...sortedWeight.map((w) => w.value)) : 0
    const maxWeight = sortedWeight.length > 0 ? Math.max(...sortedWeight.map((w) => w.value)) : 100
    const range = maxWeight - minWeight

    return range > 0 ? (item.value - minWeight) / range : 0.5
  })

  // If there's no data, show a message
  if (uniqueDates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground">
        No health data available for the selected time range
      </div>
    )
  }

  // Filter out datasets with no data
  const datasets = []

  if (systolicData.some((value) => value !== null)) {
    datasets.push({
      label: "Blood Pressure (Systolic)",
      data: systolicData,
      borderColor: chartColors.red.primary,
      backgroundColor: "transparent",
      fill: false,
      yAxisID: "y",
      tension: 0.4, // Add some curve to the lines
      pointRadius: 3,
    })
  }

  if (heartRateData.some((value) => value !== null)) {
    datasets.push({
      label: "Heart Rate",
      data: heartRateData,
      borderColor: chartColors.blue.primary,
      backgroundColor: "transparent",
      fill: false,
      yAxisID: "y",
      tension: 0.4,
      pointRadius: 3,
    })
  }

  if (weightData.some((value) => value !== null)) {
    datasets.push({
      label: "Weight",
      data: weightData,
      borderColor: chartColors.green.primary,
      backgroundColor: "transparent",
      fill: false,
      yAxisID: "y",
      tension: 0.4,
      pointRadius: 3,
    })
  }

  const chartData = {
    labels,
    datasets,
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
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
              const item = findDataForDate(sortedBloodPressure, date)
              return item ? `${label}: ${item.systolic}/${item.diastolic} mmHg` : `${label}: No data`
            } else if (label.includes("Heart Rate")) {
              const item = findDataForDate(sortedHeartRate, date)
              return item ? `${label}: ${item.value} BPM` : `${label}: No data`
            } else if (label.includes("Weight")) {
              const item = findDataForDate(sortedWeight, date)
              return item ? `${label}: ${item.value} kg` : `${label}: No data`
            }

            return `${label}: ${context.parsed.y}`
          },
        },
      },
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
    },
  }

  return <LineChart data={chartData} options={options} height={height} />
}

