import { Metadata } from "next";
import {
  CalendarDays,
  Car,
  DollarSign,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
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
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard" };

function fmtAUD(n: number) {
  return n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}
function endOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfLastMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}
function endOfLastMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);
}

const statusBadgeClass: Record<string, string> = {
  CONFIRMED: "border-blue-500/40 text-blue-400",
  ACTIVE:    "border-emerald-500/40 text-emerald-400",
  PENDING:   "border-amber-500/40 text-amber-400",
  COMPLETED: "border-muted-foreground/30 text-muted-foreground",
  CANCELLED: "border-red-500/40 text-red-400",
};

export default async function DashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const lastMonthStart = startOfLastMonth(now);
  const lastMonthEnd = endOfLastMonth(now);

  const [
    activeCount,
    vehicleStats,
    revenueThisMonth,
    revenueLastMonth,
    pendingReturns,
    overdueCount,
    totalCustomers,
    pickupsToday,
    returnsToday,
    recentBookings,
  ] = await Promise.all([
    // Active bookings
    db.booking.count({ where: { status: "ACTIVE" } }),

    // Vehicle availability
    db.vehicle.groupBy({ by: ["status"], _count: { id: true } }),

    // Revenue this month
    db.payment.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: monthStart } },
    }),

    // Revenue last month (for trend)
    db.payment.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),

    // Pending returns (due today or overdue, still ACTIVE)
    db.booking.count({
      where: { status: "ACTIVE", returnDate: { lte: todayEnd } },
    }),

    // Overdue (past return date, still ACTIVE)
    db.booking.count({
      where: { status: "ACTIVE", returnDate: { lt: todayStart } },
    }),

    // Total customers
    db.customer.count({ where: { isBlacklisted: false } }),

    // Today's pickups
    db.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "PENDING"] },
        pickupDate: { gte: todayStart, lte: todayEnd },
      },
      include: { customer: true, vehicle: true },
      orderBy: { pickupDate: "asc" },
    }),

    // Today's returns
    db.booking.findMany({
      where: {
        status: "ACTIVE",
        returnDate: { gte: todayStart, lte: todayEnd },
      },
      include: { customer: true, vehicle: true },
      orderBy: { returnDate: "asc" },
    }),

    // Recent bookings
    db.booking.findMany({
      include: { customer: true, vehicle: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const availableVehicles = vehicleStats.find((s) => s.status === "AVAILABLE")?._count.id ?? 0;
  const totalVehicles = vehicleStats.reduce((sum, s) => sum + s._count.id, 0);
  const maintenanceVehicles = vehicleStats.find((s) => s.status === "MAINTENANCE")?._count.id ?? 0;

  const thisMonthRevenue = revenueThisMonth._sum.amount ?? 0;
  const lastMonthRevenue = revenueLastMonth._sum.amount ?? 0;
  const revenueTrend = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : null;

  const todayFormatted = new Intl.DateTimeFormat("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(now);

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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Active Bookings</CardDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <CalendarDays className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mt-1">
              {activeCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Vehicles currently on rent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Available Vehicles</CardDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Car className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mt-1">
              {availableVehicles} / {totalVehicles}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {maintenanceVehicles > 0 ? `${maintenanceVehicles} in maintenance` : "Fleet ready"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Revenue This Month</CardDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                <DollarSign className="h-4 w-4 text-violet-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mt-1">
              {fmtAUD(thisMonthRevenue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {revenueTrend !== null && revenueTrend > 0 && (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              )}
              {revenueTrend !== null && revenueTrend < 0 && (
                <TrendingDown className="h-3 w-3 text-red-400" />
              )}
              {revenueTrend !== null
                ? `${revenueTrend > 0 ? "+" : ""}${revenueTrend}% vs last month`
                : "No prior month data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Pending Returns</CardDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <ArrowDownLeft className="h-4 w-4 text-amber-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mt-1">
              {pendingReturns}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {overdueCount > 0 && <TrendingDown className="h-3 w-3 text-red-400" />}
              {overdueCount > 0 ? `${overdueCount} overdue` : "All on schedule"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Total Customers</CardDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                <Users className="h-4 w-4 text-cyan-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mt-1">
              {totalCustomers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Pickups Today</CardDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Car className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mt-1">
              {pickupsToday.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Returns Today</CardDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <ArrowDownLeft className="h-4 w-4 text-amber-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mt-1">
              {returnsToday.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Expected today</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity */}
      {(pickupsToday.length > 0 || returnsToday.length > 0) && (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Today&apos;s Activity</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Car className="h-4 w-4 text-blue-500" />
                  Pickups Today
                </CardTitle>
                <CardDescription>{pickupsToday.length} scheduled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-0">
                {pickupsToday.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3">No pickups today</p>
                ) : (
                  pickupsToday.map((b, i) => (
                    <div key={b.id}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">
                            {b.customer.firstName} {b.customer.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {b.vehicle.make} {b.vehicle.model} · {b.vehicle.registrationNo}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-3">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-mono">
                            {b.pickupDate.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      {i < pickupsToday.length - 1 && <Separator />}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <ArrowDownLeft className="h-4 w-4 text-amber-500" />
                  Returns Today
                </CardTitle>
                <CardDescription>{returnsToday.length} expected</CardDescription>
              </CardHeader>
              <CardContent className="space-y-0">
                {returnsToday.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3">No returns today</p>
                ) : (
                  returnsToday.map((b, i) => (
                    <div key={b.id}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">
                            {b.customer.firstName} {b.customer.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {b.vehicle.make} {b.vehicle.model} · {b.vehicle.registrationNo}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-3">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-mono">
                            {b.returnDate.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      {i < returnsToday.length - 1 && <Separator />}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Recent Bookings</h2>
        <Card>
          <CardContent className="p-0">
            {recentBookings.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">No bookings yet. Add your first booking.</p>
              </div>
            ) : (
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
                  {recentBookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {b.bookingNumber}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {b.customer.firstName} {b.customer.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {b.vehicle.make} {b.vehicle.model}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtDate(b.pickupDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtDate(b.returnDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusBadgeClass[b.status] ?? ""}
                        >
                          {b.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
