"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Eye,
  RefreshCw,
  FileText,
  Plus,
  X,
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

type DamageReport = {
  id: string
  vehicle: string
  customer: string
  contract: string
  description: string
  fault: string
  repairCost: number
  status: string
  created: string
}

function faultBadge(fault: string) {
  const styles: Record<string, string> = {
    CUSTOMER: "bg-red-500/15 text-red-400 border-red-500/30",
    THIRD_PARTY: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    NO_FAULT: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  }
  const labels: Record<string, string> = {
    CUSTOMER: "Customer",
    THIRD_PARTY: "Third Party",
    NO_FAULT: "No Fault",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[fault] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {labels[fault] ?? fault}
    </span>
  )
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    REPORTED: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    ASSESSED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    REPAIR_IN_PROGRESS: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    REPAIRED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    RESOLVED: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  }
  const labels: Record<string, string> = {
    REPORTED: "Reported",
    ASSESSED: "Assessed",
    REPAIR_IN_PROGRESS: "In Repair",
    REPAIRED: "Repaired",
    RESOLVED: "Resolved",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {labels[status] ?? status}
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

const emptyForm = {
  bookingRef: "",
  vehicle: "",
  description: "",
  severity: "MINOR",
  repairCost: "",
}

interface DamageViewProps {
  damageReports: DamageReport[]
  openReports: number
  underRepair: number
  insuranceClaims: number
  resolvedThisMonth: number
}

export function DamageView({
  damageReports,
  openReports,
  underRepair,
  insuranceClaims,
  resolvedThisMonth,
}: DamageViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [faultFilter, setFaultFilter] = useState("all")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const filtered = damageReports.filter((r) => {
    const matchSearch =
      search.trim() === "" ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.contract.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || r.status === statusFilter
    const matchFault = faultFilter === "all" || r.fault === faultFilter
    return matchSearch && matchStatus && matchFault
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.success("Damage report created successfully")
    setOpen(false)
    setForm(emptyForm)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Damage &amp; Incidents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage vehicle damage reports and incident claims
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{openReports}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Under Repair</CardTitle>
            <Wrench className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-400">{underRepair}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Insurance Claims</CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-400">{insuranceClaims}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved This Month
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-400">{resolvedThisMonth}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search reports, vehicle, customer..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="REPORTED">Reported</SelectItem>
            <SelectItem value="ASSESSED">Assessed</SelectItem>
            <SelectItem value="REPAIR_IN_PROGRESS">In Repair</SelectItem>
            <SelectItem value="REPAIRED">Repaired</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={faultFilter} onValueChange={(v) => setFaultFilter(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Fault Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fault Types</SelectItem>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
            <SelectItem value="THIRD_PARTY">Third Party</SelectItem>
            <SelectItem value="NO_FAULT">No Fault</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report #</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Customer / Contract</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Fault</TableHead>
                <TableHead className="text-right">Repair Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    No damage reports found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs font-medium">{r.id}</TableCell>
                    <TableCell className="text-sm font-medium">{r.vehicle}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{r.customer}</p>
                      <p className="text-xs text-muted-foreground font-mono">{r.contract}</p>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm text-muted-foreground truncate" title={r.description}>
                        {r.description}
                      </p>
                    </TableCell>
                    <TableCell>{faultBadge(r.fault)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {fmtCurrency(r.repairCost)}
                    </TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(r.created)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info(`Viewing damage report ${r.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info(`Updating status for ${r.id}`)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Update
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info(`Filing insurance claim for ${r.id}`)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Claim
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Damage Report Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New Damage Report</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 px-4">
            <div className="space-y-1.5">
              <Label>Booking Reference</Label>
              <Input
                value={form.bookingRef}
                onChange={(e) => setForm((f) => ({ ...f, bookingRef: e.target.value }))}
                placeholder="BK-1042"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle</Label>
              <Input
                value={form.vehicle}
                onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))}
                placeholder="Toyota Camry (ABC-123)"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the damage..."
                rows={4}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Severity</Label>
              <Select
                value={form.severity}
                onValueChange={(v) => setForm((f) => ({ ...f, severity: v ?? "MINOR" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MINOR">Minor</SelectItem>
                  <SelectItem value="MODERATE">Moderate</SelectItem>
                  <SelectItem value="MAJOR">Major</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estimated Repair Cost (AUD)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.repairCost}
                onChange={(e) => setForm((f) => ({ ...f, repairCost: e.target.value }))}
                placeholder="500.00"
              />
            </div>
            <SheetFooter className="px-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Report</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
