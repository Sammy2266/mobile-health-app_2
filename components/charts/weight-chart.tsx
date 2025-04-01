"use client"

import { LineChart } from "./line-chart"
import { chartColors, formatChartDate } from "@/lib/chart-utils"
import type { UserHealthData } from "@/lib/local-storage"

interface WeightChartProps {
  data: UserHealthData["weight"]
  height?: number
}

export function WeightChart({ data = [], height = 300 }: WeightChartProps) {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : []

  // Sort data by date
  const sortedData = [...safeData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Extract labels (dates) and values
  const labels = sortedData.map((item) => formatChartDate(item.date))
  const values = sortedData.map((item) => item.value)

  // Set default min/max values for empty arrays
  const minValue = values.length > 0 ? Math.min(...values) : 50
  const maxValue = values.length > 0 ? Math.max(...values) : 100

  const chartData = {
    labels,
    datasets: [
      {
        label: "Weight",
        data: values,
        borderColor: chartColors.green.primary,
        backgroundColor: chartColors.green.background,
        fill: false,
      },
    ],
  }

  const options = {
    scales: {
      y: {
        title: {
          display: true,
          text: "kg",
        },
        suggestedMin: Math.max(0, minValue - 5),
        suggestedMax: maxValue + 5,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems: any[]) => tooltipItems[0].label,
          label: (context: any) => {
            const label = context.dataset.label || ""
            const value = context.parsed.y
            return `${label}: ${value} kg`
          },
        },
      },
    },
  }

  return <LineChart data={chartData} options={options} height={height} />
}

