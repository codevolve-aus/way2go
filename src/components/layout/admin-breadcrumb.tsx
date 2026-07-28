"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  fleet: "Fleet",
  customers: "Customers",
  bookings: "Bookings",
  contracts: "Contracts",
  calendar: "Calendar",
  pricing: "Pricing",
  payments: "Payments",
  damage: "Damage & Incidents",
  maintenance: "Maintenance",
  reports: "Reports",
  settings: "Settings",
  new: "New",
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          const label = labels[seg] ?? seg;
          const href = "/" + segments.slice(0, i + 1).join("/");

          return (
            <BreadcrumbItem key={href}>
              {isLast ? (
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
