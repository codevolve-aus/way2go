"use client"

import { useEffect, useState, useTransition } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  PenLine,
  X,
  Clock,
  CheckCircle2,
  Car,
  RotateCcw,
  CalendarIcon,
  Mail,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import type { Matcher } from "react-day-picker"
import type { Booking, Customer, Vehicle, BookingStatus, BookingSource } from "@/generated/prisma"

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
import { Separator } from "@/components/ui/separator"
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

import { createBooking, updateBooking, updateBookingStatus, sendContractEmail } from "./actions"
import { getPriceEstimate, type PriceEstimateResult } from "@/lib/pricing-actions"
import { billableDaysBetween } from "@/lib/pricing"

type BookingRow = Booking & { customer: Customer; vehicle: Vehicle }
type CustomerOption = Pick<Customer, "id" | "firstName" | "lastName">
type VehicleOption = Pick<Vehicle, "id" | "make" | "model" | "registrationNo" | "categoryId">

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(amount)
}

function BookingPriceEstimate({ result, isPending }: { result: PriceEstimateResult | null; isPending: boolean }) {
  if (isPending) return <p className="text-sm text-muted-foreground">Calculating price…</p>
  if (!result) return null
  if (!result.ok) return <p className="text-sm text-muted-foreground">{result.error}</p>

  const { breakdown, rateName } = result
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Estimated Price — {rateName}
      </p>
      <div className="flex justify-between text-muted-foreground">
        <span>{breakdown.nights} night{breakdown.nights === 1 ? "" : "s"}</span>
        <span>{formatCurrency(breakdown.baseSubtotal)}</span>
      </div>
      {breakdown.dayOfWeekAdjustment !== 0 && (
        <div
          className={
            breakdown.dayOfWeekAdjustment < 0
              ? "flex justify-between text-green-600 dark:text-green-400"
              : "flex justify-between text-muted-foreground"
          }
        >
          <span>Day-of-week pricing</span>
          <span>
            {breakdown.dayOfWeekAdjustment < 0 ? "-" : "+"}
            {formatCurrency(Math.abs(breakdown.dayOfWeekAdjustment))}
          </span>
        </div>
      )}
      {breakdown.peakSurcharge > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <span>Peak season surcharge</span>
          <span>+{formatCurrency(breakdown.peakSurcharge)}</span>
        </div>
      )}
      {breakdown.lengthOfStayDiscount > 0 && (
        <div className="flex justify-between text-green-600 dark:text-green-400">
          <span>Length-of-stay discount ({breakdown.lengthOfStayDiscountPct}%)</span>
          <span>-{formatCurrency(breakdown.lengthOfStayDiscount)}</span>
        </div>
      )}
      <div className="flex justify-between text-muted-foreground">
        <span>Service fee</span>
        <span>{formatCurrency(breakdown.serviceFee)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Tax</span>
        <span>{formatCurrency(breakdown.taxAmount)}</span>
      </div>
      <Separator className="my-1" />
      <div className="flex justify-between text-base font-semibold text-foreground">
        <span>Estimated Total</span>
        <span>{formatCurrency(breakdown.total)}</span>
      </div>
      {breakdown.belowMinimum && (
        <p className="text-xs text-destructive pt-1">Below the configured minimum rental length.</p>
      )}
    </div>
  )
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
}

const SOURCE_LABELS: Record<BookingSource, string> = {
  WALK_IN: "Walk-in",
  PHONE: "Phone",
  WEB: "Web",
  THIRD_PARTY: "Third Party",
}

function fmtDateTime(d: Date) {
  return d.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getDurationDays(pickup: Date, returnDate: Date): number {
  return billableDaysBetween(pickup, returnDate)
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    PENDING: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-0",
    CONFIRMED: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-0",
    ACTIVE: "bg-green-500/15 text-green-600 dark:text-green-400 border-0",
    COMPLETED: "bg-muted text-muted-foreground border-0",
    CANCELLED: "bg-destructive/10 text-destructive border-0",
    NO_SHOW: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-0",
  }
  return <Badge className={styles[status]}>{STATUS_LABELS[status]}</Badge>
}

