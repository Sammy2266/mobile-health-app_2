"use client"

import { PieChart } from "./pie-chart"
import { chartColors } from "@/lib/chart-utils"

interface MoodSummaryChartProps {
  moodData: Array<{
    date: string
    mood: string
  }>
  height?: number
}

export function MoodSummaryChart({ moodData, height = 300 }: MoodSummaryChartProps) {
  // Count occurrences of each mood
  const moodCounts: Record<string, number> = {}

  moodData.forEach((entry) => {
    if (!moodCounts[entry.mood]) {
      moodCounts[entry.mood] = 0
    }
    moodCounts[entry.mood]++
  })

  // Prepare data for chart
  const labels = Object.keys(moodCounts)
  const data = Object.values(moodCounts)

  // Define colors for different moods
  const moodColors = {
    Happy: chartColors.green.primary,
    Neutral: chartColors.blue.primary,
    Sad: chartColors.purple.primary,
    Angry: chartColors.red.primary,
    Tired: chartColors.orange.primary,
    Sick: chartColors.gray.primary,
  }

  // Get colors based on mood labels
  const backgroundColor = labels.map((mood) => {
    return moodColors[mood as keyof typeof moodColors] || chartColors.gray.primary
  })

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor: backgroundColor,
        borderWidth: 1,
      },
    ],
  }

  const options = {
    plugins: {
      legend: {
        position: "right" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || ""
            const value = context.raw
            const total = data.reduce((a, b) => a + b, 0)
            const percentage = Math.round((value / total) * 100)
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
    },
  }

  return <PieChart data={chartData} options={options} height={height} />
}

