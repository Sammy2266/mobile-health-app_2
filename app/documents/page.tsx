"use client"

import type React from "react"

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/context/app-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { Download, FileText, Plus, Trash, Upload, File, FileImage, FileIcon as FilePdf } from "lucide-react"
import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ProtectedRoute } from "@/components/protected-route"

const documentFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  type: z.enum(["report", "prescription", "lab_result", "other"]),
  date: z.date({
    required_error: "Please select a date.",
  }),
  notes: z.string().optional(),
})

type DocumentFormValues = z.infer<typeof documentFormSchema>

export default function DocumentsPage() {
  const { documents, updateDocuments, initialized } = useApp()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      type: "report",
      notes: "",
    },
  })

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const onSubmit = (data: DocumentFormValues) => {
    const newDocument = {
      id: crypto.randomUUID(),
      title: data.title,
      type: data.type,
      date: data.date.toISOString(),
      notes: data.notes,
      fileUrl: "",
      fileName: "",
      fileType: "",
    }

    const updatedDocuments = [...documents, newDocument]
    updateDocuments(updatedDocuments)

    toast({
      title: "Document Added",
      description: "Your document has been added successfully.",
    })

    form.reset()
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    const updatedDocuments = documents.filter((document) => document.id !== id)
    updateDocuments(updatedDocuments)

    toast({
      title: "Document Deleted",
      description: "Your document has been deleted successfully.",
    })
  }

  const getDocumentsByType = (type: string) => {
    return documents
      .filter((doc) => doc.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const handleFileUpload = (documentId: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
      fileInputRef.current.dataset.documentId = documentId
    }
  }

  const processFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    const documentId = event.target.dataset.documentId

    if (!file || !documentId) return

    setIsUploading(true)

    try {
      // In a real app, you would upload the file to a server or cloud storage
      // For this demo, we'll simulate a file upload with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a fake URL for the file
      const fileUrl = URL.createObjectURL(file)

      // Update the document with the file information
      const updatedDocuments = documents.map((doc) => {
        if (doc.id === documentId) {
          return {
            ...doc,
            fileUrl,
            fileName: file.name,
            fileType: file.type,
          }
        }
        return doc
      })

      updateDocuments(updatedDocuments)

      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDownload = (document: any) => {
    if (!document.fileUrl) {
      toast({
        title: "No File Available",
        description: "There is no file attached to this document.",
        variant: "destructive",
      })
      return
    }

    // Create an anchor element and trigger download
    const a = document.createElement("a")
    a.href = document.fileUrl
    a.download = document.fileName || `document-${document.id}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast({
      title: "Download Started",
      description: `${document.fileName || "Document"} is being downloaded.`,
    })
  }

  const getFileIcon = (fileType: string) => {
    if (!fileType) return <File className="h-4 w-4" />
    if (fileType.startsWith("image/")) return <FileImage className="h-4 w-4" />
    if (fileType === "application/pdf") return <FilePdf className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const reports = getDocumentsByType("report")
  const prescriptions = getDocumentsByType("prescription")
  const labResults = getDocumentsByType("lab_result")
  const otherDocuments = getDocumentsByType("other")

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
                  <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                  <p className="text-muted-foreground">Manage your medical documents</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Document</DialogTitle>
                      <DialogDescription>Enter the details of your medical document.</DialogDescription>
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
                                <Input placeholder="e.g., Annual Physical Report" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Document Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select document type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="report">Medical Report</SelectItem>
                                  <SelectItem value="prescription">Prescription</SelectItem>
                                  <SelectItem value="lab_result">Lab Result</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
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
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Additional information about this document" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">Save Document</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Hidden file input for uploads */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={processFileUpload}
                accept="image/*,.pdf,.doc,.docx"
              />

              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                  <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                  <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <Card>
                    <CardHeader>
                      <CardTitle>All Documents</CardTitle>
                      <CardDescription>All your medical documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {documents.length > 0 ? (
                        <div className="space-y-4">
                          {documents
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((document) => (
                              <div
                                key={document.id}
                                className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg"
                              >
                                <div className="w-12 h-12 rounded-full bg-health-green-100 dark:bg-health-green-900 flex items-center justify-center text-health-green-500 shrink-0">
                                  <FileText className="h-6 w-6" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <p className="font-medium">{document.title}</p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm bg-health-green-100 dark:bg-health-green-900 text-health-green-700 dark:text-health-green-300 px-2 py-0.5 rounded-full">
                                        {document.type === "report" && "Medical Report"}
                                        {document.type === "prescription" && "Prescription"}
                                        {document.type === "lab_result" && "Lab Result"}
                                        {document.type === "other" && "Other"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(document.date).toLocaleDateString()}
                                  </div>
                                  {document.notes && <p className="text-sm mt-2">{document.notes}</p>}
                                  {document.fileName && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-health-green-600 dark:text-health-green-400">
                                      {getFileIcon(document.fileType)}
                                      <span>{document.fileName}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-4 md:mt-0">
                                  {document.fileUrl ? (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleDownload(document)}
                                      title="Download file"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleFileUpload(document.id)}
                                      disabled={isUploading}
                                      title="Upload file"
                                    >
                                      <Upload className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDelete(document.id)}
                                    title="Delete document"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No documents available</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="reports">
                  <Card>
                    <CardHeader>
                      <CardTitle>Medical Reports</CardTitle>
                      <CardDescription>Your medical reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reports.length > 0 ? (
                        <div className="space-y-4">
                          {reports.map((document) => (
                            <div
                              key={document.id}
                              className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg"
                            >
                              <div className="w-12 h-12 rounded-full bg-health-green-100 dark:bg-health-green-900 flex items-center justify-center text-health-green-500 shrink-0">
                                <FileText className="h-6 w-6" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="font-medium">{document.title}</p>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(document.date).toLocaleDateString()}
                                </div>
                                {document.notes && <p className="text-sm mt-2">{document.notes}</p>}
                                {document.fileName && (
                                  <div className="flex items-center gap-2 mt-2 text-sm text-health-green-600 dark:text-health-green-400">
                                    {getFileIcon(document.fileType)}
                                    <span>{document.fileName}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-4 md:mt-0">
                                {document.fileUrl ? (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDownload(document)}
                                    title="Download file"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleFileUpload(document.id)}
                                    disabled={isUploading}
                                    title="Upload file"
                                  >
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDelete(document.id)}
                                  title="Delete document"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No medical reports available</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="prescriptions">
                  <Card>
                    <CardHeader>
                      <CardTitle>Prescriptions</CardTitle>
                      <CardDescription>Your medication prescriptions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {prescriptions.length > 0 ? (
                        <div className="space-y-4">
                          {prescriptions.map((document) => (
                            <div
                              key={document.id}
                              className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg"
                            >
                              <div className="w-12 h-12 rounded-full bg-health-green-100 dark:bg-health-green-900 flex items-center justify-center text-health-green-500 shrink-0">
                                <FileText className="h-6 w-6" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="font-medium">{document.title}</p>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(document.date).toLocaleDateString()}
                                </div>
                                {document.notes && <p className="text-sm mt-2">{document.notes}</p>}
                                {document.fileName && (
                                  <div className="flex items-center gap-2 mt-2 text-sm text-health-green-600 dark:text-health-green-400">
                                    {getFileIcon(document.fileType)}
                                    <span>{document.fileName}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-4 md:mt-0">
                                {document.fileUrl ? (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDownload(document)}
                                    title="Download file"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleFileUpload(document.id)}
                                    disabled={isUploading}
                                    title="Upload file"
                                  >
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDelete(document.id)}
                                  title="Delete document"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No prescriptions available</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="lab-results">
                  <Card>
                    <CardHeader>
                      <CardTitle>Lab Results</CardTitle>
                      <CardDescription>Your laboratory test results</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {labResults.length > 0 ? (
                        <div className="space-y-4">
                          {labResults.map((document) => (
                            <div
                              key={document.id}
                              className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg"
                            >
                              <div className="w-12 h-12 rounded-full bg-health-green-100 dark:bg-health-green-900 flex items-center justify-center text-health-green-500 shrink-0">
                                <FileText className="h-6 w-6" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="font-medium">{document.title}</p>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(document.date).toLocaleDateString()}
                                </div>
                                {document.notes && <p className="text-sm mt-2">{document.notes}</p>}
                                {document.fileName && (
                                  <div className="flex items-center gap-2 mt-2 text-sm text-health-green-600 dark:text-health-green-400">
                                    {getFileIcon(document.fileType)}
                                    <span>{document.fileName}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-4 md:mt-0">
                                {document.fileUrl ? (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDownload(document)}
                                    title="Download file"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleFileUpload(document.id)}
                                    disabled={isUploading}
                                    title="Upload file"
                                  >
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDelete(document.id)}
                                  title="Delete document"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No lab results available</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="other">
                  <Card>
                    <CardHeader>
                      <CardTitle>Other Documents</CardTitle>
                      <CardDescription>Other medical documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {otherDocuments.length > 0 ? (
                        <div className="space-y-4">
                          {otherDocuments.map((document) => (
                            <div
                              key={document.id}
                              className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg"
                            >
                              <div className="w-12 h-12 rounded-full bg-health-green-100 dark:bg-health-green-900 flex items-center justify-center text-health-green-500 shrink-0">
                                <FileText className="h-6 w-6" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="font-medium">{document.title}</p>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(document.date).toLocaleDateString()}
                                </div>
                                {document.notes && <p className="text-sm mt-2">{document.notes}</p>}
                                {document.fileName && (
                                  <div className="flex items-center gap-2 mt-2 text-sm text-health-green-600 dark:text-health-green-400">
                                    {getFileIcon(document.fileType)}
                                    <span>{document.fileName}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-4 md:mt-0">
                                {document.fileUrl ? (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDownload(document)}
                                    title="Download file"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleFileUpload(document.id)}
                                    disabled={isUploading}
                                    title="Upload file"
                                  >
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDelete(document.id)}
                                  title="Delete document"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No other documents available</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

