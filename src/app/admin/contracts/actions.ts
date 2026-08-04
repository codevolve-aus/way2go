"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import type { ContractStatus, FuelLevel } from "@/generated/prisma"

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

const MAX_PHOTO_BYTES = 8 * 1024 * 1024

export async function uploadContractPhoto(
  contractId: string,
  phase: "pre" | "post",
  formData: FormData
): Promise<string> {
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided")
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed")
  }
  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error("Image must be under 8MB")
  }

  const blob = await put(`contracts/${contractId}/${phase}/${Date.now()}-${file.name}`, file, {
    access: "public",
  })
  return blob.url
}

export async function recordCollection(
  contractId: string,
  data: {
    pickupOdometer: number
    preRentalFuelLevel: FuelLevel
    preConditionNotes?: string
    photoUrls: string[]
  }
) {
  const contract = await db.contract.update({
    where: { id: contractId },
    data: {
      pickupOdometer: data.pickupOdometer,
      preRentalFuelLevel: data.preRentalFuelLevel,
      preConditionNotes: data.preConditionNotes || null,
      preConditionPhotos: data.photoUrls.length ? JSON.stringify(data.photoUrls) : null,
      status: "ACTIVE",
    },
    include: { booking: true },
  })

  await db.booking.update({ where: { id: contract.bookingId }, data: { status: "ACTIVE" } })
  await db.vehicle.update({
    where: { id: contract.booking.vehicleId },
    data: { status: "BOOKED", odometer: data.pickupOdometer },
  })

  revalidatePath("/admin/contracts")
  revalidatePath("/admin/bookings")
  revalidatePath("/admin/fleet")
  revalidatePath("/our-fleet")
  revalidatePath(`/our-fleet/${contract.booking.vehicleId}`)
}

export async function recordReturn(
  contractId: string,
  data: {
    returnOdometer: number
    postRentalFuelLevel: FuelLevel
    postConditionNotes?: string
    photoUrls: string[]
  }
) {
  const contract = await db.contract.update({
    where: { id: contractId },
    data: {
      returnOdometer: data.returnOdometer,
      postRentalFuelLevel: data.postRentalFuelLevel,
      postConditionNotes: data.postConditionNotes || null,
      postConditionPhotos: data.photoUrls.length ? JSON.stringify(data.photoUrls) : null,
      status: "CLOSED",
      closedAt: new Date(),
    },
    include: { booking: true },
  })

  await db.booking.update({
    where: { id: contract.bookingId },
    data: { status: "COMPLETED", actualReturnDate: new Date() },
  })
  await db.vehicle.update({
    where: { id: contract.booking.vehicleId },
    data: { status: "AVAILABLE", odometer: data.returnOdometer },
  })

  revalidatePath("/admin/contracts")
  revalidatePath("/admin/bookings")
  revalidatePath("/admin/fleet")
  revalidatePath("/our-fleet")
  revalidatePath(`/our-fleet/${contract.booking.vehicleId}`)
}
