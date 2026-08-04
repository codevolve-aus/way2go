"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"
import type { VehicleStatus, FuelType, Transmission } from "@/generated/prisma"

export async function createVehicle(data: {
  make: string
  model: string
  year: number
  colour: string
  registrationNo: string
  categoryId: string
  fuelType: FuelType
  transmission: Transmission
  seats: number
  odometer?: number
  vin?: string
  notes?: string
  description?: string
}) {
  await db.vehicle.create({ data: { ...data, status: "AVAILABLE" } })
  revalidatePath("/admin/fleet")
}

export async function updateVehicle(
  id: string,
  data: {
    make: string
    model: string
    year: number
    colour: string
    registrationNo: string
    categoryId: string
    fuelType: FuelType
    transmission: Transmission
    seats: number
    odometer?: number
    vin?: string
    notes?: string
    description?: string
  }
) {
  await db.vehicle.update({ where: { id }, data })
  revalidatePath("/admin/fleet")
  revalidatePath("/gallery")
  revalidatePath("/booking-enquiry")
}

export async function updateVehicleStatus(id: string, status: VehicleStatus) {
  await db.vehicle.update({ where: { id }, data: { status } })
  revalidatePath("/admin/fleet")
}

export async function deleteVehicle(id: string) {
  const photos = await db.vehiclePhoto.findMany({ where: { vehicleId: id } })
  await Promise.all(photos.map((p) => del(p.url).catch(() => {})))
  await db.vehicle.delete({ where: { id } })
  revalidatePath("/admin/fleet")
  revalidatePath("/gallery")
  revalidatePath("/booking-enquiry")
}

const MAX_PHOTO_BYTES = 8 * 1024 * 1024

export async function uploadVehiclePhoto(vehicleId: string, formData: FormData) {
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

  const existingCount = await db.vehiclePhoto.count({ where: { vehicleId } })
  const blob = await put(`vehicles/${vehicleId}/${Date.now()}-${file.name}`, file, {
    access: "public",
  })

  await db.vehiclePhoto.create({
    data: { vehicleId, url: blob.url, isPrimary: existingCount === 0 },
  })

  revalidatePath("/admin/fleet")
  revalidatePath("/gallery")
  revalidatePath("/booking-enquiry")
}

export async function deleteVehiclePhoto(photoId: string) {
  const photo = await db.vehiclePhoto.findUniqueOrThrow({ where: { id: photoId } })
  await del(photo.url).catch(() => {})
  await db.vehiclePhoto.delete({ where: { id: photoId } })

  if (photo.isPrimary) {
    const next = await db.vehiclePhoto.findFirst({ where: { vehicleId: photo.vehicleId } })
    if (next) await db.vehiclePhoto.update({ where: { id: next.id }, data: { isPrimary: true } })
  }

  revalidatePath("/admin/fleet")
  revalidatePath("/gallery")
  revalidatePath("/booking-enquiry")
}

export async function setPrimaryVehiclePhoto(photoId: string) {
  const photo = await db.vehiclePhoto.findUniqueOrThrow({ where: { id: photoId } })
  await db.$transaction([
    db.vehiclePhoto.updateMany({
      where: { vehicleId: photo.vehicleId, isPrimary: true },
      data: { isPrimary: false },
    }),
    db.vehiclePhoto.update({ where: { id: photoId }, data: { isPrimary: true } }),
  ])

  revalidatePath("/admin/fleet")
  revalidatePath("/gallery")
  revalidatePath("/booking-enquiry")
}
