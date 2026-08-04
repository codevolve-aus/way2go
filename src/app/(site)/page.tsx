import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ShieldCheck,
  MapPin,
  Tag,
  Car,
  ArrowRight,
  ImageOff,
  Users,
  Fuel,
  Settings2,
  ClipboardList,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { selectActiveRate } from "@/lib/rate-lookup";

export const metadata: Metadata = {
  title: "Home",
  description:
    "WayZo Rentals — economy to luxury vehicle hire across Sydney. Send a booking enquiry and our team will be in touch.",
};

const valueProps = [
  {
    icon: Car,
    title: "A Fleet For Every Trip",
    description: "From economy runabouts to SUVs, people movers and luxury vehicles.",
  },
  {
    icon: Tag,
    title: "Transparent Pricing",
    description: "Clear daily, weekly and monthly rates — no hidden surprises.",
  },
  {
    icon: MapPin,
    title: "Convenient Locations",
    description: "Pick up and return across our Sydney branches, including the airport.",
  },
  {
    icon: ShieldCheck,
    title: "Fully Insured Fleet",
    description: "Every vehicle is comprehensively insured and well maintained.",
  },
];

const steps = [
  {
    icon: ClipboardList,
    title: "Send a Booking Enquiry",
    description: "Pick a vehicle, your dates and pickup location — takes under a minute.",
  },
  {
    icon: CheckCircle2,
    title: "We Confirm Availability & Pricing",
    description: "Our team gets back to you directly to lock in the details.",
  },
  {
    icon: KeyRound,
    title: "Pick Up & Go",
    description: "Bring your licence, sign the agreement, and you're on the road.",
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(amount)
}

async function getFeaturedVehicles() {
  try {
    return await db.vehicle.findMany({
      where: { status: "AVAILABLE" },
      include: {
        category: { include: { rates: true } },
        photos: { orderBy: { isPrimary: "desc" }, take: 1 },
      },
      orderBy: [{ make: "asc" }, { model: "asc" }],
      take: 3,
    });
  } catch {
    return [];
  }
}

async function getActiveLocations() {
  try {
    return await db.location.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [vehicles, locations] = await Promise.all([getFeaturedVehicles(), getActiveLocations()]);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/8 via-primary/5 to-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-balance">
              Vehicle Rentals, Made Simple
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              WayZo offers a wide range of well-maintained vehicles for hire across Sydney.
              Tell us what you need and our team will get back to you with the right vehicle at
              the right price.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="xl" render={<Link href="/booking-enquiry" />}>
                Send a Booking Enquiry
                <ArrowRight />
              </Button>
              <Button size="xl" variant="outline" render={<Link href="/our-fleet" />}>
                View Our Fleet
              </Button>
            </div>
          </div>

          {/* Quick quote — plain GET form, no client JS, deep-links into the real booking form */}
          <form
            action="/booking-enquiry"
            method="get"
            className="mt-12 mx-auto max-w-3xl rounded-2xl bg-card ring-1 ring-foreground/10 shadow-lg p-4 sm:p-5 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] items-end"
          >
            <div className="space-y-1.5">
              <label htmlFor="quick-location" className="text-xs font-medium text-muted-foreground">
                Pickup Location
              </label>
              <select
                id="quick-location"
                name="pickupLocation"
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                defaultValue=""
              >
                <option value="" disabled>
                  Any branch
                </option>
                {locations.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="quick-pickup" className="text-xs font-medium text-muted-foreground">
                Pickup Date
              </label>
              <input
                id="quick-pickup"
                name="pickupDate"
                type="date"
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="quick-return" className="text-xs font-medium text-muted-foreground">
                Return Date
              </label>
              <input
                id="quick-return"
                name="returnDate"
                type="date"
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Check Availability
            </Button>
          </form>
        </div>
      </section>

      {/* Available Now */}
      {vehicles.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Available Now</h2>
              <p className="mt-1.5 text-muted-foreground">
                Ready to book — ask about dates and we&apos;ll confirm the rest.
              </p>
            </div>
            <Link
              href="/our-fleet"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
            >
              View All Fleet
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div
            className={
              vehicles.length === 1
                ? "grid max-w-xl mx-auto"
                : vehicles.length === 2
                  ? "grid gap-5 sm:grid-cols-2 max-w-3xl mx-auto"
                  : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {vehicles.map((vehicle) => {
              const photo = vehicle.photos[0];
              const rate = selectActiveRate(vehicle.category.rates);
              return (
                <div
                  key={vehicle.id}
                  className="group overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-lg"
                >
                  <Link href={`/our-fleet/${vehicle.id}`} className="block">
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
                  </Link>
                  <div className="p-4 space-y-3">
                    <div>
                      <Link href={`/our-fleet/${vehicle.id}`}>
                        <p className="font-semibold text-foreground hover:text-primary transition-colors">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </p>
                      </Link>
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
                    </div>
                    <Button
                      className="w-full"
                      render={<Link href={`/booking-enquiry?vehicleId=${vehicle.id}`} />}
                    >
                      Book This Vehicle
                      <ArrowRight />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/our-fleet"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View All Fleet
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Simple, direct, no live checkout — a real person confirms every booking.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center sm:text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground mx-auto sm:mx-0 mb-4">
                  <step.icon className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold text-primary mb-1">STEP {i + 1}</p>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((prop) => (
            <div
              key={prop.title}
              className="rounded-2xl bg-card ring-1 ring-foreground/10 p-5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3.5">
                <prop.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm">{prop.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{prop.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary-foreground">
            Ready to Book?
          </h2>
          <p className="mt-2 text-primary-foreground/80 max-w-xl mx-auto">
            Send us a booking enquiry with your dates and preferred vehicle, and our team will
            confirm availability and pricing.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="xl"
              variant="secondary"
              render={<Link href="/booking-enquiry" />}
            >
              Send a Booking Enquiry
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              render={<Link href="/contact" />}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
