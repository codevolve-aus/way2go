import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Car,
  CalendarDays,
  Clock,
  Download,
  TrendingUp,
} from "lucide-react";

export const metadata = { title: "Reports" };

const kpis = {
  totalRevenue: 48750.0,
  fleetUtilisation: 76,
  totalBookings: 134,
  avgRentalDuration: 4.2,
};

const revenueByCategory = [
  { category: "Sedan", revenue: 18200.0 },
  { category: "SUV", revenue: 14800.0 },
  { category: "Ute / Truck", revenue: 9500.0 },
  { category: "Hatchback", revenue: 4950.0 },
  { category: "Van", revenue: 1300.0 },
];

const bookingSources = [
  { source: "Walk-in", count: 42, pct: 31 },
  { source: "Phone", count: 38, pct: 28 },
  { source: "Web", count: 35, pct: 26 },
  { source: "Third-party", count: 19, pct: 14 },
];

const topCustomers = [
  { name: "James Nguyen", bookings: 12, totalSpent: 5840.0 },
  { name: "Sarah Mitchell", bookings: 9, totalSpent: 4200.0 },
  { name: "David Chen", bookings: 8, totalSpent: 3850.0 },
  { name: "Emma Patel", bookings: 7, totalSpent: 3100.0 },
  { name: "Tom Walsh", bookings: 6, totalSpent: 2750.0 },
];

const maxRevenue = Math.max(...revenueByCategory.map((r) => r.revenue));

function fmtCurrency(n: number) {
  return `$${n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analytics and performance overview
          </p>
        </div>
        <Select defaultValue="this-month">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="this-quarter">This Quarter</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
          </SelectContent>
        </Select>
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
            <p className="text-2xl font-bold">
              {fmtCurrency(kpis.totalRevenue)}
            </p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% vs last month
            </p>
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
            <p className="text-2xl font-bold">{kpis.fleetUtilisation}%</p>
            <Progress
              value={kpis.fleetUtilisation}
              className="mt-2 h-1.5"
            />
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
            <p className="text-2xl font-bold">{kpis.totalBookings}</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8 vs last month
            </p>
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
            <p className="text-2xl font-bold">{kpis.avgRentalDuration} days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue by Category */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Revenue by Category
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenueByCategory.map((r) => {
              const pct = Math.round((r.revenue / maxRevenue) * 100);
              return (
                <div key={r.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{r.category}</span>
                    <span className="font-mono text-muted-foreground">
                      {fmtCurrency(r.revenue)}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Booking Sources */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Booking Sources
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {bookingSources.map((s) => (
                <div
                  key={s.source}
                  className="rounded-lg border bg-muted/20 p-4 space-y-1"
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {s.source}
                  </p>
                  <p className="text-2xl font-bold">{s.count}</p>
                  <p className="text-xs text-muted-foreground">{s.pct}% of total</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Top Customers by Revenue
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Rank</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right pr-6">Total Spent</TableHead>
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
                    {fmtCurrency(c.totalSpent)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
