import { Metadata } from "next"
import { db } from "@/lib/db"
import { FleetView } from "./fleet-view"

export const metadata: Metadata = { title: "Fleet" }

export default async function FleetPage() {
  const [vehicles, categories] = await Promise.all([
    db.vehicle.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    db.vehicleCategory.findMany({ orderBy: { name: "asc" } }),
  ])

  return <FleetView vehicles={vehicles} categories={categories} />
}
