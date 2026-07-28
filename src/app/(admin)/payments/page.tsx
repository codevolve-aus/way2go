import { Metadata } from "next"
import { PaymentsView } from "./payments-view"

export const metadata: Metadata = { title: "Payments" }

const payments = [
  {
    id: "PAY-001",
    bookingId: "BK-1042",
    customer: "James Nguyen",
    amount: 450.0,
    type: "DEPOSIT",
    method: "CARD",
    date: "2026-07-20",
  },
  {
    id: "PAY-002",
    bookingId: "BK-1043",
    customer: "Sarah Mitchell",
    amount: 1250.0,
    type: "RENTAL_FEE",
    method: "CARD",
    date: "2026-07-21",
  },
  {
    id: "PAY-003",
    bookingId: "BK-1038",
    customer: "David Chen",
    amount: 200.0,
    type: "DAMAGE_FEE",
    method: "CASH",
    date: "2026-07-19",
  },
  {
    id: "PAY-004",
    bookingId: "BK-1044",
    customer: "Emma Patel",
    amount: 850.0,
    type: "RENTAL_FEE",
    method: "BANK_TRANSFER",
    date: "2026-07-22",
  },
  {
    id: "PAY-005",
    bookingId: "BK-1045",
    customer: "Tom Walsh",
    amount: 300.0,
    type: "DEPOSIT",
    method: "CARD",
    date: "2026-07-23",
  },
  {
    id: "PAY-006",
    bookingId: "BK-1039",
    customer: "Lily Tran",
    amount: 75.0,
    type: "LATE_FEE",
    method: "CASH",
    date: "2026-07-18",
  },
  {
    id: "PAY-007",
    bookingId: "BK-1046",
    customer: "Michael Park",
    amount: 2100.0,
    type: "RENTAL_FEE",
    method: "CARD",
    date: "2026-07-24",
  },
  {
    id: "PAY-008",
    bookingId: "BK-1040",
    customer: "Aisha Rahman",
    amount: 500.0,
    type: "DEPOSIT",
    method: "BANK_TRANSFER",
    date: "2026-07-17",
  },
]

const invoices = [
  {
    id: "INV-2026-0091",
    bookingId: "BK-1042",
    subtotal: 1136.36,
    gst: 113.64,
    total: 1250.0,
    status: "PAID",
    dueDate: "2026-07-25",
  },
  {
    id: "INV-2026-0092",
    bookingId: "BK-1043",
    subtotal: 772.73,
    gst: 77.27,
    total: 850.0,
    status: "OVERDUE",
    dueDate: "2026-07-15",
  },
  {
    id: "INV-2026-0093",
    bookingId: "BK-1044",
    subtotal: 1909.09,
    gst: 190.91,
    total: 2100.0,
    status: "SENT",
    dueDate: "2026-08-05",
  },
  {
    id: "INV-2026-0094",
    bookingId: "BK-1045",
    subtotal: 409.09,
    gst: 40.91,
    total: 450.0,
    status: "DRAFT",
    dueDate: "2026-08-10",
  },
  {
    id: "INV-2026-0095",
    bookingId: "BK-1046",
    subtotal: 681.82,
    gst: 68.18,
    total: 750.0,
    status: "OVERDUE",
    dueDate: "2026-07-10",
  },
]

const outstanding = [
  {
    bookingId: "BK-1043",
    customer: "Sarah Mitchell",
    vehicle: "Toyota Camry (ABC-123)",
    balance: 800.0,
    dueDate: "2026-07-15",
  },
  {
    bookingId: "BK-1046",
    customer: "Lily Tran",
    vehicle: "Honda CR-V (XYZ-789)",
    balance: 750.0,
    dueDate: "2026-07-10",
  },
  {
    bookingId: "BK-1047",
    customer: "Ryan Kim",
    vehicle: "Hyundai i30 (DEF-456)",
    balance: 350.0,
    dueDate: "2026-07-28",
  },
  {
    bookingId: "BK-1048",
    customer: "Nina Okafor",
    vehicle: "Ford Ranger (GHI-321)",
    balance: 1200.0,
    dueDate: "2026-08-01",
  },
]

const totalCollected = payments.reduce((s, p) => s + p.amount, 0)
const outstandingBalance = outstanding.reduce((s, o) => s + o.balance, 0)
const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length

export default function PaymentsPage() {
  return (
    <PaymentsView
      payments={payments}
      invoices={invoices}
      outstanding={outstanding}
      totalCollected={totalCollected}
      outstandingBalance={outstandingBalance}
      overdueCount={overdueCount}
    />
  )
}
