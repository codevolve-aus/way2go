"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Users,
  CalendarDays,
  FileText,
  DollarSign,
  Calendar,
  Tag,
  AlertTriangle,
  Wrench,
  BarChart3,
  Settings,
  Scale,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarUser } from "@/components/layout/sidebar-user";
import type { Session } from "next-auth";

const navMain = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Bookings", href: "/admin/bookings", icon: CalendarDays },
      { title: "Contracts", href: "/admin/contracts", icon: FileText },
      { title: "Calendar", href: "/admin/calendar", icon: Calendar },
    ],
  },
  {
    label: "Fleet & Customers",
    items: [
      { title: "Fleet", href: "/admin/fleet", icon: Car },
      { title: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Payments", href: "/admin/payments", icon: DollarSign },
      { title: "Pricing", href: "/admin/pricing", icon: Tag },
    ],
  },
  {
    label: "Maintenance",
    items: [
      { title: "Damage & Incidents", href: "/admin/damage", icon: AlertTriangle },
      { title: "Maintenance", href: "/admin/maintenance", icon: Wrench },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Reports", href: "/admin/reports", icon: BarChart3 },
    ],
  },
];

function NavItems() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  function handleNavClick() {
    if (isMobile) setOpenMobile(false);
  }

  return (
    <>
      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} onClick={handleNavClick} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border space-y-1 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/admin/legal" onClick={handleNavClick} />}
              isActive={pathname.startsWith("/admin/legal")}
              tooltip="Legal Pages"
            >
              <Scale className="h-4 w-4" />
              <span>Legal Pages</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/admin/settings" onClick={handleNavClick} />}
              isActive={pathname.startsWith("/admin/settings")}
              tooltip="Settings"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

export function AppSidebar({ user }: { user?: Session["user"] }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
          title="Open customer-facing site in a new tab"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm shrink-0">
            WZ
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-sidebar-foreground">WayZo</p>
            <p className="text-xs text-sidebar-foreground/60">Vehicle Rentals</p>
          </div>
        </Link>
      </SidebarHeader>

      <NavItems />

      <SidebarFooter className="border-t border-sidebar-border pb-2">
        <SidebarUser
          name={user?.name}
          email={user?.email}
          image={user?.image}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
