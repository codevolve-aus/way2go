import { Metadata } from "next"
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  PenLine,
  FileText,
  X,
  Clock,
  CheckCircle2,
  Car,
  RotateCcw,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = { title: "Bookings" }

type BookingStatus = "Pending" | "Confirmed" | "Active" | "Completed" | "Cancelled"
type BookingSource = "WALK_IN" | "PHONE" | "WEB"

interface Booking {
  id: string
  customer: string
  vehicle: string
  pickupDate: string
  returnDate: string
  status: BookingStatus
  source: BookingSource
}

const bookings: Booking[] = [
  {
    id: "BK-2026-0081",
    customer: "James Hartley",
    vehicle: "Toyota HiLux SR5 (GHB-123)",
    pickupDate: "2026-07-28",
    returnDate: "2026-08-04",
    status: "Active",
    source: "WALK_IN",
  },
  {
    id: "BK-2026-0082",
    customer: "Priya Sharma",
    vehicle: "Kia Carnival S (TLP-445)",
    pickupDate: "2026-07-30",
    returnDate: "2026-08-06",
    status: "Confirmed",
    source: "WEB",
  },
  {
    id: "BK-2026-0083",
    customer: "Sophie Nguyen",
    vehicle: "Hyundai Tucson Elite (MRK-889)",
    pickupDate: "2026-08-01",
    returnDate: "2026-08-08",
    status: "Confirmed",
    source: "PHONE",
  },
  {
    id: "BK-2026-0084",
    customer: "Dylan Matthews",
    vehicle: "Ford Ranger XLT (PQR-776)",
    pickupDate: "2026-08-05",
    returnDate: "2026-08-07",
    status: "Pending",
    source: "WEB",
  },
  {
    id: "BK-2026-0085",
    customer: "Caitlin Walsh",
    vehicle: "Mercedes-Benz C200 (STU-321)",
    pickupDate: "2026-08-10",
    returnDate: "2026-08-17",
    status: "Pending",
    source: "PHONE",
  },
  {
    id: "BK-2026-0079",
    customer: "Lachlan O'Brien",
    vehicle: "Mitsubishi Outlander LS (VWX-654)",
    pickupDate: "2026-07-18",
    returnDate: "2026-07-25",
    status: "Completed",
    source: "WALK_IN",
  },
  {
    id: "BK-2026-0077",
    customer: "James Hartley",
    vehicle: "Nissan Navara ST (YZA-987)",
    pickupDate: "2026-07-10",
    returnDate: "2026-07-14",
    status: "Completed",
    source: "WEB",
  },
  {
    id: "BK-2026-0080",
    customer: "Sophie Nguyen",
    vehicle: "Toyota Camry Ascent (BCD-111)",
    pickupDate: "2026-07-22",
    returnDate: "2026-07-28",
    status: "Cancelled",
    source: "PHONE",
  },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getDurationDays(pickup: string, returnDate: string): number {
  const a = new Date(pickup)
  const b = new Date(returnDate)
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    Pending:
      "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-0",
    Confirmed:
      "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-0",
    Active:
      "bg-green-500/15 text-green-600 dark:text-green-400 border-0",
    Completed:
      "bg-muted text-muted-foreground border-0",
    Cancelled:
      "bg-destructive/10 text-destructive border-0",
  }
  return <Badge className={styles[status]}>{status}</Badge>
}

function SourceBadge({ source }: { source: BookingSource }) {
  const labels: Record<BookingSource, string> = {
    WALK_IN: "Walk-in",
    PHONE: "Phone",
    WEB: "Web",
  }
  return (
    <Badge variant="outline" className="font-mono text-[10px] tracking-wide">
      {labels[source]}
    </Badge>
  )
}

function BookingActionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Eye className="h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem>
          <PenLine className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileText className="h-4 w-4" />
          Generate Contract
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <X className="h-4 w-4" />
          Cancel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function BookingsTable({ rows }: { rows: Booking[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Booking #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>Pickup Date</TableHead>
          <TableHead>Return Date</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="pr-4 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={9}
              className="text-center py-10 text-muted-foreground"
            >
              No bookings found.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="pl-4">
                <span className="font-mono text-xs text-foreground">
                  {booking.id}
                </span>
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {booking.customer}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-[200px] truncate">
                {booking.vehicle}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(booking.pickupDate)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(booking.returnDate)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {getDurationDays(booking.pickupDate, booking.returnDate)}d
              </TableCell>
              <TableCell>
                <StatusBadge status={booking.status} />
              </TableCell>
              <TableCell>
                <SourceBadge source={booking.source} />
              </TableCell>
              <TableCell className="pr-4 text-right">
                <BookingActionsMenu />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

const today = "2026-07-28"

const pendingCount = bookings.filter((b) => b.status === "Pending").length
const confirmedCount = bookings.filter((b) => b.status === "Confirmed").length
const activeCount = bookings.filter((b) => b.status === "Active").length
const todaysReturns = bookings.filter(
  (b) => b.returnDate === today && (b.status === "Active" || b.status === "Confirmed")
).length

const tabFilters: Record<string, (b: Booking) => boolean> = {
  all: () => true,
  active: (b) => b.status === "Active",
  upcoming: (b) => b.status === "Pending" || b.status === "Confirmed",
  completed: (b) => b.status === "Completed",
  cancelled: (b) => b.status === "Cancelled",
}

export default function BookingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage all vehicle rental bookings
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-yellow-500">
              {pendingCount}
            </span>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
              <CheckCircle2 className="h-4 w-4" />
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-blue-500">
              {confirmedCount}
            </span>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
              <Car className="h-4 w-4" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">
              {activeCount}
            </span>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
              <RotateCcw className="h-4 w-4" />
              Today&apos;s Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-foreground">
              {todaysReturns}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search bookings, customers..."
            className="pl-8"
          />
        </div>

        <Select defaultValue="all-status">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground hidden sm:block">
          Date range: Jul 2026 – Aug 2026
        </span>
      </div>

      {/* Tabs + Table */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all">
            <div className="px-4 pt-4 border-b border-border">
              <TabsList variant="line">
                <TabsTrigger value="all">
                  All
                  <Badge variant="secondary" className="ml-1">
                    {bookings.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active
                  <Badge variant="secondary" className="ml-1">
                    {activeCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  Upcoming
                  <Badge variant="secondary" className="ml-1">
                    {pendingCount + confirmedCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </div>

            {(["all", "active", "upcoming", "completed", "cancelled"] as const).map(
              (tab) => (
                <TabsContent key={tab} value={tab}>
                  <BookingsTable rows={bookings.filter(tabFilters[tab])} />
                </TabsContent>
              )
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
