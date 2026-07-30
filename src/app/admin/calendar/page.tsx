import { Metadata } from "next"
import { db } from "@/lib/db"
import { CalendarView } from "./calendar-view"
import type { BookingEvent, MaintenanceEvent, BlockEvent, VehicleRow } from "./calendar-view"

export const metadata: Metadata = { title: "Calendar" }

export default async function CalendarPage() {
  const [vehicles, bookings, maintenanceRecords, calendarBlocks] = await Promise.all([
    db.vehicle.findMany({
      where: { status: { not: "RETIRED" } },
      orderBy: [{ make: "asc" }, { model: "asc" }],
    }),
    db.booking.findMany({
      where: { status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] } },
      include: { customer: true },
      orderBy: { pickupDate: "asc" },
    }),
    db.maintenanceRecord.findMany({
      where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
      orderBy: { scheduledDate: "asc" },
    }),
    db.calendarBlock.findMany({
      orderBy: { startDate: "asc" },
    }),
  ])

  const vehicleRows: VehicleRow[] = vehicles.map((v) => ({
    id: v.id,
    name: `${v.make} ${v.model} ${v.year}`,
    plate: v.registrationNo,
  }))

  const bookingEvents: BookingEvent[] = bookings.map((b) => ({
    vehicleId: b.vehicleId,
    startDate: b.pickupDate.toISOString(),
    endDate: b.returnDate.toISOString(),
    customerName: `${b.customer.firstName} ${b.customer.lastName}`,
    bookingNumber: b.bookingNumber,
    status: b.status,
  }))

  const maintenanceEvents: MaintenanceEvent[] = maintenanceRecords.map((m) => ({
    vehicleId: m.vehicleId,
    startDate: m.scheduledDate.toISOString(),
    // Show at least 1 day; if completedDate exists use that, else show as a single-day block
    endDate: (m.completedDate ?? m.scheduledDate).toISOString(),
  }))

  const blockEvents: BlockEvent[] = calendarBlocks.map((b) => ({
    vehicleId: b.vehicleId,
    startDate: b.startDate.toISOString(),
    endDate: b.endDate.toISOString(),
    reason: b.reason,
  }))

  return (
    <CalendarView
      vehicles={vehicleRows}
      bookings={bookingEvents}
      maintenance={maintenanceEvents}
      blocks={blockEvents}
    />
  )
}
