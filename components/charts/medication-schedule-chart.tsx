"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import type { UserMedication } from "@/lib/local-storage"

interface MedicationScheduleChartProps {
  medications: UserMedication[]
  height?: number
}

export function MedicationScheduleChart({ medications, height = 300 }: MedicationScheduleChartProps) {
  // Count medications by frequency
  const frequencyCounts: Record<string, number> = {}

  medications.forEach((med) => {
    const frequency = med.frequency || "Not specified"
    frequencyCounts[frequency] = (frequencyCounts[frequency] || 0) + 1
  })

  // Convert to chart data format
  const chartData = Object.entries(frequencyCounts).map(([frequency, count]) => ({
    frequency,
    count,
  }))

  // Sort data by frequency for better visualization
  const frequencyOrder: Record<string, number> = {
    Daily: 1,
    "Twice daily": 2,
    "Three times daily": 3,
    "Four times daily": 4,
    Weekly: 5,
    Biweekly: 6,
    Monthly: 7,
    "As needed": 8,
    "Not specified": 9,
  }

  chartData.sort((a, b) => {
    const orderA = frequencyOrder[a.frequency] || 10
    const orderB = frequencyOrder[b.frequency] || 10
    return orderA - orderB
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData}>
              <XAxis dataKey="frequency" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" />
              <YAxis
                allowDecimals={false}
                label={{ value: "Number of Medications", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                formatter={(value) => [`${value} medications`, "Count"]}
                labelFormatter={(label) => `Frequency: ${label}`}
              />
              <Legend />
              <Bar dataKey="count" name="Medications" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No medication data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}

