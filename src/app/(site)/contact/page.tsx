import type { Metadata } from "next"
import { Phone, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/db"
import { ContactForm } from "./contact-form"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with WayZo Rentals — branch details and a contact form.",
}

async function getActiveLocations() {
  try {
    return await db.location.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    })
  } catch {
    return []
  }
}

export default async function ContactPage() {
  const locations = await getActiveLocations()

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="text-center mb-14 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
          Contact Us
        </h1>
        <p className="mt-3 text-lg text-muted-foreground text-balance">
          Have a question about a rental? Send us a message and we&apos;ll get back to you.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          WAYZO PTY LTD &middot; ABN 99 700 912 698
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Our Branches</h2>
          {locations.length > 0 ? (
            <div className="space-y-4">
              {locations.map((loc) => (
                <Card key={loc.id}>
                  <CardContent className="pt-6 space-y-2">
                    <p className="font-semibold">{loc.name}</p>
                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      {loc.address}, {loc.city} {loc.state} {loc.postcode}
                    </p>
                    {loc.phone && (
                      <a
                        href={`tel:${loc.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        {loc.phone}
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Branch details will be listed here soon — use the form and we&apos;ll get back to you.
            </p>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
