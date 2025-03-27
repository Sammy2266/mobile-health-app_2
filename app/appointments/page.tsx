"use client"

import { useState } from "react"
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

const appointmentFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  doctorName: z.string().min(2, {
    message: "Doctor name must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
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

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: "",
      doctorName: "",
      location: "",
      notes: "",
      time: "09:00",
    },
  })

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
      location: data.location,
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

  // Kenyan hospitals for the dropdown
  const kenyanHospitals = [
    "Kenyatta National Hospital, Hospital Road, Nairobi",
    "Nairobi Hospital, Argwings Kodhek Road, Nairobi",
    "Aga Khan University Hospital, 3rd Parklands Avenue, Nairobi",
    "Moi Teaching and Referral Hospital, Nandi Road, Eldoret",
    "Coast General Hospital, Moi Avenue, Mombasa",
    "Gertrude's Children's Hospital, Muthaiga Road, Nairobi",
    "MP Shah Hospital, Shivachi Road, Nairobi",
    "Karen Hospital, Karen Road, Nairobi",
  ]

  // Kenyan doctor names for the dropdown
  const kenyanDoctors = [
    "Dr. Wanjiku Kamau",
    "Dr. Omondi Ochieng",
    "Dr. Njeri Mwangi",
    "Dr. Kipchoge Kipruto",
    "Dr. Akinyi Otieno",
    "Dr. Muthoni Kariuki",
    "Dr. Otieno Odinga",
    "Dr. Wambui Gathoni",
  ]

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
                  <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Schedule Appointment</DialogTitle>
                      <DialogDescription>Enter the details for your new appointment.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Annual checkup" {...field} />
                              </FormControl>
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
                                    <SelectValue placeholder="Select a doctor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {kenyanDoctors.map((doctor) => (
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
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a hospital" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {kenyanHospitals.map((hospital) => (
                                    <SelectItem key={hospital} value={hospital}>
                                      {hospital}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
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
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                        </div>
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

