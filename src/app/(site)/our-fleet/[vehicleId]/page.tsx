import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Users, Fuel, Settings2, Palette } from "lucide-react"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { selectActiveRate } from "@/lib/rate-lookup"
import { VehicleGallery } from "./vehicle-gallery"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(amount)
}

async function getVehicle(vehicleId: string) {
  try {
    return await db.vehicle.findFirst({
      where: { id: vehicleId, status: "AVAILABLE" },
      include: {
        category: { include: { rates: true } },
        photos: { orderBy: { isPrimary: "desc" } },
      },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vehicleId: string }>
}): Promise<Metadata> {
  const { vehicleId } = await params
  const vehicle = await getVehicle(vehicleId)
  if (!vehicle) return { title: "Vehicle Not Found" }

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  const description =
    vehicle.description ?? `${title} available to hire from WayZo Rentals in Sydney.`
  const photo = vehicle.photos[0]

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: photo ? [{ url: photo.url }] : undefined,
    },
  }
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>
}) {
  const { vehicleId } = await params
  const vehicle = await getVehicle(vehicleId)
  if (!vehicle) notFound()

  const rate = selectActiveRate(vehicle.category.rates)
  const photos = vehicle.photos
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`

  const specs = [
    { icon: Users, label: `${vehicle.seats} seats` },
    { icon: Settings2, label: vehicle.transmission.toLowerCase() },
    { icon: Fuel, label: vehicle.fuelType.toLowerCase() },
    { icon: Palette, label: vehicle.colour },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
      <Link
        href="/our-fleet"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Our Fleet
      </Link>

      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10 lg:items-start">
        <div>
          <VehicleGallery photos={photos} title={title} />

          <div className="mt-8">
            <p className="text-sm font-medium text-primary">{vehicle.category.name}</p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
              {title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              {specs.map((spec) => (
                <span
                  key={spec.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground capitalize"
                >
                  <spec.icon className="h-4 w-4" />
                  {spec.label}
                </span>
              ))}
            </div>

            {vehicle.description && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2">About this vehicle</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {vehicle.description}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 lg:mt-0 lg:sticky lg:top-24">
          <div className="rounded-2xl bg-card ring-1 ring-foreground/10 p-5 sm:p-6">
            {rate ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">{formatCurrency(rate.dailyRate)}</span>
                  <span className="text-sm text-muted-foreground">/ day</span>
                </div>
                {(rate.weeklyRate || rate.monthlyRate) && (
                  <div className="mt-3 space-y-1.5 text-sm text-muted-foreground border-t border-border pt-3">
                    {rate.weeklyRate && (
                      <div className="flex justify-between">
                        <span>Weekly</span>
                        <span className="text-foreground">{formatCurrency(rate.weeklyRate)}</span>
                      </div>
                    )}
                    {rate.monthlyRate && (
                      <div className="flex justify-between">
                        <span>Monthly</span>
                        <span className="text-foreground">{formatCurrency(rate.monthlyRate)}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Contact us for pricing.</p>
            )}
            <Button
              size="xl"
              className="w-full mt-5"
              render={<Link href={`/booking-enquiry?vehicleId=${vehicle.id}`} />}
            >
              Book This Vehicle
              <ArrowRight />
            </Button>
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Free to enquire — we&apos;ll confirm availability and final pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
