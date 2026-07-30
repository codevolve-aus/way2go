import type { Metadata } from "next";
import { ImageOff } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description: "Browse photos of the WayZo fleet — economy, SUV, luxury and more.",
};

async function getPhotographedVehicles() {
  try {
    const vehicles = await db.vehicle.findMany({
      where: {
        status: { not: "RETIRED" },
        photos: { some: {} },
      },
      include: {
        category: true,
        photos: { orderBy: { isPrimary: "desc" } },
      },
      orderBy: { createdAt: "desc" },
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
  const groups = await getPhotographedVehicles();
  const hasPhotos = groups.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Photo Gallery</h1>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          A look at vehicles from our fleet, grouped by category.
        </p>
      </div>

      {hasPhotos ? (
        <div className="space-y-12">
          {groups.map(([categoryName, vehicles]) => (
            <section key={categoryName}>
              <h2 className="text-xl font-semibold mb-4">{categoryName}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((vehicle) =>
                  vehicle.photos.map((photo) => (
                    <figure
                      key={photo.id}
                      className="overflow-hidden rounded-xl border border-border bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="aspect-4/3 w-full object-cover"
                        loading="lazy"
                      />
                      <figcaption className="px-3 py-2 text-sm text-muted-foreground">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </figcaption>
                    </figure>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <ImageOff className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="font-medium">Photos coming soon</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            We&apos;re adding photos of our fleet. In the meantime, send us a booking enquiry
            and we&apos;ll share vehicle details directly.
          </p>
        </div>
      )}
    </div>
  );
}
