"use client"

import { LineChart } from "./line-chart"
import { chartColors, formatChartDate } from "@/lib/chart-utils"
import type { UserHealthData } from "@/lib/local-storage"

interface WeightChartProps {
  data: UserHealthData["weight"]
  height?: number
}

export function WeightChart({ data, height = 300 }: WeightChartProps) {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Extract labels (dates) and values
  const labels = sortedData.map((item) => formatChartDate(item.date))
  const values = sortedData.map((item) => item.value)

  const chartData = {
    labels,
    datasets: [
      {
        label: "Weight",
        data: values,
        borderColor: chartColors.blue.primary,
        backgroundColor: chartColors.blue.background,
        fill: true,
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
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
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

