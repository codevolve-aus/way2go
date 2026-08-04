"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone } from "lucide-react";
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
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
        WZ
      </div>
      <span className="text-base font-semibold tracking-tight">WayZo</span>
    </Link>
  );
}

export function SiteHeader({ phone }: { phone: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6">
        <div className="justify-self-start">
          <Brand />
        </div>

        {phone && (
          <div className="justify-self-center">
            <Button
              size="lg"
              render={<a href={`tel:${phone.replace(/\s/g, "")}`} />}
            >
              <Phone />
              <span className="hidden sm:inline">Call Us: {phone}</span>
              <span className="sm:hidden">Call Us</span>
            </Button>
          </div>
        )}

        <div className="flex items-center justify-self-end gap-4">
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {link.title}
                </Link>
              );
            })}
          </nav>

          <Sheet open={open} onOpenChange={setOpen}>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
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
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
