import { Metadata } from "next"
import { db } from "@/lib/db"
import { PaymentsView } from "./payments-view"

export const metadata: Metadata = { title: "Payments" }

export default async function PaymentsPage() {
  const [payments, bookings] = await Promise.all([
    db.payment.findMany({
      include: { booking: { include: { customer: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.booking.findMany({
      where: { status: { in: ["CONFIRMED", "ACTIVE", "COMPLETED"] } },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ])
  return <PaymentsView payments={payments} bookings={bookings} />
}
