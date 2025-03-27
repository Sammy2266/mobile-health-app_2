"use client"

import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions, type ChartData } from "chart.js"
import { Pie } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

interface PieChartProps {
  data: ChartData<"pie">
  options?: ChartOptions<"pie">
  height?: number
}

export function PieChart({ data, options, height = 300 }: PieChartProps) {
  const defaultOptions: ChartOptions<"pie"> = {
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
  }

  return (
    <div style={{ height: `${height}px` }}>
      <Pie data={data} options={options || defaultOptions} />
    </div>
  )
}

