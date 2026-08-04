import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Our Fleet",
  description: "Browse the WayZo fleet — economy, SUV, luxury and more.",
};

// Same AVAILABLE-only filter as the Booking Enquiry vehicle picker, so this
// page always shows exactly what customers can currently select there.
async function getBookableVehicles() {
  try {
    const vehicles = await db.vehicle.findMany({
      where: { status: "AVAILABLE" },
      include: {
        category: true,
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

export default async function GalleryPage() {
  const groups = await getBookableVehicles();
  const hasVehicles = groups.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Our Fleet</h1>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          Vehicles currently available to book, grouped by category.
        </p>
      </div>

      {hasVehicles ? (
        <div className="space-y-12">
          {groups.map(([categoryName, vehicles]) => (
            <section key={categoryName}>
              <h2 className="text-xl font-semibold mb-4">{categoryName}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((vehicle) => {
                  const photo = vehicle.photos[0]
                  return (
                    <figure
                      key={vehicle.id}
                      className="overflow-hidden rounded-xl border border-border bg-muted"
                    >
                      <div className="relative aspect-4/3 w-full bg-muted">
                        {photo ? (
                          <Image
                            src={photo.url}
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageOff className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <figcaption className="px-3 py-3 space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {vehicle.seats} seats &middot; {vehicle.transmission.toLowerCase()} &middot;{" "}
                          {vehicle.fuelType.toLowerCase()}
                        </p>
                        {vehicle.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {vehicle.description}
                          </p>
                        )}
                      </figcaption>
                    </figure>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <ImageOff className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="font-medium">No vehicles available right now</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Send us a booking enquiry and we&apos;ll let you know what&apos;s coming up.
          </p>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/booking-enquiry"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Send a Booking Enquiry
        </Link>
      </div>
    </div>
  );
}
