import type { Metadata } from "next"
import { db } from "@/lib/db"
import { LegalDocumentsView } from "./legal-documents-view"

export const metadata: Metadata = { title: "Legal Pages" }

async function getLegalDocuments() {
  return db.legalDocument.findMany({
    include: {
      sections: { orderBy: { order: "asc" } },
      revisions: { orderBy: { editedAt: "desc" }, take: 20 },
    },
    orderBy: { slug: "asc" },
  })
}

export default async function LegalPagesPage() {
  const documents = await getLegalDocuments()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Legal Pages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edit the Privacy Policy and Terms &amp; Conditions shown on the public website. Every
          save is recorded in the change history below.
        </p>
      </div>

      <LegalDocumentsView documents={documents} />
    </div>
  )
}
