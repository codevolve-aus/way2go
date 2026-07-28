"use client"

import { useState } from "react"
import {
  DollarSign,
  AlertCircle,
  Clock,
  Receipt,
  Download,
  Send,
  Eye,
  Plus,
} from "lucide-react"
import { toast } from "sonner"

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

type Payment = {
  id: string
  bookingId: string
  customer: string
  amount: number
  type: string
  method: string
  date: string
}

type Invoice = {
  id: string
  bookingId: string
  subtotal: number
  gst: number
  total: number
  status: string
  dueDate: string
}

type Outstanding = {
  bookingId: string
  customer: string
  vehicle: string
  balance: number
  dueDate: string
}

function paymentTypeBadge(type: string) {
  const map: Record<string, string> = {
    DEPOSIT: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    RENTAL_FEE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    DAMAGE_FEE: "bg-red-500/15 text-red-400 border-red-500/30",
    LATE_FEE: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  }
  const label: Record<string, string> = {
    DEPOSIT: "Deposit",
    RENTAL_FEE: "Rental Fee",
    DAMAGE_FEE: "Damage Fee",
    LATE_FEE: "Late Fee",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${map[type] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {label[type] ?? type}
    </span>
  )
}

function methodBadge(method: string) {
  const map: Record<string, string> = {
    CARD: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    CASH: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    BANK_TRANSFER: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  }
  const label: Record<string, string> = {
    CARD: "Card",
    CASH: "Cash",
    BANK_TRANSFER: "Bank Transfer",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${map[method] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {label[method] ?? method}
    </span>
  )
}

function invoiceStatusBadge(status: string) {
  const map: Record<string, string> = {
    PAID: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    OVERDUE: "bg-red-500/15 text-red-400 border-red-500/30",
    SENT: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    DRAFT: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {status}
    </span>
  )
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function fmtCurrency(n: number) {
  return `$${n.toFixed(2)}`
}

const today = "2026-07-28"

const emptyForm = {
  customer: "",
  amount: "",
  method: "CARD",
  reference: "",
  notes: "",
}

interface PaymentsViewProps {
  payments: Payment[]
  invoices: Invoice[]
  outstanding: Outstanding[]
  totalCollected: number
  outstandingBalance: number
  overdueCount: number
}

export function PaymentsView({
  payments,
  invoices,
  outstanding,
  totalCollected,
  outstandingBalance,
  overdueCount,
}: PaymentsViewProps) {
  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const filteredPayments = payments.filter((p) => {
    const matchSearch =
      search.trim() === "" ||
      p.customer.toLowerCase().includes(search.toLowerCase()) ||
      p.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    const matchMethod = methodFilter === "all" || p.method === methodFilter
    return matchSearch && matchMethod
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.success("Payment recorded successfully")
    setOpen(false)
    setForm(emptyForm)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage payments and invoicing</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Collected This Month
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fmtCurrency(totalCollected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Balance
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-400">{fmtCurrency(outstandingBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Invoices
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">All Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4 space-y-4">
          {/* Filter bar for payments tab */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search customer, booking ID..."
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
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        No payments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {p.bookingId}
                        </TableCell>
                        <TableCell className="font-medium">{p.customer}</TableCell>
                        <TableCell className="text-right font-mono">{fmtCurrency(p.amount)}</TableCell>
                        <TableCell>{paymentTypeBadge(p.type)}</TableCell>
                        <TableCell>{methodBadge(p.method)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{fmtDate(p.date)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info(`Viewing receipt for ${p.id}`)}
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

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Booking #</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">GST</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => {
                    const isOverdue = inv.dueDate < today && inv.status !== "PAID"
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {inv.bookingId}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {fmtCurrency(inv.subtotal)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {fmtCurrency(inv.gst)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {fmtCurrency(inv.total)}
                        </TableCell>
                        <TableCell>{invoiceStatusBadge(inv.status)}</TableCell>
                        <TableCell
                          className={`text-sm ${isOverdue ? "text-red-400 font-medium" : "text-muted-foreground"}`}
                        >
                          {fmtDate(inv.dueDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info(`Sending invoice ${inv.id}`)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info(`Downloading invoice ${inv.id}`)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outstanding" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstanding
                    .slice()
                    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                    .map((o) => {
                      const isOverdue = o.dueDate < today
                      return (
                        <TableRow key={o.bookingId}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {o.bookingId}
                          </TableCell>
                          <TableCell className="font-medium">{o.customer}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{o.vehicle}</TableCell>
                          <TableCell className="text-right font-mono font-medium text-red-400">
                            {fmtCurrency(o.balance)}
                          </TableCell>
                          <TableCell
                            className={`text-sm ${isOverdue ? "text-red-400 font-medium" : "text-muted-foreground"}`}
                          >
                            {isOverdue && <AlertCircle className="h-3 w-3 inline mr-1" />}
                            {fmtDate(o.dueDate)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info(`Viewing outstanding for ${o.bookingId}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
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
              <Label>Customer</Label>
              <Input
                value={form.customer}
                onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))}
                placeholder="James Hartley"
                required
              />
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
              <Label>Payment Method</Label>
              <Select
                value={form.method}
                onValueChange={(v) => setForm((f) => ({ ...f, method: v ?? "CARD" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reference</Label>
              <Input
                value={form.reference}
                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                placeholder="BK-1042"
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
              <Button type="submit">Record Payment</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
