import { Metadata } from "next"
import { db } from "@/lib/db"
import { BookingsView } from "./bookings-view"

export const metadata: Metadata = { title: "Bookings" }

export default async function BookingsPage() {
  const [bookings, customers, vehicles] = await Promise.all([
    db.booking.findMany({
      include: { customer: true, vehicle: true },
      orderBy: { createdAt: "desc" },
    }),
    db.customer.findMany({
      where: { isBlacklisted: false },
      orderBy: { lastName: "asc" },
    }),
    db.vehicle.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { make: "asc" },
    }),
  ])
  return <BookingsView bookings={bookings} customers={customers} vehicles={vehicles} />
}
