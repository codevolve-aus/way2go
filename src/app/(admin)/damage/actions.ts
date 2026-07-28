"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { DamageStatus, FaultType } from "@/generated/prisma"

export async function createDamageReport(data: {
  vehicleId: string
  description: string
  faultType?: FaultType
  repairCost?: number
  insuranceClaim?: boolean
}) {
  await db.damageReport.create({ data })
  revalidatePath("/damage")
}

export async function updateDamageStatus(id: string, status: DamageStatus) {
  await db.damageReport.update({ where: { id }, data: { status } })
  revalidatePath("/damage")
}
