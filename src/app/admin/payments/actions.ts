"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { PaymentType, PaymentMethod } from "@/generated/prisma"
import { notifyTeam } from "@/lib/notifications-actions"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(amount)
}

export async function createPayment(data: {
  bookingId: string
  amount: number
  type: PaymentType
  method: PaymentMethod
  reference?: string
  notes?: string
}) {
  const payment = await db.payment.create({
    data,
    include: { booking: { include: { customer: true } } },
  })
  revalidatePath("/admin/payments")

  await notifyTeam("paymentReceived", `Payment Recorded — ${payment.booking.bookingNumber}`, [
    { label: "Booking", value: payment.booking.bookingNumber },
    {
      label: "Customer",
      value: `${payment.booking.customer.firstName} ${payment.booking.customer.lastName}`,
    },
    { label: "Amount", value: formatCurrency(payment.amount) },
    { label: "Type", value: payment.type },
    { label: "Method", value: payment.method },
  ])
}
