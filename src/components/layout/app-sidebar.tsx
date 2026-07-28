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
} from "@/components/ui/sidebar";
import { SidebarUser } from "@/components/layout/sidebar-user";
import type { Session } from "next-auth";

const navMain = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Bookings", href: "/bookings", icon: CalendarDays },
      { title: "Contracts", href: "/contracts", icon: FileText },
      { title: "Calendar", href: "/calendar", icon: Calendar },
    ],
  },
  {
    label: "Fleet & Customers",
    items: [
      { title: "Fleet", href: "/fleet", icon: Car },
      { title: "Customers", href: "/customers", icon: Users },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Payments", href: "/payments", icon: DollarSign },
      { title: "Pricing", href: "/pricing", icon: Tag },
    ],
  },
  {
    label: "Maintenance",
    items: [
      { title: "Damage & Incidents", href: "/damage", icon: AlertTriangle },
      { title: "Maintenance", href: "/maintenance", icon: Wrench },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
];

export function AppSidebar({ user }: { user?: Session["user"] }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm shrink-0">
            W2
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-sidebar-foreground">Way2Go</p>
            <p className="text-xs text-sidebar-foreground/60">Vehicle Rentals</p>
          </div>
        </div>
      </SidebarHeader>

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
                      render={<Link href={item.href} />}
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
              render={<Link href="/settings" />}
              isActive={pathname.startsWith("/settings")}
              tooltip="Settings"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
