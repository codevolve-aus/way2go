import type { Metadata } from "next"
import { db } from "@/lib/db"
import { BookingEnquiryForm, type InitialValues } from "./booking-enquiry-form"

export const metadata: Metadata = {
  title: "Booking Enquiry",
  description: "Send WayZo a booking enquiry with your dates and preferred vehicle.",
}

async function getFormOptions() {
  try {
    const [vehicles, locations, bookings] = await Promise.all([
      db.vehicle.findMany({
        where: { status: "AVAILABLE" },
        include: { photos: { orderBy: { isPrimary: "desc" }, take: 1 } },
        orderBy: [{ make: "asc" }, { model: "asc" }],
      }),
      db.location.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      db.booking.findMany({
        where: { status: { in: ["CONFIRMED", "ACTIVE"] } },
        select: { vehicleId: true, pickupDate: true, returnDate: true },
      }),
    ])
    return { vehicles, locations, bookings }
  } catch {
    return { vehicles: [], locations: [], bookings: [] }
  }
}

const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/

export default async function BookingEnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{
    vehicleId?: string
    pickupLocation?: string
    pickupDate?: string
    returnDate?: string
  }>
}) {
  const [{ vehicles, locations, bookings }, params] = await Promise.all([
    getFormOptions(),
    searchParams,
  ])

  // Never trust the URL directly — only carry values through that match a
  // real, currently-available vehicle/location.
  const initialValues: InitialValues = {}
  if (params.vehicleId && vehicles.some((v) => v.id === params.vehicleId)) {
    initialValues.vehicleId = params.vehicleId
  }
  if (params.pickupLocation && locations.some((l) => l.name === params.pickupLocation)) {
    initialValues.pickupLocation = params.pickupLocation
  }
  if (params.pickupDate && DATE_SHAPE.test(params.pickupDate)) {
    initialValues.pickupDate = params.pickupDate
  }
  if (params.returnDate && DATE_SHAPE.test(params.returnDate)) {
    initialValues.returnDate = params.returnDate
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Booking Enquiry</h1>
        <p className="mt-2 text-muted-foreground">
          Tell us what you need and our team will confirm availability and pricing —
          this isn&apos;t a live booking, just the fastest way to reach us.
        </p>
      </div>

      <BookingEnquiryForm
        vehicles={vehicles}
        locations={locations}
        bookings={bookings}
        initialValues={initialValues}
      />
    </div>
  )
}
