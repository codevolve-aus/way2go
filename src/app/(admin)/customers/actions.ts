"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createCustomer(data: {
  firstName: string
  lastName: string
  email: string
  phone: string
  licenceNo?: string
  licenceState?: string
  address?: string
}) {
  await db.customer.create({ data })
  revalidatePath("/customers")
}

export async function blacklistCustomer(id: string, reason: string) {
  await db.customer.update({
    where: { id },
    data: { isBlacklisted: true, blacklistReason: reason },
  })
  revalidatePath("/customers")
}

export async function unblacklistCustomer(id: string) {
  await db.customer.update({
    where: { id },
    data: { isBlacklisted: false, blacklistReason: null },
  })
  revalidatePath("/customers")
}

export async function updateCustomer(id: string, data: {
  firstName: string
  lastName: string
  email: string
  phone: string
  licenceNo?: string
  licenceState?: string
  address?: string
}) {
  await db.customer.update({ where: { id }, data })
  revalidatePath("/customers")
}
