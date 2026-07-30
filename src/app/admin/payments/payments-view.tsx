"use client"

import { useState, useTransition } from "react"
import {
  DollarSign,
  AlertCircle,
  CreditCard,
  Banknote,
  Plus,
  Receipt,
} from "lucide-react"
import { toast } from "sonner"
import type { Payment, Booking, Customer, PaymentType, PaymentMethod } from "@/generated/prisma"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"

import { createPayment } from "./actions"

type PaymentRow = Payment & { booking: Booking & { customer: Customer } }
type BookingOption = Booking & { customer: Customer }

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  DEPOSIT: "Deposit",
  RENTAL_FEE: "Rental Fee",
  EXTRA_CHARGE: "Extra Charge",
  DAMAGE_CHARGE: "Damage Charge",
  FUEL_CHARGE: "Fuel Charge",
  LATE_RETURN: "Late Return",
  REFUND: "Refund",
}

const PAYMENT_TYPE_STYLES: Record<PaymentType, string> = {
  DEPOSIT: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  RENTAL_FEE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  EXTRA_CHARGE: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  DAMAGE_CHARGE: "bg-red-500/15 text-red-400 border-red-500/30",
  FUEL_CHARGE: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  LATE_RETURN: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  REFUND: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  ONLINE: "Online",
}

const PAYMENT_METHOD_STYLES: Record<PaymentMethod, string> = {
  CARD: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  CASH: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  BANK_TRANSFER: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  ONLINE: "bg-teal-500/15 text-teal-400 border-teal-500/30",
}

function TypeBadge({ type }: { type: PaymentType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${PAYMENT_TYPE_STYLES[type]}`}
    >
      {PAYMENT_TYPE_LABELS[type]}
    </span>
  )
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${PAYMENT_METHOD_STYLES[method]}`}
    >
      {PAYMENT_METHOD_LABELS[method]}
    </span>
  )
}

function fmtAUD(amount: number) {
  return amount.toLocaleString("en-AU", { style: "currency", currency: "AUD" })
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })
}

const emptyForm = {
  bookingId: "",
  amount: "",
  type: "RENTAL_FEE" as PaymentType,
  method: "CARD" as PaymentMethod,
  reference: "",
  notes: "",
}

interface PaymentsViewProps {
  payments: PaymentRow[]
  bookings: BookingOption[]
}

export function PaymentsView({ payments, bookings }: PaymentsViewProps) {
  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [isPending, startTransition] = useTransition()

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0)
  const cashCount = payments.filter((p) => p.method === "CASH").length
  const cardCount = payments.filter((p) => p.method === "CARD").length
  const transferCount = payments.filter((p) => p.method === "BANK_TRANSFER").length

  const filtered = payments.filter((p) => {
    const customerName =
      `${p.booking.customer.firstName} ${p.booking.customer.lastName}`.toLowerCase()
    const matchSearch =
      search.trim() === "" ||
      customerName.includes(search.toLowerCase()) ||
      p.booking.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    const matchMethod = methodFilter === "all" || p.method === methodFilter
    const matchType = typeFilter === "all" || p.type === typeFilter
    return matchSearch && matchMethod && matchType
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await createPayment({
          bookingId: form.bookingId,
          amount: parseFloat(form.amount),
          type: form.type,
          method: form.method,
          reference: form.reference || undefined,
          notes: form.notes || undefined,
        })
        toast.success("Payment recorded successfully")
        setOpen(false)
        setForm(emptyForm)
      } catch {
        toast.error("Failed to record payment")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage payments and transactions</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fmtAUD(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Card</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cardCount}</p>
            <p className="text-xs text-muted-foreground">payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cash</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cashCount}</p>
            <p className="text-xs text-muted-foreground">payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bank Transfer
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{transferCount}</p>
            <p className="text-xs text-muted-foreground">payments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">
            All Payments
            <Badge variant="secondary" className="ml-1">{payments.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search customer, booking #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={methodFilter} onValueChange={(v) => setMethodFilter(v ?? "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="ONLINE">Online</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="DEPOSIT">Deposit</SelectItem>
                <SelectItem value="RENTAL_FEE">Rental Fee</SelectItem>
                <SelectItem value="EXTRA_CHARGE">Extra Charge</SelectItem>
                <SelectItem value="DAMAGE_CHARGE">Damage Charge</SelectItem>
                <SelectItem value="FUEL_CHARGE">Fuel Charge</SelectItem>
                <SelectItem value="LATE_RETURN">Late Return</SelectItem>
                <SelectItem value="REFUND">Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        No payments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {p.booking.bookingNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          {p.booking.customer.firstName} {p.booking.customer.lastName}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {fmtAUD(p.amount)}
                        </TableCell>
                        <TableCell>
                          <TypeBadge type={p.type} />
                        </TableCell>
                        <TableCell>
                          <MethodBadge method={p.method} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {fmtDate(p.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info(`Viewing receipt for payment ${p.id}`)}
                          >
                            <Receipt className="h-4 w-4 mr-1" />
                            View Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Payment Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Record Payment</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 px-4">
            <div className="space-y-1.5">
              <Label>Booking</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.bookingId}
                onChange={(e) => setForm((f) => ({ ...f, bookingId: e.target.value }))}
                required
              >
                <option value="">Select booking...</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bookingNumber} - {b.customer.firstName} {b.customer.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (AUD)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="450.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, type: (v ?? "RENTAL_FEE") as PaymentType }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEPOSIT">Deposit</SelectItem>
                  <SelectItem value="RENTAL_FEE">Rental Fee</SelectItem>
                  <SelectItem value="EXTRA_CHARGE">Extra Charge</SelectItem>
                  <SelectItem value="DAMAGE_CHARGE">Damage Charge</SelectItem>
                  <SelectItem value="FUEL_CHARGE">Fuel Charge</SelectItem>
                  <SelectItem value="LATE_RETURN">Late Return</SelectItem>
                  <SelectItem value="REFUND">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select
                value={form.method}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, method: (v ?? "CARD") as PaymentMethod }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reference</Label>
              <Input
                value={form.reference}
                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                placeholder="Optional reference..."
              />
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
                {isPending ? "Recording..." : "Record Payment"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
