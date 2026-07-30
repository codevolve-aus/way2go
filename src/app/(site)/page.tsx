import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, MapPin, Tag, Car, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Home",
  description:
    "WayZo Vehicle Rentals — economy to luxury vehicle hire across Sydney. Send a booking enquiry and our team will be in touch.",
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

async function getCategories() {
  try {
    return await db.vehicleCategory.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
            Vehicle Rentals Made Simple
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            WayZo offers a wide range of well-maintained vehicles for hire across Sydney.
            Tell us what you need and our team will get back to you with the right vehicle at the right price.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" render={<Link href="/booking-enquiry" />}>
              Send a Booking Enquiry
              <ArrowRight className="ml-1" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/gallery" />}>
              View Our Fleet
            </Button>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((prop) => (
            <Card key={prop.title}>
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                  <prop.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm">{prop.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{prop.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* What we offer */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">What We Offer</h2>
            <p className="mt-2 text-muted-foreground">
              A vehicle for every need — browse our categories below.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Our fleet categories will be listed here soon.
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Ready to Book?</h2>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          Send us a booking enquiry with your dates and preferred vehicle, and our team will
          confirm availability and pricing.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" render={<Link href="/booking-enquiry" />}>
            Send a Booking Enquiry
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/contact" />}>
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
}
