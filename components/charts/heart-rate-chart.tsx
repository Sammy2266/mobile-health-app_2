"use client"

import { LineChart } from "./line-chart"
import { chartColors, formatChartDate } from "@/lib/chart-utils"
import type { UserHealthData } from "@/lib/local-storage"

interface HeartRateChartProps {
  data: UserHealthData["heartRate"]
  height?: number
}

export function HeartRateChart({ data, height = 300 }: HeartRateChartProps) {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Extract labels (dates) and values
  const labels = sortedData.map((item) => formatChartDate(item.date))
  const values = sortedData.map((item) => item.value)

  const chartData = {
    labels,
    datasets: [
      {
        label: "Heart Rate",
        data: values,
        borderColor: chartColors.red.primary,
        backgroundColor: chartColors.red.background,
        fill: true,
      },
    ],
  }

  const options = {
    scales: {
      y: {
        title: {
          display: true,
          text: "BPM",
        },
        suggestedMin: 40,
        suggestedMax: 120,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || ""
            const value = context.parsed.y
            return `${label}: ${value} BPM`
          },
        },
      },
    },
  }

  return <LineChart data={chartData} options={options} height={height} />
}

