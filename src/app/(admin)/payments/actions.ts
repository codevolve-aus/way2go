"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { PaymentType, PaymentMethod } from "@/generated/prisma"

export async function createPayment(data: {
  bookingId: string
  amount: number
  type: PaymentType
  method: PaymentMethod
  reference?: string
  notes?: string
}) {
  await db.payment.create({ data })
  revalidatePath("/payments")
}
