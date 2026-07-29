"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { BookingStatus, BookingSource } from "@/generated/prisma"

async function nextBookingNumber() {
  const year = new Date().getFullYear()
  const count = await db.booking.count()
  return `BK-${year}-${String(count + 1).padStart(4, "0")}`
}

export async function createBooking(data: {
  customerId: string
  vehicleId: string
  pickupDate: string
  returnDate: string
  pickupLocation: string
  source: BookingSource
  notes?: string
}) {
  const bookingNumber = await nextBookingNumber()
  await db.booking.create({
    data: {
      bookingNumber,
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      pickupDate: new Date(data.pickupDate),
      returnDate: new Date(data.returnDate),
      pickupLocation: data.pickupLocation,
      source: data.source,
      notes: data.notes,
      status: "PENDING",
    },
  })
  revalidatePath("/bookings")
}

export async function updateBooking(
  id: string,
  data: {
    customerId: string
    vehicleId: string
    pickupDate: string
    returnDate: string
    pickupLocation: string
    source: BookingSource
    notes?: string
  }
) {
  await db.booking.update({
    where: { id },
    data: {
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      pickupDate: new Date(data.pickupDate),
      returnDate: new Date(data.returnDate),
      pickupLocation: data.pickupLocation,
      source: data.source,
      notes: data.notes || null,
    },
  })
  revalidatePath("/bookings")
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  await db.booking.update({ where: { id }, data: { status } })
  revalidatePath("/bookings")
}
