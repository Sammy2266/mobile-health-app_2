"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/context/app-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { BellOff, BellRing, Clock, Plus, Pill, Trash } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ProtectedRoute } from "@/components/protected-route"

const medicationFormSchema = z.object({
  name: z.string().min(2, {
    message: "Medication name must be at least 2 characters.",
  }),
  dosage: z.string().min(1, {
    message: "Dosage is required.",
  }),
  frequency: z.string().min(1, {
    message: "Frequency is required.",
  }),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date().optional(),
  instructions: z.string().optional(),
  reminderEnabled: z.boolean().default(false),
  reminderTimes: z.array(z.string()).default([]),
})

type MedicationFormValues = z.infer<typeof medicationFormSchema>

export default function MedicationsPage() {
  const { medications, updateMedications, initialized } = useApp()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reminderTimes, setReminderTimes] = useState<string[]>(["08:00"])

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "",
      instructions: "",
      reminderEnabled: true,
      reminderTimes: ["08:00"],
    },
  })

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const onSubmit = (data: MedicationFormValues) => {
    const newMedication = {
      id: crypto.randomUUID(),
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate ? data.endDate.toISOString() : undefined,
      instructions: data.instructions,
      reminderEnabled: data.reminderEnabled,
      reminderTimes: data.reminderEnabled ? reminderTimes : [],
    }

    const updatedMedications = [...medications, newMedication]
    updateMedications(updatedMedications)

    toast({
      title: "Medication Added",
      description: "Your medication has been added successfully.",
    })

    form.reset()
    setReminderTimes(["08:00"])
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    const updatedMedications = medications.filter((medication) => medication.id !== id)
    updateMedications(updatedMedications)

    toast({
      title: "Medication Deleted",
      description: "Your medication has been deleted successfully.",
    })
  }

  const toggleReminder = (id: string, currentStatus: boolean) => {
    const updatedMedications = medications.map((medication) =>
      medication.id === id ? { ...medication, reminderEnabled: !currentStatus } : medication,
    )
    updateMedications(updatedMedications)

    toast({
      title: currentStatus ? "Reminder Disabled" : "Reminder Enabled",
      description: `Reminders for this medication have been ${currentStatus ? "disabled" : "enabled"}.`,
    })
  }

  const addReminderTime = () => {
    setReminderTimes([...reminderTimes, "08:00"])
  }

  const updateReminderTime = (index: number, value: string) => {
    const updated = [...reminderTimes]
    updated[index] = value
    setReminderTimes(updated)
    form.setValue("reminderTimes", updated)
  }

  const removeReminderTime = (index: number) => {
    const updated = reminderTimes.filter((_, i) => i !== index)
    setReminderTimes(updated)
    form.setValue("reminderTimes", updated)
  }

  const activeMedications = medications.filter((med) => {
    if (!med.endDate) return true
    return new Date(med.endDate) >= new Date()
  })

  const pastMedications = medications.filter((med) => {
    if (!med.endDate) return false
    return new Date(med.endDate) < new Date()
  })

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
                  <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
                  <p className="text-muted-foreground">Track and manage your medications</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Medication
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Medication</DialogTitle>
                      <DialogDescription>Enter the details of your medication.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medication Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Lisinopril" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dosage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dosage</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 10mg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Once daily">Once daily</SelectItem>
                                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                                  <SelectItem value="Three times daily">Three times daily</SelectItem>
                                  <SelectItem value="Four times daily">Four times daily</SelectItem>
                                  <SelectItem value="As needed">As needed</SelectItem>
                                  <SelectItem value="Weekly">Weekly</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                    onChange={(e) =>
                                      field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="instructions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instructions (Optional)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="e.g., Take with food" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="reminderEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Reminder</FormLabel>
                                <FormDescription>Enable reminders for this medication</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        {form.watch("reminderEnabled") && (
                          <div className="space-y-2">
                            <FormLabel>Reminder Times</FormLabel>
                            {reminderTimes.map((time, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  type="time"
                                  value={time}
                                  onChange={(e) => updateReminderTime(index, e.target.value)}
                                  className="flex-1"
                                />
                                {reminderTimes.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeReminderTime(index)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addReminderTime}
                              className="mt-2"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Time
                            </Button>
                          </div>
                        )}
                        <DialogFooter>
                          <Button type="submit">Save Medication</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Medications</CardTitle>
                    <CardDescription>Your active medications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeMedications.length > 0 ? (
                      <div className="space-y-4">
                        {activeMedications.map((medication) => (
                          <div
                            key={medication.id}
                            className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg"
                          >
                            <div className="w-12 h-12 rounded-full bg-health-green-100 dark:bg-health-green-900 flex items-center justify-center text-health-green-500 shrink-0">
                              <Pill className="h-6 w-6" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <p className="font-medium">{medication.name}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm bg-health-green-100 dark:bg-health-green-900 text-health-green-700 dark:text-health-green-300 px-2 py-0.5 rounded-full">
                                    {medication.dosage}
                                  </span>
                                  <span className="text-sm bg-muted px-2 py-0.5 rounded-full">
                                    {medication.frequency}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-4 w-4" />
                                  Started: {new Date(medication.startDate).toLocaleDateString()}
                                </div>
                                {medication.endDate && (
                                  <>
                                    <div className="hidden md:block">•</div>
                                    <div>Ends: {new Date(medication.endDate).toLocaleDateString()}</div>
                                  </>
                                )}
                              </div>
                              {medication.instructions && <p className="text-sm mt-2">{medication.instructions}</p>}
                              {medication.reminderEnabled && medication.reminderTimes.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {medication.reminderTimes.map((time, index) => (
                                    <span
                                      key={index}
                                      className="text-xs bg-muted px-2 py-0.5 rounded-full flex items-center"
                                    >
                                      <Clock className="mr-1 h-3 w-3" />
                                      {time}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                              <Button
                                variant="outline"
                                size="icon"
                                className={
                                  medication.reminderEnabled ? "text-health-green-500" : "text-muted-foreground"
                                }
                                onClick={() => toggleReminder(medication.id, medication.reminderEnabled)}
                                title={medication.reminderEnabled ? "Disable reminders" : "Enable reminders"}
                              >
                                {medication.reminderEnabled ? (
                                  <BellRing className="h-4 w-4" />
                                ) : (
                                  <BellOff className="h-4 w-4" />
                                )}
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDelete(medication.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No active medications</div>
                    )}
                  </CardContent>
                </Card>

                {pastMedications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Past Medications</CardTitle>
                      <CardDescription>Your completed medication courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pastMedications.map((medication) => (
                          <div
                            key={medication.id}
                            className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg bg-muted/40"
                          >
                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 shrink-0">
                              <Pill className="h-6 w-6" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <p className="font-medium">{medication.name}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                    {medication.dosage}
                                  </span>
                                  <span className="text-sm bg-muted px-2 py-0.5 rounded-full">
                                    {medication.frequency}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-4 w-4" />
                                  {new Date(medication.startDate).toLocaleDateString()} -{" "}
                                  {new Date(medication.endDate!).toLocaleDateString()}
                                </div>
                              </div>
                              {medication.instructions && <p className="text-sm mt-2">{medication.instructions}</p>}
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                              <Button variant="outline" size="icon" onClick={() => handleDelete(medication.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

