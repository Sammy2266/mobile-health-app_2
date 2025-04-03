// Utility functions for exporting data

/**
 * Convert data to CSV format and trigger download
 * @param data Object containing data to export
 * @param filename Name of the file to download
 */
export const exportToCSV = (data: any, filename: string): void => {
  try {
    // Process each data type
    const csvData: string[] = []

    // Add blood pressure data
    if (data.bloodPressure && data.bloodPressure.length > 0) {
      csvData.push("Blood Pressure Data")
      csvData.push("Date,Systolic,Diastolic,Notes")
      data.bloodPressure.forEach((item: any) => {
        csvData.push(
          `${new Date(item.date).toLocaleDateString()},${item.systolic},${item.diastolic},${item.notes || ""}`,
        )
      })
      csvData.push("")
    }

    // Add heart rate data
    if (data.heartRate && data.heartRate.length > 0) {
      csvData.push("Heart Rate Data")
      csvData.push("Date,Value (BPM),Notes")
      data.heartRate.forEach((item: any) => {
        csvData.push(`${new Date(item.date).toLocaleDateString()},${item.value},${item.notes || ""}`)
      })
      csvData.push("")
    }

    // Add weight data
    if (data.weight && data.weight.length > 0) {
      csvData.push("Weight Data")
      csvData.push("Date,Value (kg),Notes")
      data.weight.forEach((item: any) => {
        csvData.push(`${new Date(item.date).toLocaleDateString()},${item.value},${item.notes || ""}`)
      })
      csvData.push("")
    }

    // Add sleep data
    if (data.sleep && data.sleep.length > 0) {
      csvData.push("Sleep Data")
      csvData.push("Date,Hours,Quality,Notes")
      data.sleep.forEach((item: any) => {
        csvData.push(
          `${new Date(item.date).toLocaleDateString()},${item.hours},${item.quality || "N/A"},${item.notes || ""}`,
        )
      })
      csvData.push("")
    }

    // Add appointments data
    if (data.appointments && data.appointments.length > 0) {
      csvData.push("Appointments")
      csvData.push("Date,Title,Doctor,Location,Type,Completed,Notes")
      data.appointments.forEach((item: any) => {
        csvData.push(
          `${new Date(item.date).toLocaleDateString()},${item.title},${item.doctor || ""},${item.location || ""},${item.type || ""},${item.completed ? "Yes" : "No"},${item.notes || ""}`,
        )
      })
      csvData.push("")
    }

    // Add medications data
    if (data.medications && data.medications.length > 0) {
      csvData.push("Medications")
      csvData.push("Name,Dosage,Frequency,Start Date,End Date,Instructions")
      data.medications.forEach((item: any) => {
        const startDate = item.startDate ? new Date(item.startDate).toLocaleDateString() : "N/A"
        const endDate = item.endDate ? new Date(item.endDate).toLocaleDateString() : "Ongoing"
        csvData.push(`${item.name},${item.dosage},${item.frequency},${startDate},${endDate},${item.instructions || ""}`)
      })
    }

    // Create CSV content
    const csvContent = csvData.join("\n")

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    // Set up download
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log("Export successful")
  } catch (error) {
    console.error("Error exporting data:", error)
  }
}

