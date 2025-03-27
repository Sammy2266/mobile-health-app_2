"use client"

import { useApp } from "@/context/app-provider"
import { formatDateTime, getNextAppointment } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export function NextAppointment() {
  const { appointments } = useApp()
  const nextAppointment = getNextAppointment(appointments)

  if (!nextAppointment) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
          <Calendar className="h-4 w-4 text-health-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-sm">No upcoming appointments</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
        <Calendar className="h-4 w-4 text-health-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{nextAppointment.daysUntil} days</div>
        <p className="text-xs text-muted-foreground">{formatDateTime(new Date(nextAppointment.date))}</p>
      </CardContent>
    </Card>
  )
}

