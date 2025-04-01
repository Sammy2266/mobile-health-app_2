import { type NextRequest, NextResponse } from "next/server"
import { getDocumentsForUser, updateDocument, createDocument, deleteDocument } from "@/lib/db-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, documents } = await request.json()

    if (!userId || !documents) {
      return NextResponse.json({ error: "User ID and documents are required" }, { status: 400 })
    }

    // Get current documents
    const currentDocuments = await getDocumentsForUser(userId)

    // Process each document
    for (const document of documents) {
      const existingDocument = currentDocuments.find((d) => d.id === document.id)

      if (existingDocument) {
        // Update existing document
        await updateDocument(userId, document)
      } else {
        // Create new document
        await createDocument(userId, document)
      }
    }

    // Delete documents that are not in the new list
    for (const currentDocument of currentDocuments) {
      if (!documents.some((d) => d.id === currentDocument.id)) {
        await deleteDocument(userId, currentDocument.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Batch update documents error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

