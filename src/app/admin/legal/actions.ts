"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

async function requireAdminSession() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")
  return session
}

export async function updateLegalDocument(input: {
  documentId: string
  slug: string
  title: string
  sections: { heading: string; body: string }[]
}) {
  const session = await requireAdminSession()
  const editedBy = session.user?.name ?? session.user?.email ?? "Unknown"

  await db.$transaction(async (tx) => {
    await tx.legalDocumentSection.deleteMany({ where: { documentId: input.documentId } })
    await tx.legalDocument.update({
      where: { id: input.documentId },
      data: {
        title: input.title,
        updatedBy: editedBy,
        sections: {
          create: input.sections.map((s, i) => ({ order: i, heading: s.heading, body: s.body })),
        },
      },
    })
    await tx.legalDocumentRevision.create({
      data: {
        documentId: input.documentId,
        snapshot: { title: input.title, sections: input.sections },
        editedBy,
      },
    })
  })

  revalidatePath("/admin/legal")
  revalidatePath(`/${input.slug}`)
}
