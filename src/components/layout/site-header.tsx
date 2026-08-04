"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Booking Enquiry", href: "/booking-enquiry" },
  { title: "Our Fleet", href: "/our-fleet" },
  { title: "Contact", href: "/contact" },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-sm">
        WZ
      </div>
      <span className="text-lg font-semibold tracking-tight">WayZo</span>
    </Link>
  );
}

export function SiteHeader({ phone }: { phone: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 transition-shadow",
        scrolled ? "border-border shadow-sm" : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />

        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-foreground py-1",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.title}
                {isActive && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          {phone && (
            <Button
              variant="outline"
              className="hidden sm:inline-flex"
              render={<a href={`tel:${phone.replace(/\s/g, "")}`} />}
            >
              <Phone />
              <span>{phone}</span>
            </Button>
          )}
          <Button className="hidden md:inline-flex" render={<Link href="/booking-enquiry" />}>
            Book Now
            <ArrowRight />
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  <Brand />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <SheetClose key={link.href} render={<Link href={link.href} />}>
                    <span className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted">
                      {link.title}
                    </span>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-4 flex flex-col gap-2 px-4">
                {phone && (
                  <Button variant="outline" render={<a href={`tel:${phone.replace(/\s/g, "")}`} />}>
                    <Phone />
                    Call Us: {phone}
                  </Button>
                )}
                <Button
                  className="w-full"
                  onClick={() => setOpen(false)}
                  render={<Link href="/booking-enquiry" />}
                >
                  Book Now
                  <ArrowRight />
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
