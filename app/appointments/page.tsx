"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/context/app-provider"
import { formatDateTime, getDaysUntil } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Check, Clock, MapPin, Plus, Trash, User } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ProtectedRoute } from "@/components/protected-route"
import { getHospitalsWithDoctors } from "@/lib/local-storage-service"

const appointmentFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  hospital: z.string().min(2, {
    message: "Hospital must be selected.",
  }),
  doctorName: z.string().min(2, {
    message: "Doctor name must be selected.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in 24-hour format (HH:MM).",
  }),
  notes: z.string().optional(),
})

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>

export default function AppointmentsPage() {
  const { appointments, updateAppointments, initialized } = useApp()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [hospitals, setHospitals] = useState<any[]>([])
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null)
  const [availableDoctors, setAvailableDoctors] = useState<string[]>([])

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: "",
      hospital: "",
      doctorName: "",
      notes: "",
      time: "09:00",
    },
  })

  useEffect(() => {
    // Get hospitals with doctors
    const hospitalsData = getHospitalsWithDoctors()
    setHospitals(hospitalsData)
  }, [])

  useEffect(() => {
    // Update available doctors when hospital changes
    if (selectedHospital) {
      const hospital = hospitals.find((h) => `${h.name}, ${h.location}` === selectedHospital)
      if (hospital) {
        setAvailableDoctors(hospital.doctors)
        form.setValue("doctorName", "") // Reset doctor selection
      }
    } else {
      setAvailableDoctors([])
    }
  }, [selectedHospital, hospitals, form])

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const onSubmit = (data: AppointmentFormValues) => {
    const appointmentDate = new Date(data.date)
    const [hours, minutes] = data.time.split(":").map(Number)
    appointmentDate.setHours(hours, minutes, 0, 0)

    const newAppointment = {
      id: crypto.randomUUID(),
      title: data.title,
      doctorName: data.doctorName,
      location: data.hospital,
      date: appointmentDate.toISOString(),
      notes: data.notes,
      completed: false,
    }
    const updatedAppointments = [...appointments, newAppointment]
    updateAppointments(updatedAppointments)

    toast({
      title: "Appointment Scheduled",
      description: "Your appointment has been scheduled successfully.",
    })

    form.reset()
    setIsDialogOpen(false)
  }

  const handleMarkAsCompleted = (id: string) => {
    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === id ? { ...appointment, completed: true } : appointment,
    )
    updateAppointments(updatedAppointments)

    toast({
      title: "Appointment Completed",
      description: "Your appointment has been marked as completed.",
    })
  }

  const handleDelete = (id: string) => {
    const updatedAppointments = appointments.filter((appointment) => appointment.id !== id)
    updateAppointments(updatedAppointments)

    toast({
      title: "Appointment Deleted",
      description: "Your appointment has been deleted successfully.",
    })
  }

  const handleGetDirections = (location: string) => {
    // Encode the location for use in a URL
    const encodedLocation = encodeURIComponent(location)

    // Open Google Maps in a new tab with the location
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, "_blank")
  }

  const upcomingAppointments = appointments
    .filter((appointment) => !appointment.completed && new Date(appointment.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const pastAppointments = appointments
    .filter((appointment) => appointment.completed || new Date(appointment.date) <= new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <aside className="hidden w-64 border-r bg-[#1a2e22] md:block">
            <Sidebar />
          </aside>
          <main className="flex-1 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:gap-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                  <p className="text-muted-foreground">Manage your upcoming and past appointments</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Schedule Appointment</DialogTitle>
                      <DialogDescription>Enter the details for your new appointment.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Appointment Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Annual checkup" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="hospital"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hospital</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value)
                                  setSelectedHospital(value)
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a hospital" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {hospitals.map((hospital) => (
                                    <SelectItem
                                      key={`${hospital.name}, ${hospital.location}`}
                                      value={`${hospital.name}, ${hospital.location}`}
                                    >
                                      {hospital.name}, {hospital.location}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="doctorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Doctor</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={selectedHospital ? "Select a doctor" : "Select a hospital first"}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableDoctors.map((doctor) => (
                                    <SelectItem key={doctor} value={doctor}>
                                      {doctor}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className="rounded-md border"
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="space-y-6">
                            <FormField
                              control={form.control}
                              name="time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormDescription>24-hour format (HH:MM)</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Any special instructions or notes" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Schedule Appointment</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg"
                          >
                            <div className="w-12 h-12 rounded-full bg-health-green-100 dark:bg-health-green-900 flex items-center justify-center text-health-green-500 shrink-0">
                              <CalendarIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="font-medium">{appointment.title}</p>
                              <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <User className="mr-1 h-4 w-4" />
                                  {appointment.doctorName}
                                </div>
                                <div className="hidden md:block">•</div>
                                <div className="flex items-center">
                                  <MapPin className="mr-1 h-4 w-4" />
                                  {appointment.location}
                                </div>
                                <div className="hidden md:block">•</div>
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-4 w-4" />
                                  {formatDateTime(new Date(appointment.date))}
                                </div>
                              </div>
                              {appointment.notes && <p className="text-sm mt-2">{appointment.notes}</p>}
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                              <div className="bg-health-green-100 dark:bg-health-green-900 text-health-green-700 dark:text-health-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {getDaysUntil(appointment.date)} days
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGetDirections(appointment.location)}
                                className="flex items-center gap-1"
                              >
                                <MapPin className="h-4 w-4" />
                                Directions
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleMarkAsCompleted(appointment.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDelete(appointment.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No upcoming appointments</div>
                    )}
                  </CardContent>
                  {upcomingAppointments.length > 0 && (
                    <CardFooter>
                      <p className="text-sm text-muted-foreground">
                        You have {upcomingAppointments.length} upcoming appointment
                        {upcomingAppointments.length !== 1 ? "s" : ""}
                      </p>
                    </CardFooter>
                  )}
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Past Appointments</CardTitle>
                    <CardDescription>Your completed appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pastAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {pastAppointments.slice(0, 5).map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg bg-muted/40"
                          >
                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 shrink-0">
                              <CalendarIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="font-medium">{appointment.title}</p>
                              <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <User className="mr-1 h-4 w-4" />
                                  {appointment.doctorName}
                                </div>
                                <div className="hidden md:block">•</div>
                                <div className="flex items-center">
                                  <MapPin className="mr-1 h-4 w-4" />
                                  {appointment.location}
                                </div>
                                <div className="hidden md:block">•</div>
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-4 w-4" />
                                  {formatDateTime(new Date(appointment.date))}
                                </div>
                              </div>
                              {appointment.notes && <p className="text-sm mt-2">{appointment.notes}</p>}
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                              <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {appointment.completed ? "Completed" : "Missed"}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGetDirections(appointment.location)}
                                className="flex items-center gap-1"
                              >
                                <MapPin className="h-4 w-4" />
                                Directions
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDelete(appointment.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No past appointments</div>
                    )}
                  </CardContent>
                  {pastAppointments.length > 0 && (
                    <CardFooter>
                      <p className="text-sm text-muted-foreground">
                        You have {pastAppointments.length} past appointment{pastAppointments.length !== 1 ? "s" : ""}
                      </p>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

