"use client"

import { LineChart } from "./line-chart"
import { chartColors, formatChartDate } from "@/lib/chart-utils"
import type { UserHealthData } from "@/lib/local-storage"

interface BloodPressureChartProps {
  data: UserHealthData["bloodPressure"]
  height?: number
}

export function BloodPressureChart({ data, height = 300 }: BloodPressureChartProps) {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Extract labels (dates) and values
  const labels = sortedData.map((item) => formatChartDate(item.date))
  const systolicValues = sortedData.map((item) => item.systolic)
  const diastolicValues = sortedData.map((item) => item.diastolic)

  const chartData = {
    labels,
    datasets: [
      {
        label: "Systolic",
        data: systolicValues,
        borderColor: chartColors.red.primary,
        backgroundColor: chartColors.red.background,
        fill: false,
      },
      {
        label: "Diastolic",
        data: diastolicValues,
        borderColor: chartColors.blue.primary,
        backgroundColor: chartColors.blue.background,
        fill: false,
      },
    ],
  }

  const options = {
    scales: {
      y: {
        title: {
          display: true,
          text: "mmHg",
        },
        suggestedMin: 40,
        suggestedMax: 180,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems: any[]) => tooltipItems[0].label,
          label: (context: any) => {
            const label = context.dataset.label || ""
            const value = context.parsed.y
            return `${label}: ${value} mmHg`
          },
        },
      },
    },
  }

  return <LineChart data={chartData} options={options} height={height} />
}

