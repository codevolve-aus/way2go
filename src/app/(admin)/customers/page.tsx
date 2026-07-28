import { Metadata } from "next"
import { CustomersView } from "./customers-view"

export const metadata: Metadata = { title: "Customers" }

type CustomerType = "Individual" | "Corporate"
type CustomerStatus = "Active" | "Blacklisted"

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  licenceExpiry: string
  type: CustomerType
  totalBookings: number
  status: CustomerStatus
}

const customers: Customer[] = [
  {
    id: "C001",
    firstName: "James",
    lastName: "Hartley",
    email: "j.hartley@email.com.au",
    phone: "0412 345 678",
    licenceExpiry: "2026-08-10",
    type: "Individual",
    totalBookings: 14,
    status: "Active",
  },
  {
    id: "C002",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@telstra.com.au",
    phone: "0423 567 890",
    licenceExpiry: "2027-03-22",
    type: "Corporate",
    totalBookings: 47,
    status: "Active",
  },
  {
    id: "C003",
    firstName: "Lachlan",
    lastName: "O'Brien",
    email: "lachlan.obrien@gmail.com",
    phone: "0401 234 567",
    licenceExpiry: "2025-11-30",
    type: "Individual",
    totalBookings: 3,
    status: "Blacklisted",
  },
  {
    id: "C004",
    firstName: "Sophie",
    lastName: "Nguyen",
    email: "sophie.nguyen@anz.com.au",
    phone: "0438 901 234",
    licenceExpiry: "2028-06-15",
    type: "Corporate",
    totalBookings: 62,
    status: "Active",
  },
  {
    id: "C005",
    firstName: "Dylan",
    lastName: "Matthews",
    email: "dylan.matthews@hotmail.com",
    phone: "0456 789 012",
    licenceExpiry: "2026-08-20",
    type: "Individual",
    totalBookings: 8,
    status: "Active",
  },
  {
    id: "C006",
    firstName: "Caitlin",
    lastName: "Walsh",
    email: "c.walsh@bhp.com.au",
    phone: "0467 890 123",
    licenceExpiry: "2027-12-01",
    type: "Corporate",
    totalBookings: 29,
    status: "Active",
  },
]

const totalCustomers = customers.length
const corporateAccounts = customers.filter((c) => c.type === "Corporate").length
const blacklisted = customers.filter((c) => c.status === "Blacklisted").length

export default function CustomersPage() {
  return (
    <CustomersView
      customers={customers}
      totalCustomers={totalCustomers}
      corporateAccounts={corporateAccounts}
      blacklisted={blacklisted}
    />
  )
}
