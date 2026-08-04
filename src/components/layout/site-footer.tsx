import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import { db } from "@/lib/db";

const exploreLinks = [
  { title: "Home", href: "/" },
  { title: "Booking Enquiry", href: "/booking-enquiry" },
  { title: "Our Fleet", href: "/our-fleet" },
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
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
              WZ
            </div>
            <span className="text-lg font-semibold tracking-tight">WayZo</span>
          </div>
          <p className="text-sm text-background/65 leading-relaxed">
            Reliable vehicle rentals across Sydney — economy to luxury, ready when you are.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3.5 text-background">Explore</h3>
          <ul className="space-y-2.5">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-background/65 hover:text-background transition-colors"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3.5 text-background">Our Branches</h3>
          {locations.length > 0 ? (
            <ul className="space-y-4">
              {locations.map((loc) => (
                <li key={loc.id} className="text-sm text-background/65">
                  <p className="flex items-start gap-1.5 font-medium text-background">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-background/50" />
                    {loc.name}
                  </p>
                  <p className="pl-5">
                    {loc.address}, {loc.city} {loc.state} {loc.postcode}
                  </p>
                  {loc.phone && (
                    <a
                      href={`tel:${loc.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 mt-0.5 pl-5 hover:text-background transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {loc.phone}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-background/65">
              Branch details coming soon — see our Contact page.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3.5 text-background">Legal</h3>
          <ul className="space-y-2.5">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-background/65 hover:text-background transition-colors"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-background/50">
          <span>
            &copy; {new Date().getFullYear()} WAYZO PTY LTD (ABN 99 700 912 698), trading as WayZo
            Vehicle Rentals. All rights reserved.
          </span>
          <Link href="/sign-in" className="hover:text-background transition-colors">
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
