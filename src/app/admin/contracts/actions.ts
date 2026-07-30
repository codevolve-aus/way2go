"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { ContractStatus } from "@/generated/prisma"

export async function voidContract(id: string) {
  await db.contract.update({
    where: { id },
    data: { status: "CLOSED", closedAt: new Date() },
  })
  revalidatePath("/admin/contracts")
}

export async function updateContractStatus(id: string, status: ContractStatus) {
  await db.contract.update({ where: { id }, data: { status } })
  revalidatePath("/admin/contracts")
}
