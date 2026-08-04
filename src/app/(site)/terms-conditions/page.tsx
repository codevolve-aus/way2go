import type { Metadata } from "next"
import { db } from "@/lib/db"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for enquiring about and hiring a vehicle from WayZo.",
}

async function getDocument() {
  try {
    return await db.legalDocument.findUnique({
      where: { slug: "terms-conditions" },
      include: { sections: { orderBy: { order: "asc" } } },
    })
  } catch {
    return null
  }
}

export default async function TermsConditionsPage() {
  const doc = await getDocument()

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
        {doc?.title ?? "Terms & Conditions"}
      </h1>
      {doc && (
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated:{" "}
          {new Date(doc.updatedAt).toLocaleDateString("en-AU", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}

      {doc ? (
        <div className="mt-10 divide-y divide-border">
          {doc.sections.map((section) => (
            <section key={section.id} className="py-6 first:pt-0 last:pb-0">
              <h2 className="text-lg font-semibold mb-2 text-foreground">{section.heading}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl bg-muted/40 ring-1 ring-foreground/10 p-6 text-sm text-muted-foreground">
          This page is being updated. Please check back shortly, or contact us directly.
        </p>
      )}
    </div>
  )
}
