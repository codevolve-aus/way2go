import Link from "next/link";
import { Phone } from "lucide-react";
import { db } from "@/lib/db";

const exploreLinks = [
  { title: "Home", href: "/" },
  { title: "Booking Enquiry", href: "/booking-enquiry" },
  { title: "Gallery", href: "/gallery" },
  { title: "Contact", href: "/contact" },
];

const legalLinks = [
  { title: "Privacy Policy", href: "/privacy-policy" },
  { title: "Terms & Conditions", href: "/terms-conditions" },
];

async function getActiveLocations() {
  try {
    return await db.location.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export async function SiteFooter() {
  const locations = await getActiveLocations();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              WZ
            </div>
            <span className="text-base font-semibold tracking-tight">WayZo</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Reliable vehicle rentals across Sydney — economy to luxury, ready when you are.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Explore</h3>
          <ul className="space-y-2">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Our Branches</h3>
          {locations.length > 0 ? (
            <ul className="space-y-3">
              {locations.map((loc) => (
                <li key={loc.id} className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{loc.name}</p>
                  <p>
                    {loc.address}, {loc.city} {loc.state} {loc.postcode}
                  </p>
                  {loc.phone && (
                    <a
                      href={`tel:${loc.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 mt-0.5 hover:text-foreground transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {loc.phone}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Branch details coming soon — see our Contact page.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Legal</h3>
          <ul className="space-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} WayZo Vehicle Rentals. All rights reserved.</span>
          <Link href="/sign-in" className="hover:text-foreground transition-colors">
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
