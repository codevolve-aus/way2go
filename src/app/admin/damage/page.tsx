import { Metadata } from "next"
import { db } from "@/lib/db"
import { DamageView } from "./damage-view"

export const metadata: Metadata = { title: "Damage & Incidents" }

export default async function DamagePage() {
  const [reports, vehicles] = await Promise.all([
    db.damageReport.findMany({ include: { vehicle: true }, orderBy: { createdAt: "desc" } }),
    db.vehicle.findMany({ orderBy: { make: "asc" } }),
  ])

  return <DamageView reports={reports} vehicles={vehicles} />
}
