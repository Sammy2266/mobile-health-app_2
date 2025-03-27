"use client"

import { PieChart } from "./pie-chart"
import { generateRandomColors } from "@/lib/chart-utils"
import type { UserAppointment } from "@/lib/local-storage"

interface AppointmentTypesChartProps {
  appointments: UserAppointment[]
  height?: number
}

export function AppointmentTypesChart({ appointments, height = 300 }: AppointmentTypesChartProps) {
  // Group appointments by title
  const appointmentsByTitle = appointments.reduce(
    (acc, appointment) => {
      const title = appointment.title
      if (!acc[title]) {
        acc[title] = 0
      }
      acc[title]++
      return acc
    },
    {} as Record<string, number>,
  )

  // Convert to chart data
  const labels = Object.keys(appointmentsByTitle)
  const data = Object.values(appointmentsByTitle)
  const backgroundColors = generateRandomColors(labels.length, 0.7)
  const borderColors = generateRandomColors(labels.length, 1)

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  }

  return <PieChart data={chartData} height={height} />
}

