import { Metadata } from "next"
import { db } from "@/lib/db"
import { MaintenanceView } from "./maintenance-view"

export const metadata: Metadata = { title: "Maintenance" }

export default async function MaintenancePage() {
  const records = await db.maintenanceRecord.findMany({
    include: { vehicle: true },
    orderBy: { scheduledDate: "desc" },
  })

  const now = new Date()

  const maintenanceRecords = records.map((r) => ({
    id: r.id,
    vehicle: `${r.vehicle.make} ${r.vehicle.model} (${r.vehicle.registrationNo})`,
    type: r.type,
    scheduledDate: r.scheduledDate.toISOString(),
    status: r.status,
    odometerDue: r.odometerAtService,
    cost: r.cost,
    vendor: r.vendor ?? "",
  }))

  const upcoming = records.filter(
    (r) => r.status === "SCHEDULED" && r.scheduledDate > now
  ).length
  const overdue = records.filter(
    (r) => r.status === "SCHEDULED" && r.scheduledDate <= now
  ).length
  const inProgress = records.filter((r) => r.status === "IN_PROGRESS").length

  return (
    <MaintenanceView
      maintenanceRecords={maintenanceRecords}
      upcoming={upcoming}
      overdue={overdue}
      inProgress={inProgress}
    />
  )
}