function SourceBadge({ source }: { source: BookingSource }) {
  return (
    <Badge variant="outline" className="font-mono text-[10px] tracking-wide">
      {SOURCE_LABELS[source]}
    </Badge>
  )
}

function DatePickerField({
  label,
  value,
  onChange,
  bookedRanges = [],
  minDate,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  bookedRanges?: { from: Date; to: Date }[]
  minDate?: Date
  required?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(value + "T12:00:00") : undefined

  function handleSelect(date: Date | undefined) {
    if (!date) return
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    onChange(`${y}-${m}-${d}`)
    setOpen(false)
  }

  const disabledMatchers: Matcher[] = [
    ...bookedRanges,
    ...(minDate ? [{ before: minDate } as Matcher] : []),
  ]

  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Popover open={open} onOpenChange={(o) => setOpen(o)}>
        <PopoverTrigger
          render={
            <Button variant="outline" className="w-full justify-start font-normal">
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              {selected ? (
                format(selected, "dd MMM yyyy")
              ) : (
                <span className="text-muted-foreground">Pick a date</span>
              )}
            </Button>
          }
        />
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={disabledMatchers.length ? disabledMatchers : undefined}
            modifiers={bookedRanges.length ? { booked: bookedRanges } : undefined}
            modifiersClassNames={{ booked: "line-through opacity-50" }}
            defaultMonth={selected ?? new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function BookingActionsMenu({
  booking,
  onEdit,
  onConfirm,
  onCancel,
  onSendContract,
  isSending,
}: {
  booking: BookingRow
  onEdit: () => void
  onConfirm: () => void
  onCancel: () => void
  onSendContract: () => void
  isSending: boolean
}) {
  const [cancelOpen, setCancelOpen] = useState(false)

  return (
    <>
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
          <DropdownMenuItem onClick={() => toast.info(`Viewing booking ${booking.bookingNumber}`)}>
            <Eye className="h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTimeout(onEdit, 0)}>
            <PenLine className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          {booking.status === "PENDING" && (
            <DropdownMenuItem onClick={onConfirm}>
              <CheckCircle2 className="h-4 w-4" />
              Confirm
            </DropdownMenuItem>
          )}
          {booking.status === "CONFIRMED" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSendContract} disabled={isSending}>
                <Mail className="h-4 w-4" />
                {isSending ? "Sending…" : "Send Contract Email"}
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setTimeout(() => setCancelOpen(true), 0)}
          >
            <X className="h-4 w-4" />
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Booking {booking.bookingNumber} for {booking.customer.firstName}{" "}
              {booking.customer.lastName} will be cancelled. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => { onCancel(); setCancelOpen(false) }}
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function BookingsTable({
  rows,
  onEdit,
  onConfirm,
  onCancel,
  onSendContract,
  sendingId,
}: {
  rows: BookingRow[]
  onEdit: (booking: BookingRow) => void
  onConfirm: (id: string) => void
  onCancel: (id: string) => void
  onSendContract: (id: string) => void
  sendingId: string | null
}) {
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
                <span className="font-mono text-xs text-foreground">{booking.bookingNumber}</span>
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {booking.customer.firstName} {booking.customer.lastName}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-[200px] truncate">
                {booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.registrationNo})
              </TableCell>
              <TableCell className="text-muted-foreground">{fmtDateTime(booking.pickupDate)}</TableCell>
              <TableCell className="text-muted-foreground">{fmtDateTime(booking.returnDate)}</TableCell>
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
                <BookingActionsMenu
                  booking={booking}
                  onEdit={() => onEdit(booking)}
                  onConfirm={() => onConfirm(booking.id)}
                  onCancel={() => onCancel(booking.id)}
                  onSendContract={() => onSendContract(booking.id)}
                  isSending={sendingId === booking.id}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

const tabFilters: Record<string, (b: BookingRow) => boolean> = {
  all: () => true,
  active: (b) => b.status === "ACTIVE",
  upcoming: (b) => b.status === "PENDING" || b.status === "CONFIRMED",
  completed: (b) => b.status === "COMPLETED",
  cancelled: (b) => b.status === "CANCELLED",
}

const emptyForm = {
  customerId: "",
  vehicleId: "",
  pickupDate: "",
  pickupTime: "10:00",
  returnDate: "",
  returnTime: "10:00",
  pickupLocation: "",
  source: "WALK_IN" as BookingSource,
  notes: "",
}

interface BookingsViewProps {
  bookings: BookingRow[]
  customers: CustomerOption[]
  vehicles: VehicleOption[]
}

export function BookingsView({ bookings, customers, vehicles }: BookingsViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all-status")
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isPending, startTransition] = useTransition()
  const [estimate, setEstimate] = useState<PriceEstimateResult | null>(null)
  const [isEstimating, startEstimateTransition] = useTransition()
  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId)
  const canEstimate = Boolean(selectedVehicle && form.pickupDate && form.returnDate)

  useEffect(() => {
    if (!canEstimate || !selectedVehicle) return
    const handle = setTimeout(() => {
      startEstimateTransition(async () => {
        const result = await getPriceEstimate({
          categoryId: selectedVehicle.categoryId,
          pickupDate: form.pickupDate,
          pickupTime: form.pickupTime,
          returnDate: form.returnDate,
          returnTime: form.returnTime,
        })
        setEstimate(result)
      })
    }, 350)
    return () => clearTimeout(handle)
  }, [canEstimate, selectedVehicle, form.pickupDate, form.pickupTime, form.returnDate, form.returnTime])

  const today = new Date().toDateString()
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length
  const activeCount = bookings.filter((b) => b.status === "ACTIVE").length
  const todaysReturns = bookings.filter(
    (b) =>
      b.returnDate.toDateString() === today &&
      (b.status === "ACTIVE" || b.status === "CONFIRMED")
  ).length

  const filtered = bookings.filter((b) => {
    const customerName = `${b.customer.firstName} ${b.customer.lastName}`.toLowerCase()
    const vehicleLabel =
      `${b.vehicle.make} ${b.vehicle.model} ${b.vehicle.registrationNo}`.toLowerCase()
    const matchSearch =
      search.trim() === "" ||
      b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      customerName.includes(search.toLowerCase()) ||
      vehicleLabel.includes(search.toLowerCase())
    const matchStatus =
      statusFilter === "all-status" || b.status.toLowerCase() === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  function toDateInput(d: Date | string): string {
    const date = d instanceof Date ? d : new Date(d)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  }

  function toTimeInput(d: Date | string): string {
    const date = d instanceof Date ? d : new Date(d)
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(booking: BookingRow) {
    setEditingId(booking.id)
    setForm({
      customerId: booking.customerId,
      vehicleId: booking.vehicleId,
      pickupDate: toDateInput(booking.pickupDate),
      pickupTime: toTimeInput(booking.pickupDate),
      returnDate: toDateInput(booking.returnDate),
      returnTime: toTimeInput(booking.returnDate),
      pickupLocation: booking.pickupLocation,
      source: booking.source,
      notes: booking.notes ?? "",
    })
    setOpen(true)
  }

  function handleConfirm(id: string) {
    startTransition(async () => {
      try {
        await updateBookingStatus(id, "CONFIRMED")
        toast.success("Booking confirmed")
      } catch {
        toast.error("Failed to confirm booking")
      }
    })
  }

  function handleSendContract(id: string) {
    setSendingId(id)
    sendContractEmail(id).then(({ error }) => {
      setSendingId(null)
      if (error) {
        toast.error(error)
      } else {
        toast.success("Contract email sent to customer")
      }
    })
  }

  function handleCancel(id: string) {
    startTransition(async () => {
      try {
        await updateBookingStatus(id, "CANCELLED")
        toast.success("Booking cancelled")
      } catch {
        toast.error("Failed to cancel booking")
      }
    })
  }

  const bookedRanges = form.vehicleId
    ? bookings
        .filter(
          (b) =>
            b.vehicleId === form.vehicleId &&
            (b.status === "CONFIRMED" || b.status === "ACTIVE" || b.status === "PENDING") &&
            b.id !== editingId
        )
        .map((b) => ({ from: b.pickupDate, to: b.returnDate }))
    : []

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.pickupDate || !form.returnDate) {
      toast.error("Please select pickup and return dates")
      return
    }
    const pickupDt = new Date(`${form.pickupDate}T${form.pickupTime}:00`)
    const returnDt = new Date(`${form.returnDate}T${form.returnTime}:00`)
    if (returnDt <= pickupDt) {
      toast.error("Return must be after pickup")
      return
    }
    const payload = {
      customerId: form.customerId,
      vehicleId: form.vehicleId,
      pickupDate: form.pickupDate,
      pickupTime: form.pickupTime,
      returnDate: form.returnDate,
      returnTime: form.returnTime,
      pickupLocation: form.pickupLocation,
      source: form.source,
      notes: form.notes || undefined,
    }
    startTransition(async () => {
      try {
        if (editingId) {
          await updateBooking(editingId, payload)
          toast.success("Booking updated successfully")
        } else {
          await createBooking(payload)
          toast.success("Booking created successfully")
        }
        setOpen(false)
        setForm(emptyForm)
      } catch {
        toast.error(editingId ? "Failed to update booking" : "Failed to create booking")
      }
    })
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
        <Button onClick={openAdd}>
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
        <Select
          items={[
            { value: "all-status", label: "All Statuses" },
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all-status")}
        >
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
                    {filtered.length}
                  </Badge>
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
                <BookingsTable
                  rows={filtered.filter(tabFilters[tab])}
                  onEdit={openEdit}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                  onSendContract={handleSendContract}
                  sendingId={sendingId}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* New Booking Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit Booking" : "New Booking"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 px-4">
            <div className="space-y-1.5">
              <Label>Customer</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.customerId}
                onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}
                required
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.vehicleId}
                onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
                required
              >
                <option value="">Select vehicle...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.registrationNo})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DatePickerField
                label="Pickup Date"
                value={form.pickupDate}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    pickupDate: v,
                    returnDate: f.returnDate && f.returnDate < v ? "" : f.returnDate,
                  }))
                }
                bookedRanges={bookedRanges}
                required
              />
              <div className="space-y-1.5">
                <Label>
                  Pickup Time<span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                  type="time"
                  value={form.pickupTime}
                  onChange={(e) => setForm((f) => ({ ...f, pickupTime: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DatePickerField
                label="Return Date"
                value={form.returnDate}
                onChange={(v) => setForm((f) => ({ ...f, returnDate: v }))}
                bookedRanges={bookedRanges}
                minDate={
                  form.pickupDate ? new Date(form.pickupDate + "T12:00:00") : undefined
                }
                required
              />
              <div className="space-y-1.5">
                <Label>
                  Return Time<span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                  type="time"
                  value={form.returnTime}
                  onChange={(e) => setForm((f) => ({ ...f, returnTime: e.target.value }))}
                  required
                />
              </div>
            </div>
            {canEstimate && <BookingPriceEstimate result={estimate} isPending={isEstimating} />}
            <div className="space-y-1.5">
              <Label>Pickup Location</Label>
              <Input
                value={form.pickupLocation}
                onChange={(e) => setForm((f) => ({ ...f, pickupLocation: e.target.value }))}
                placeholder="e.g. Melbourne CBD"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select
                items={Object.entries(SOURCE_LABELS).map(([value, label]) => ({ value, label }))}
                value={form.source}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, source: (v ?? "WALK_IN") as BookingSource }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WALK_IN">Walk-in</SelectItem>
                  <SelectItem value="PHONE">Phone</SelectItem>
                  <SelectItem value="WEB">Web</SelectItem>
                  <SelectItem value="THIRD_PARTY">Third Party</SelectItem>
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
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? editingId ? "Saving..." : "Creating..."
                  : editingId ? "Save Changes" : "Create Booking"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
