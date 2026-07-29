"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
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
}) {
  await db.vehicle.create({ data: { ...data, status: "AVAILABLE" } })
  revalidatePath("/fleet")
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
  }
) {
  await db.vehicle.update({ where: { id }, data })
  revalidatePath("/fleet")
}

export async function updateVehicleStatus(id: string, status: VehicleStatus) {
  await db.vehicle.update({ where: { id }, data: { status } })
  revalidatePath("/fleet")
}

export async function deleteVehicle(id: string) {
  await db.vehicle.delete({ where: { id } })
  revalidatePath("/fleet")
}
