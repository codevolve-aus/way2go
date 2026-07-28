import { Metadata } from "next"
import { BookingsView } from "./bookings-view"

export const metadata: Metadata = { title: "Bookings" }

type BookingStatus = "Pending" | "Confirmed" | "Active" | "Completed" | "Cancelled"
type BookingSource = "WALK_IN" | "PHONE" | "WEB"

interface Booking {
  id: string
  customer: string
  vehicle: string
  pickupDate: string
  returnDate: string
  status: BookingStatus
  source: BookingSource
}

const bookings: Booking[] = [
  {
    id: "BK-2026-0081",
    customer: "James Hartley",
    vehicle: "Toyota HiLux SR5 (GHB-123)",
    pickupDate: "2026-07-28",
    returnDate: "2026-08-04",
    status: "Active",
    source: "WALK_IN",
  },
  {
    id: "BK-2026-0082",
    customer: "Priya Sharma",
    vehicle: "Kia Carnival S (TLP-445)",
    pickupDate: "2026-07-30",
    returnDate: "2026-08-06",
    status: "Confirmed",
    source: "WEB",
  },
  {
    id: "BK-2026-0083",
    customer: "Sophie Nguyen",
    vehicle: "Hyundai Tucson Elite (MRK-889)",
    pickupDate: "2026-08-01",
    returnDate: "2026-08-08",
    status: "Confirmed",
    source: "PHONE",
  },
  {
    id: "BK-2026-0084",
    customer: "Dylan Matthews",
    vehicle: "Ford Ranger XLT (PQR-776)",
    pickupDate: "2026-08-05",
    returnDate: "2026-08-07",
    status: "Pending",
    source: "WEB",
  },
  {
    id: "BK-2026-0085",
    customer: "Caitlin Walsh",
    vehicle: "Mercedes-Benz C200 (STU-321)",
    pickupDate: "2026-08-10",
    returnDate: "2026-08-17",
    status: "Pending",
    source: "PHONE",
  },
  {
    id: "BK-2026-0079",
    customer: "Lachlan O'Brien",
    vehicle: "Mitsubishi Outlander LS (VWX-654)",
    pickupDate: "2026-07-18",
    returnDate: "2026-07-25",
    status: "Completed",
    source: "WALK_IN",
  },
  {
    id: "BK-2026-0077",
    customer: "James Hartley",
    vehicle: "Nissan Navara ST (YZA-987)",
    pickupDate: "2026-07-10",
    returnDate: "2026-07-14",
    status: "Completed",
    source: "WEB",
  },
  {
    id: "BK-2026-0080",
    customer: "Sophie Nguyen",
    vehicle: "Toyota Camry Ascent (BCD-111)",
    pickupDate: "2026-07-22",
    returnDate: "2026-07-28",
    status: "Cancelled",
    source: "PHONE",
  },
]

const today = "2026-07-28"

const pendingCount = bookings.filter((b) => b.status === "Pending").length
const confirmedCount = bookings.filter((b) => b.status === "Confirmed").length
const activeCount = bookings.filter((b) => b.status === "Active").length
const todaysReturns = bookings.filter(
  (b) => b.returnDate === today && (b.status === "Active" || b.status === "Confirmed")
).length

export default function BookingsPage() {
  return (
    <BookingsView
      bookings={bookings}
      pendingCount={pendingCount}
      confirmedCount={confirmedCount}
      activeCount={activeCount}
      todaysReturns={todaysReturns}
    />
  )
}
