"use client"

import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions, type ChartData } from "chart.js"
import { Doughnut } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

interface DoughnutChartProps {
  data: ChartData<"doughnut">
  options?: ChartOptions<"doughnut">
  height?: number
}

export function DoughnutChart({ data, options, height = 300 }: DoughnutChartProps) {
  const defaultOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.formattedValue
            const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0)
            const percentage = Math.round((context.parsed / total) * 100)
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
    },
    cutout: "70%",
  }

  return (
    <div style={{ height: `${height}px` }}>
      <Doughnut data={data} options={options || defaultOptions} />
    </div>
  )
}

