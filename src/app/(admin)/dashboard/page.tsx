import { Metadata } from "next";
import {
  CalendarDays,
  Car,
  DollarSign,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Dashboard" };

type BookingStatus = "CONFIRMED" | "ACTIVE" | "PENDING" | "COMPLETED";

const statCards = [
  {
    title: "Active Bookings",
    value: "24",
    trend: "+3 since yesterday",
    trendUp: true,
    icon: CalendarDays,
    iconClass: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    title: "Available Vehicles",
    value: "18 / 42",
    trend: "7 out for service",
    trendUp: null,
    icon: Car,
    iconClass: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
  {
    title: "Revenue This Month",
    value: "$48,320",
    trend: "+12% vs last month",
    trendUp: true,
    icon: DollarSign,
    iconClass: "text-violet-500",
    iconBg: "bg-violet-500/10",
  },
  {
    title: "Pending Returns",
    value: "6",
    trend: "2 overdue",
    trendUp: false,
    icon: ArrowDownLeft,
    iconClass: "text-amber-500",
    iconBg: "bg-amber-500/10",
  },
];

const pickupsToday = [
  { id: "BK-1041", customer: "Liam Nguyen", vehicle: "Toyota RAV4 2024", time: "08:30 AM" },
  { id: "BK-1044", customer: "Sarah Mitchell", vehicle: "Hyundai Tucson 2023", time: "11:00 AM" },
  { id: "BK-1047", customer: "James Okafor", vehicle: "Ford Ranger 2024", time: "02:15 PM" },
];

const returnsToday = [
  { id: "BK-1028", customer: "Emma Svensson", vehicle: "Mazda CX-5 2023", time: "09:00 AM" },
  { id: "BK-1031", customer: "Daniel Tremblay", vehicle: "Kia Sportage 2024", time: "12:30 PM" },
  { id: "BK-1035", customer: "Priya Sharma", vehicle: "Subaru Forester 2023", time: "04:00 PM" },
];

const recentBookings: {
  id: string;
  customer: string;
  vehicle: string;
  pickup: string;
  return: string;
  status: BookingStatus;
}[] = [
  { id: "BK-1047", customer: "James Okafor", vehicle: "Ford Ranger 2024", pickup: "28 Jul 2026", return: "2 Aug 2026", status: "CONFIRMED" },
  { id: "BK-1046", customer: "Chloe Barker", vehicle: "Toyota Camry 2024", pickup: "27 Jul 2026", return: "30 Jul 2026", status: "ACTIVE" },
  { id: "BK-1045", customer: "Noah Pham", vehicle: "Honda CR-V 2023", pickup: "26 Jul 2026", return: "29 Jul 2026", status: "ACTIVE" },
  { id: "BK-1044", customer: "Sarah Mitchell", vehicle: "Hyundai Tucson 2023", pickup: "28 Jul 2026", return: "5 Aug 2026", status: "PENDING" },
  { id: "BK-1043", customer: "Marcus Webb", vehicle: "Nissan X-Trail 2024", pickup: "22 Jul 2026", return: "27 Jul 2026", status: "COMPLETED" },
];

const statusBadgeClass: Record<BookingStatus, string> = {
  CONFIRMED: "border-blue-500/40 text-blue-400",
  ACTIVE: "border-emerald-500/40 text-emerald-400",
  PENDING: "border-amber-500/40 text-amber-400",
  COMPLETED: "border-muted-foreground/30 text-muted-foreground",
};

const todayFormatted = new Intl.DateTimeFormat("en-AU", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date("2026-07-28"));

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{todayFormatted}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>{card.title}</CardDescription>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
                    <Icon className={`h-4 w-4 ${card.iconClass}`} />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mt-1">
                  {card.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  {card.trendUp === true && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                  {card.trendUp === false && <TrendingDown className="h-3 w-3 text-red-400" />}
                  {card.trend}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Activity */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Today&apos;s Activity</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Pickups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Car className="h-4 w-4 text-blue-500" />
                Pickups Today
              </CardTitle>
              <CardDescription>{pickupsToday.length} scheduled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              {pickupsToday.map((item, i) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">
                        {item.customer}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.vehicle}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                  </div>
                  {i < pickupsToday.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Returns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <ArrowDownLeft className="h-4 w-4 text-amber-500" />
                Returns Today
              </CardTitle>
              <CardDescription>{returnsToday.length} expected</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              {returnsToday.map((item, i) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">
                        {item.customer}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.vehicle}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                  </div>
                  {i < returnsToday.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Recent Bookings</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Return</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {booking.id}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {booking.customer}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.vehicle}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.pickup}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.return}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusBadgeClass[booking.status]}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
