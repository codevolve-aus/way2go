"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createRentalRate(data: {
  categoryId: string
  name: string
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
  isDefault?: boolean
}) {
  await db.rentalRate.create({ data })
  revalidatePath("/pricing")
}

export async function updateRentalRate(id: string, data: {
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
}) {
  await db.rentalRate.update({ where: { id }, data })
  revalidatePath("/pricing")
}

export async function createDiscountCode(data: {
  code: string
  description?: string
  discountPct?: number
  discountAmt?: number
  usageLimit?: number
  expiresAt?: string
}) {
  await db.discountCode.create({
    data: {
      ...data,
      code: data.code.toUpperCase(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    },
  })
  revalidatePath("/pricing")
}

export async function toggleDiscountCode(id: string, isActive: boolean) {
  await db.discountCode.update({ where: { id }, data: { isActive } })
  revalidatePath("/pricing")
}
