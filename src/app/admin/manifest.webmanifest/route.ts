import { NextResponse } from "next/server"
import type { MetadataRoute } from "next"

// Next.js only auto-generates the special manifest.ts route at the app root,
// so the admin portal's distinct install identity is served by hand here.
export function GET() {
  const manifest: MetadataRoute.Manifest = {
    name: "WayZo Admin",
    short_name: "WayZo Admin",
    description: "WayZo staff portal — manage fleet, bookings, pricing and contracts.",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icons/icon-admin.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-admin-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  }

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  })
}
