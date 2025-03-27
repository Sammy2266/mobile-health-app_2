"use client"

import { DoughnutChart } from "./doughnut-chart"
import { generateRandomColors } from "@/lib/chart-utils"
import type { UserAppointment } from "@/lib/local-storage"

interface AppointmentLocationsChartProps {
  appointments: UserAppointment[]
  height?: number
}

export function AppointmentLocationsChart({ appointments, height = 300 }: AppointmentLocationsChartProps) {
  // Extract hospital names from locations
  const getHospitalName = (location: string) => {
    const parts = location.split(",")
    return parts[0].trim()
  }

  // Group appointments by hospital
  const appointmentsByHospital = appointments.reduce(
    (acc, appointment) => {
      const hospital = getHospitalName(appointment.location)
      if (!acc[hospital]) {
        acc[hospital] = 0
      }
      acc[hospital]++
      return acc
    },
    {} as Record<string, number>,
  )

  // Convert to chart data
  const labels = Object.keys(appointmentsByHospital)
  const data = Object.values(appointmentsByHospital)
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

  return <DoughnutChart data={chartData} height={height} />
}

