import type { Metadata } from "next"
import { db } from "@/lib/db"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How WayZo Vehicle Rentals collects, uses and protects your personal information.",
}

async function getDocument() {
  try {
    return await db.legalDocument.findUnique({
      where: { slug: "privacy-policy" },
      include: { sections: { orderBy: { order: "asc" } } },
    })
  } catch {
    return null
  }
}

export default async function PrivacyPolicyPage() {
  const doc = await getDocument()

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
        {doc?.title ?? "Privacy Policy"}
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
        <div className="mt-10 space-y-8">
          {doc.sections.map((section) => (
            <section key={section.id}>
              <h2 className="text-lg font-semibold mb-2">{section.heading}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-muted-foreground">
          This page is being updated. Please check back shortly, or contact us directly.
        </p>
      )}
    </div>
  )
}
