"use client"

import { BarChart } from "./bar-chart"
import { chartColors, formatChartDate } from "@/lib/chart-utils"
import type { UserHealthData } from "@/lib/local-storage"

interface SleepChartProps {
  data: UserHealthData["sleep"]
  height?: number
}

export function SleepChart({ data = [], height = 300 }: SleepChartProps) {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : []

  // Sort data by date
  const sortedData = [...safeData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Extract labels (dates) and values
  const labels = sortedData.map((item) => formatChartDate(item.date))
  const hours = sortedData.map((item) => item.hours)

  // Map quality to colors
  const qualityColors = sortedData.map((item) => {
    switch (item.quality) {
      case "poor":
        return chartColors.red.primary
      case "fair":
        return chartColors.orange.primary
      case "good":
        return chartColors.blue.primary
      case "excellent":
        return chartColors.green.primary
      default:
        return chartColors.gray.primary
    }
  })

  const chartData = {
    labels,
    datasets: [
      {
        label: "Sleep Duration",
        data: hours,
        backgroundColor: qualityColors,
      },
    ],
  }

  const options = {
    scales: {
      y: {
        title: {
          display: true,
          text: "Hours",
        },
        suggestedMin: 0,
        suggestedMax: 12,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems: any[]) => tooltipItems[0].label,
          label: (context: any) => {
            const index = context.dataIndex
            const quality = sortedData[index].quality
            const hours = context.parsed.y
            return [`Duration: ${hours} hours`, `Quality: ${quality.charAt(0).toUpperCase() + quality.slice(1)}`]
          },
        },
      },
    },
  }

  return <BarChart data={chartData} options={options} height={height} />
}

