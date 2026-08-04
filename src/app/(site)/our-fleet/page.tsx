import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, ArrowRight, Users, Fuel, Settings2 } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { selectActiveRate } from "@/lib/rate-lookup";

export const metadata: Metadata = {
  title: "Our Fleet",
  description: "Browse the WayZo fleet — economy, SUV, luxury and more.",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Same AVAILABLE-only filter as the Booking Enquiry vehicle picker, so this
// page always shows exactly what customers can currently select there.
async function getBookableVehicles() {
  try {
    const vehicles = await db.vehicle.findMany({
      where: { status: "AVAILABLE" },
      include: {
        category: { include: { rates: true } },
        photos: { orderBy: { isPrimary: "desc" } },
      },
      orderBy: [{ make: "asc" }, { model: "asc" }],
    });

    const byCategory = new Map<string, typeof vehicles>();
    for (const vehicle of vehicles) {
      const key = vehicle.category.name;
      const group = byCategory.get(key) ?? [];
      group.push(vehicle);
      byCategory.set(key, group);
    }
    return Array.from(byCategory.entries()).sort(([a], [b]) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export default async function OurFleetPage() {
  const groups = await getBookableVehicles();
  const hasVehicles = groups.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="text-center mb-14 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
          Our Fleet
        </h1>
        <p className="mt-3 text-lg text-muted-foreground text-balance">
          Every vehicle currently available to book. Pick one, choose your dates, and we&apos;ll
          confirm the rest.
        </p>
      </div>

      {hasVehicles ? (
        <div className="space-y-16">
          {groups.map(([categoryName, vehicles]) => (
            <section key={categoryName}>
              <h2 className="text-2xl font-semibold tracking-tight mb-5">{categoryName}</h2>
              <div
                className={
                  vehicles.length === 1
                    ? "grid gap-5 sm:grid-cols-2 max-w-2xl"
                    : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                }
              >
                {vehicles.map((vehicle) => {
                  const photo = vehicle.photos[0]
                  const rate = selectActiveRate(vehicle.category.rates)
                  return (
                    <div
                      key={vehicle.id}
                      className="group overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-lg"
                    >
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                        {photo ? (
                          <Image
                            src={photo.url}
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageOff className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {rate && (
                          <div className="absolute top-3 right-3 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
                            From {formatCurrency(rate.dailyRate)}/day
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {vehicle.seats} seats
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Settings2 className="h-3.5 w-3.5" />
                              {vehicle.transmission.toLowerCase()}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Fuel className="h-3.5 w-3.5" />
                              {vehicle.fuelType.toLowerCase()}
                            </span>
                          </div>
                          {vehicle.description && (
                            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                              {vehicle.description}
                            </p>
                          )}
                        </div>
                        <Button className="w-full" render={<Link href={`/booking-enquiry?vehicleId=${vehicle.id}`} />}>
                          Book This Vehicle
                          <ArrowRight />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <ImageOff className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="font-medium">No vehicles available right now</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Send us a booking enquiry and we&apos;ll let you know what&apos;s coming up.
          </p>
        </div>
      )}

      <div className="mt-16 text-center">
        <Button size="xl" render={<Link href="/booking-enquiry" />}>
          Send a Booking Enquiry
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
