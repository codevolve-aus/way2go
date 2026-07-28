"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { MaintenanceStatus, MaintenanceType } from "@/generated/prisma"

export async function createMaintenanceRecord(data: {
  vehicleId: string
  type: MaintenanceType
  scheduledDate: Date
  description?: string
  cost?: number
  vendor?: string
}) {
  await db.maintenanceRecord.create({ data })
  revalidatePath("/maintenance")
}

export async function updateMaintenanceStatus(id: string, status: MaintenanceStatus) {
  await db.maintenanceRecord.update({ where: { id }, data: { status } })
  revalidatePath("/maintenance")
}
