import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DollarSign,
  Car,
  CalendarDays,
  Clock,
} from "lucide-react"
import { db } from "@/lib/db"

export const metadata = { title: "Reports" }

function fmtAUD(n: number) {
  return n.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  })
}

export default async function ReportsPage() {
  const [
    totalPaymentsAgg,
    bookings,
    vehicles,
    bookingsBySource,
    topCustomersRaw,
  ] = await Promise.all([
    // Sum of all recorded payments
    db.payment.aggregate({ _sum: { amount: true } }),

    // All bookings with vehicle category and duration
    db.booking.findMany({
      where: { status: { notIn: ["CANCELLED"] } },
      include: { vehicle: { include: { category: true } }, payments: true },
    }),

    // All vehicles for utilisation
    db.vehicle.findMany({ select: { status: true } }),

    // Booking counts by source
    db.booking.groupBy({
      by: ["source"],
      where: { status: { notIn: ["CANCELLED"] } },
      _count: { id: true },
    }),

    // Top customers by booking count + payments
    db.customer.findMany({
      where: { bookings: { some: { status: { notIn: ["CANCELLED"] } } } },
      include: {
        bookings: {
          where: { status: { notIn: ["CANCELLED"] } },
          include: { payments: true },
        },
      },
    }),
  ])

  // ── KPIs ──────────────────────────────────────────────────────────────────

  const totalRevenue = totalPaymentsAgg._sum.amount ?? 0

  const activeOrBooked = vehicles.filter(
    (v) => v.status === "BOOKED" || v.status === "MAINTENANCE"
  ).length
  const fleetUtilisation =
    vehicles.length > 0 ? Math.round((activeOrBooked / vehicles.length) * 100) : 0

  const totalBookings = bookings.length

  const durationsWithDays = bookings.map((b) => {
    const days =
      Math.round(
        (b.returnDate.getTime() - b.pickupDate.getTime()) / 86400000
      ) + 1
    return days
  })
  const avgDuration =
    durationsWithDays.length > 0
      ? +(
          durationsWithDays.reduce((a, b) => a + b, 0) /
          durationsWithDays.length
        ).toFixed(1)
      : 0

  // ── Revenue by Vehicle Category ───────────────────────────────────────────

  const categoryMap: Record<string, number> = {}
  for (const b of bookings) {
    const cat = b.vehicle.category.name
    const paid = b.payments.reduce((s, p) => s + p.amount, 0)
    categoryMap[cat] = (categoryMap[cat] ?? 0) + paid
  }
  const revenueByCategory = Object.entries(categoryMap)
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
  const maxRevenue = revenueByCategory[0]?.revenue ?? 1

  // ── Booking Sources ───────────────────────────────────────────────────────

  const sourceTotal = bookingsBySource.reduce((s, r) => s + r._count.id, 0)
  const SOURCE_LABEL: Record<string, string> = {
    WALK_IN: "Walk-in",
    PHONE: "Phone",
    WEB: "Web",
    THIRD_PARTY: "Third Party",
  }
  const bookingSourceRows = bookingsBySource
    .map((r) => ({
      source: SOURCE_LABEL[r.source] ?? r.source,
      count: r._count.id,
      pct: sourceTotal > 0 ? Math.round((r._count.id / sourceTotal) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // ── Top Customers ─────────────────────────────────────────────────────────

  const topCustomers = topCustomersRaw
    .map((c) => ({
      name: `${c.firstName} ${c.lastName}`,
      bookings: c.bookings.length,
      totalSpent: c.bookings.reduce(
        (s, b) => s + b.payments.reduce((ps, p) => ps + p.amount, 0),
        0
      ),
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent || b.bookings - a.bookings)
    .slice(0, 10)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analytics and performance overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fmtAUD(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">All time, from payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fleet Utilisation
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fleetUtilisation}%</p>
            <Progress value={fleetUtilisation} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalBookings}</p>
            <p className="text-xs text-muted-foreground mt-1">Excluding cancelled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Rental Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgDuration} days</p>
            <p className="text-xs text-muted-foreground mt-1">Across all bookings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Revenue by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No payment data recorded yet.
              </p>
            ) : (
              <div className="space-y-4">
                {revenueByCategory.map((r) => (
                  <div key={r.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{r.category}</span>
                      <span className="font-mono text-muted-foreground">
                        {fmtAUD(r.revenue)}
                      </span>
                    </div>
                    <Progress
                      value={Math.round((r.revenue / maxRevenue) * 100)}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Booking Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingSourceRows.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No bookings recorded yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {bookingSourceRows.map((s) => (
                  <div
                    key={s.source}
                    className="rounded-lg border bg-muted/20 p-4 space-y-1"
                  >
                    <p className="text-sm font-medium text-muted-foreground">
                      {s.source}
                    </p>
                    <p className="text-2xl font-bold">{s.count}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.pct}% of total
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Top Customers by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topCustomers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No customer data yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Rank</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right pr-6">Total Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((c, i) => (
                  <TableRow key={c.name}>
                    <TableCell className="pl-6">
                      <span className="text-muted-foreground font-mono text-sm">
                        #{i + 1}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {c.bookings}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium pr-6">
                      {fmtAUD(c.totalSpent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
