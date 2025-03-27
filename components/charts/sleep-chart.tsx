"use client"

import { BarChart } from "./bar-chart"
import { formatChartDate, getColorForSleepQuality, getBackgroundForSleepQuality } from "@/lib/chart-utils"
import type { UserHealthData } from "@/lib/local-storage"

interface SleepChartProps {
  data: UserHealthData["sleep"]
  height?: number
}

export function SleepChart({ data, height = 300 }: SleepChartProps) {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Extract labels (dates) and values
  const labels = sortedData.map((item) => formatChartDate(item.date))
  const values = sortedData.map((item) => item.hours)
  const qualities = sortedData.map((item) => item.quality)

  // Generate colors based on sleep quality
  const borderColors = qualities.map((quality) => getColorForSleepQuality(quality))
  const backgroundColors = qualities.map((quality) => getBackgroundForSleepQuality(quality))

  const chartData = {
    labels,
    datasets: [
      {
        label: "Sleep Duration",
        data: values,
        borderColor: borderColors,
        backgroundColor: backgroundColors,
        borderWidth: 1,
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
          label: (context: any) => {
            const index = context.dataIndex
            const quality = qualities[index]
            const hours = context.parsed.y
            return [`Duration: ${hours} hours`, `Quality: ${quality.charAt(0).toUpperCase() + quality.slice(1)}`]
          },
        },
      },
    },
  }

  return <BarChart data={chartData} options={options} height={height} />
}

