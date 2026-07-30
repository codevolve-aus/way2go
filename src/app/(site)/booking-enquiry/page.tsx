import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/db"
import { BookingEnquiryForm } from "./booking-enquiry-form"

export const metadata: Metadata = {
  title: "Booking Enquiry",
  description: "Send WayZo a booking enquiry with your dates and preferred vehicle.",
}

async function getFormOptions() {
  try {
    const [categories, locations] = await Promise.all([
      db.vehicleCategory.findMany({ orderBy: { name: "asc" } }),
      db.location.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ])
    return { categories, locations }
  } catch {
    return { categories: [], locations: [] }
  }
}

export default async function BookingEnquiryPage() {
  const { categories, locations } = await getFormOptions()

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Booking Enquiry</h1>
        <p className="mt-2 text-muted-foreground">
          Tell us what you need and our team will confirm availability and pricing —
          this isn&apos;t a live booking, just the fastest way to reach us.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <BookingEnquiryForm categories={categories} locations={locations} />
        </CardContent>
      </Card>
    </div>
  )
}
