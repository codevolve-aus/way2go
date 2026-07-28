"use client"

import { useState } from "react"
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
import { toast } from "sonner"

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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
    Pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-0",
    Confirmed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-0",
    Active: "bg-green-500/15 text-green-600 dark:text-green-400 border-0",
    Completed: "bg-muted text-muted-foreground border-0",
    Cancelled: "bg-destructive/10 text-destructive border-0",
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

function BookingActionsMenu({ booking }: { booking: Booking }) {
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
        <DropdownMenuItem onSelect={() => toast.info(`Viewing booking ${booking.id}`)}>
          <Eye className="h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info(`Editing booking ${booking.id}`)}>
          <PenLine className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info(`Generating contract for ${booking.id}`)}>
          <FileText className="h-4 w-4" />
          Generate Contract
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <X className="h-4 w-4" />
                Cancel
              </DropdownMenuItem>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
              <AlertDialogDescription>
                Booking {booking.id} for {booking.customer} will be cancelled. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => toast.success(`Booking ${booking.id} cancelled`)}
              >
                Yes, Cancel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
            <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
              No bookings found.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="pl-4">
                <span className="font-mono text-xs text-foreground">{booking.id}</span>
              </TableCell>
              <TableCell className="font-medium text-foreground">{booking.customer}</TableCell>
              <TableCell className="text-muted-foreground max-w-[200px] truncate">{booking.vehicle}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(booking.pickupDate)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(booking.returnDate)}</TableCell>
              <TableCell className="text-muted-foreground">
                {getDurationDays(booking.pickupDate, booking.returnDate)}d
              </TableCell>
              <TableCell><StatusBadge status={booking.status} /></TableCell>
              <TableCell><SourceBadge source={booking.source} /></TableCell>
              <TableCell className="pr-4 text-right">
                <BookingActionsMenu booking={booking} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

const tabFilters: Record<string, (b: Booking) => boolean> = {
  all: () => true,
  active: (b) => b.status === "Active",
  upcoming: (b) => b.status === "Pending" || b.status === "Confirmed",
  completed: (b) => b.status === "Completed",
  cancelled: (b) => b.status === "Cancelled",
}

const emptyForm = {
  customerName: "",
  vehicle: "",
  pickupDate: "",
  returnDate: "",
  source: "WALK_IN" as BookingSource,
  notes: "",
}

interface BookingsViewProps {
  bookings: Booking[]
  pendingCount: number
  confirmedCount: number
  activeCount: number
  todaysReturns: number
}

export function BookingsView({
  bookings,
  pendingCount,
  confirmedCount,
  activeCount,
  todaysReturns,
}: BookingsViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all-status")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const filtered = bookings.filter((b) => {
    const matchSearch =
      search.trim() === "" ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      statusFilter === "all-status" ||
      b.status.toLowerCase() === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.success("Booking created successfully")
    setOpen(false)
    setForm(emptyForm)
  }

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
        <Button onClick={() => setOpen(true)}>
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
            <span className="text-3xl font-bold text-yellow-500">{pendingCount}</span>
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
            <span className="text-3xl font-bold text-blue-500">{confirmedCount}</span>
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
            <span className="text-3xl font-bold text-green-500">{activeCount}</span>
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
            <span className="text-3xl font-bold text-foreground">{todaysReturns}</span>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all-status")}>
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
                  <Badge variant="secondary" className="ml-1">{filtered.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active
                  <Badge variant="secondary" className="ml-1">
                    {filtered.filter(tabFilters.active).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  Upcoming
                  <Badge variant="secondary" className="ml-1">
                    {filtered.filter(tabFilters.upcoming).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </div>
            {(["all", "active", "upcoming", "completed", "cancelled"] as const).map((tab) => (
              <TabsContent key={tab} value={tab}>
                <BookingsTable rows={filtered.filter(tabFilters[tab])} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* New Booking Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New Booking</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 px-4">
            <div className="space-y-1.5">
              <Label>Customer Name</Label>
              <Input
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                placeholder="James Hartley"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle</Label>
              <Input
                value={form.vehicle}
                onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))}
                placeholder="Toyota HiLux SR5 (GHB-123)"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Pickup Date</Label>
              <Input
                type="date"
                value={form.pickupDate}
                onChange={(e) => setForm((f) => ({ ...f, pickupDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Return Date</Label>
              <Input
                type="date"
                value={form.returnDate}
                onChange={(e) => setForm((f) => ({ ...f, returnDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select
                value={form.source}
                onValueChange={(v) => setForm((f) => ({ ...f, source: (v ?? "WALK_IN") as BookingSource }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WALK_IN">Walk-in</SelectItem>
                  <SelectItem value="PHONE">Phone</SelectItem>
                  <SelectItem value="WEB">Web</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes..."
                rows={3}
              />
            </div>
            <SheetFooter className="px-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Booking</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
