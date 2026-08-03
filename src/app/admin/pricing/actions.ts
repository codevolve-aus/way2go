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
  startDate?: string
  endDate?: string
}) {
  const existingCount = await db.rentalRate.count({ where: { categoryId: data.categoryId } })
  const isDefault = data.isDefault ?? existingCount === 0

  await db.$transaction(async (tx) => {
    if (isDefault) {
      await tx.rentalRate.updateMany({
        where: { categoryId: data.categoryId, isDefault: true },
        data: { isDefault: false },
      })
    }
    await tx.rentalRate.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        dailyRate: data.dailyRate,
        weeklyRate: data.weeklyRate,
        monthlyRate: data.monthlyRate,
        isDefault,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    })
  })
  revalidatePath("/admin/pricing")
  revalidatePath("/booking-enquiry")
}

export async function updateRentalRate(id: string, data: {
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
  isDefault?: boolean
  startDate?: string
  endDate?: string
}) {
  await db.$transaction(async (tx) => {
    if (data.isDefault) {
      const current = await tx.rentalRate.findUniqueOrThrow({ where: { id } })
      await tx.rentalRate.updateMany({
        where: { categoryId: current.categoryId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }
    await tx.rentalRate.update({
      where: { id },
      data: {
        dailyRate: data.dailyRate,
        weeklyRate: data.weeklyRate,
        monthlyRate: data.monthlyRate,
        isDefault: data.isDefault,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    })
  })
  revalidatePath("/admin/pricing")
  revalidatePath("/booking-enquiry")
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
  revalidatePath("/admin/pricing")
}

export async function toggleDiscountCode(id: string, isActive: boolean) {
  await db.discountCode.update({ where: { id }, data: { isActive } })
  revalidatePath("/admin/pricing")
}
