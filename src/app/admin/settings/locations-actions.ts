"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

// pickupLocation on Booking is a plain string, not a relation, so
// deactivating/deleting a Location never touches historical bookings.

export async function createLocation(data: {
  name: string
  address: string
  city: string
  state: string
  postcode: string
  phone?: string
}) {
  await db.location.create({
    data: { ...data, phone: data.phone || null },
  })
  revalidatePath("/admin/settings")
}

export async function updateLocation(
  id: string,
  data: {
    name: string
    address: string
    city: string
    state: string
    postcode: string
    phone?: string
  }
) {
  await db.location.update({
    where: { id },
    data: { ...data, phone: data.phone || null },
  })
  revalidatePath("/admin/settings")
}

export async function setLocationActive(id: string, isActive: boolean) {
  await db.location.update({ where: { id }, data: { isActive } })
  revalidatePath("/admin/settings")
}
