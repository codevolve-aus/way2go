import type { MetadataRoute } from "next"
import { db } from "@/lib/db"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wayzo.com.au"

const publicRoutes = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/booking-enquiry", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/our-fleet", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms-conditions", priority: 0.3, changeFrequency: "yearly" as const },
]

async function getAvailableVehicleIds() {
  try {
    const vehicles = await db.vehicle.findMany({
      where: { status: "AVAILABLE" },
      select: { id: true },
    })
    return vehicles.map((v) => v.id)
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicleIds = await getAvailableVehicleIds()

  return [
    ...publicRoutes.map((route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...vehicleIds.map((id) => ({
      url: `${baseUrl}/our-fleet/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]
}
