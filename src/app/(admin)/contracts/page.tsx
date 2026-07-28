import { Metadata } from "next"
import { ContractsView } from "./contracts-view"

export const metadata: Metadata = { title: "Contracts" }

type ContractStatus = "DRAFT" | "SIGNED" | "ACTIVE" | "CLOSED" | "DISPUTED"

interface Contract {
  id: string
  contractNumber: string
  customer: string
  vehicle: string
  bookingNumber: string
  status: ContractStatus
  totalAmount: number
  depositPaid: number
  depositRequired: number
  createdDate: string
}

const contracts: Contract[] = [
  {
    id: "1",
    contractNumber: "CTR-2026-0041",
    customer: "James Hartley",
    vehicle: "Toyota HiLux SR5 (VIC 1AB 2CD)",
    bookingNumber: "BK-1041",
    status: "ACTIVE",
    totalAmount: 1540.0,
    depositPaid: 400,
    depositRequired: 400,
    createdDate: "2026-07-10",
  },
  {
    id: "2",
    contractNumber: "CTR-2026-0042",
    customer: "Priya Sharma",
    vehicle: "Mercedes-Benz Vito (VIC 3EF 4GH)",
    bookingNumber: "BK-1042",
    status: "SIGNED",
    totalAmount: 3200.0,
    depositPaid: 500,
    depositRequired: 800,
    createdDate: "2026-07-14",
  },
  {
    id: "3",
    contractNumber: "CTR-2026-0043",
    customer: "Sophie Nguyen",
    vehicle: "Ford Ranger XLT (VIC 5IJ 6KL)",
    bookingNumber: "BK-1043",
    status: "DRAFT",
    totalAmount: 980.0,
    depositPaid: 0,
    depositRequired: 300,
    createdDate: "2026-07-20",
  },
  {
    id: "4",
    contractNumber: "CTR-2026-0038",
    customer: "Dylan Matthews",
    vehicle: "Hyundai iLoad (VIC 7MN 8OP)",
    bookingNumber: "BK-1038",
    status: "CLOSED",
    totalAmount: 720.0,
    depositPaid: 200,
    depositRequired: 200,
    createdDate: "2026-06-28",
  },
  {
    id: "5",
    contractNumber: "CTR-2026-0039",
    customer: "Caitlin Walsh",
    vehicle: "Isuzu D-MAX LS-U (VIC 9QR 0ST)",
    bookingNumber: "BK-1039",
    status: "DISPUTED",
    totalAmount: 2100.0,
    depositPaid: 600,
    depositRequired: 600,
    createdDate: "2026-07-01",
  },
  {
    id: "6",
    contractNumber: "CTR-2026-0044",
    customer: "Lachlan O'Brien",
    vehicle: "Nissan Navara ST-X (VIC 2UV 3WX)",
    bookingNumber: "BK-1044",
    status: "DRAFT",
    totalAmount: 560.0,
    depositPaid: 0,
    depositRequired: 150,
    createdDate: "2026-07-24",
  },
  {
    id: "7",
    contractNumber: "CTR-2026-0040",
    customer: "Sophie Nguyen",
    vehicle: "Toyota LandCruiser 200 (VIC 4YZ 5AB)",
    bookingNumber: "BK-1040",
    status: "ACTIVE",
    totalAmount: 4800.0,
    depositPaid: 1000,
    depositRequired: 1000,
    createdDate: "2026-07-05",
  },
]

const draftCount = contracts.filter((c) => c.status === "DRAFT").length
const activeCount = contracts.filter((c) => c.status === "ACTIVE").length
const closedCount = contracts.filter((c) => c.status === "CLOSED").length
const disputedCount = contracts.filter((c) => c.status === "DISPUTED").length

export default function ContractsPage() {
  return (
    <ContractsView
      contracts={contracts}
      draftCount={draftCount}
      activeCount={activeCount}
      closedCount={closedCount}
      disputedCount={disputedCount}
    />
  )
}
