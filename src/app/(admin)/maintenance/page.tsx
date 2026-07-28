import { Metadata } from "next"
import { MaintenanceView } from "./maintenance-view"

export const metadata: Metadata = { title: "Maintenance" }

const today = "2026-07-28"

const maintenanceRecords = [
  {
    id: "MNT-001",
    vehicle: "Toyota Camry (ABC-123)",
    type: "SERVICE",
    scheduledDate: "2026-08-05",
    status: "SCHEDULED",
    odometerDue: 120000,
    cost: null,
    vendor: "Toyota Service Centre Sydney",
  },
  {
    id: "MNT-002",
    vehicle: "Honda CR-V (XYZ-789)",
    type: "REGISTRATION",
    scheduledDate: "2026-07-15",
    status: "OVERDUE",
    odometerDue: null,
    cost: null,
    vendor: "NSW Service NSW",
  },
  {
    id: "MNT-003",
    vehicle: "Ford Ranger (GHI-321)",
    type: "TYRE_REPLACEMENT",
    scheduledDate: "2026-07-30",
    status: "SCHEDULED",
    odometerDue: 85000,
    cost: null,
    vendor: "Bob Jane T-Marts Parramatta",
  },
  {
    id: "MNT-004",
    vehicle: "Hyundai i30 (DEF-456)",
    type: "SERVICE",
    scheduledDate: "2026-07-20",
    status: "IN_PROGRESS",
    odometerDue: 60000,
    cost: null,
    vendor: "Hyundai Authorized Service",
  },
  {
    id: "MNT-005",
    vehicle: "Kia Sportage (JKL-654)",
    type: "INSPECTION",
    scheduledDate: "2026-07-10",
    status: "COMPLETED",
    odometerDue: 50000,
    cost: 180.0,
    vendor: "Quick Inspect Pty Ltd",
  },
  {
    id: "MNT-006",
    vehicle: "Mazda CX-5 (MNO-987)",
    type: "BRAKE_SERVICE",
    scheduledDate: "2026-08-01",
    status: "SCHEDULED",
    odometerDue: 95000,
    cost: null,
    vendor: "Midas Brake & Clutch",
  },
  {
    id: "MNT-007",
    vehicle: "Nissan X-Trail (PQR-111)",
    type: "OIL_CHANGE",
    scheduledDate: "2026-07-25",
    status: "COMPLETED",
    odometerDue: 78000,
    cost: 95.0,
    vendor: "Jiffy Lube Chatswood",
  },
]

const sevenDaysFromNow = new Date(today)
sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0]

const upcoming = maintenanceRecords.filter(
  (r) =>
    r.scheduledDate > today &&
    r.scheduledDate <= sevenDaysStr &&
    r.status === "SCHEDULED"
).length
const overdue = maintenanceRecords.filter((r) => r.status === "OVERDUE").length
const inProgress = maintenanceRecords.filter((r) => r.status === "IN_PROGRESS").length

export default function MaintenancePage() {
  return (
    <MaintenanceView
      maintenanceRecords={maintenanceRecords}
      upcoming={upcoming}
      overdue={overdue}
      inProgress={inProgress}
    />
  )
}
