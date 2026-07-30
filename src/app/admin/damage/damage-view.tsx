"use client"

import { useState, useTransition } from "react"
import {
  AlertTriangle,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Plus,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import type { DamageReport, Vehicle, DamageStatus, FaultType } from "@/generated/prisma"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { createDamageReport, updateDamageStatus } from "./actions"

type DamageRow = DamageReport & { vehicle: Vehicle }
type VehicleOption = Pick<Vehicle, "id" | "make" | "model" | "registrationNo">

interface DamageViewProps {
  reports: DamageRow[]
  vehicles: VehicleOption[]
}

const statusStyles: Record<DamageStatus, string> = {
  REPORTED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ASSESSED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  REPAIR_IN_PROGRESS: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  REPAIRED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CLAIM_FILED: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  RESOLVED: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
}

const statusLabels: Record<DamageStatus, string> = {
  REPORTED: "Reported",
  ASSESSED: "Assessed",
  REPAIR_IN_PROGRESS: "In Repair",
  REPAIRED: "Repaired",
  CLAIM_FILED: "Claim Filed",
  RESOLVED: "Resolved",
}

const faultStyles: Record<string, string> = {
  CUSTOMER: "bg-red-500/15 text-red-400 border-red-500/30",
  THIRD_PARTY: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  NO_FAULT: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  UNKNOWN: "bg-muted text-muted-foreground border-border",
}

const faultLabels: Record<string, string> = {
  CUSTOMER: "Customer",
  THIRD_PARTY: "Third Party",
  NO_FAULT: "No Fault",
  UNKNOWN: "Unknown",
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })
}

function fmtCurrency(n: number) {
  return `$${n.toFixed(2)}`
}

const emptyForm = {
  vehicleId: "",
  description: "",
  faultType: "" as FaultType | "",
  repairCost: "",
  insuranceClaim: false,
}

export function DamageView({ reports, vehicles }: DamageViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [faultFilter, setFaultFilter] = useState("all")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [isPending, startTransition] = useTransition()

  const openReports = reports.filter((r) => ["REPORTED", "ASSESSED"].includes(r.status)).length
  const underRepair = reports.filter((r) => r.status === "REPAIR_IN_PROGRESS").length
  const insuranceClaims = reports.filter((r) => r.insuranceClaim).length
  const resolved = reports.filter((r) => ["REPAIRED", "RESOLVED"].includes(r.status)).length

  const filtered = reports.filter((r) => {
    const vehicleLabel = `${r.vehicle.make} ${r.vehicle.model} ${r.vehicle.registrationNo}`
    const matchSearch =
      search.trim() === "" ||
      vehicleLabel.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || r.status === statusFilter
    const matchFault = faultFilter === "all" || r.faultType === faultFilter
    return matchSearch && matchStatus && matchFault
  })

  function resetForm() {
    setForm(emptyForm)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await createDamageReport({
          vehicleId: form.vehicleId,
          description: form.description,
          faultType: form.faultType ? (form.faultType as FaultType) : undefined,
          repairCost: form.repairCost ? parseFloat(form.repairCost) : undefined,
          insuranceClaim: form.insuranceClaim,
        })
        toast.success("Damage report created successfully")
        setOpen(false)
        resetForm()
      } catch {
        toast.error("Failed to create damage report")
      }
    })
  }

  function handleStatusUpdate(id: string, status: DamageStatus) {
    startTransition(async () => {
      try {
        await updateDamageStatus(id, status)
        toast.success(`Status updated to ${statusLabels[status]}`)
      } catch {
        toast.error("Failed to update status")
      }
    })
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-400">{resolved}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search vehicle, description..."
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
            <SelectItem value="CLAIM_FILED">Claim Filed</SelectItem>
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
            <SelectItem value="UNKNOWN">Unknown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Fault</TableHead>
                <TableHead className="text-right">Repair Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No damage reports found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm font-medium">
                      {r.vehicle.make} {r.vehicle.model}
                      <br />
                      <span className="font-mono text-xs text-muted-foreground">
                        {r.vehicle.registrationNo}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm text-muted-foreground truncate" title={r.description}>
                        {r.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      {r.faultType ? (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${faultStyles[r.faultType] ?? "bg-muted text-muted-foreground border-border"}`}
                        >
                          {faultLabels[r.faultType] ?? r.faultType}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {r.repairCost != null ? fmtCurrency(r.repairCost) : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[r.status]}`}
                      >
                        {statusLabels[r.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmtDate(r.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="sm" disabled={isPending}>
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Update Status
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "REPORTED")}>
                            Reported
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "ASSESSED")}>
                            Assessed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "REPAIR_IN_PROGRESS")}>
                            In Repair
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "REPAIRED")}>
                            Repaired
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "CLAIM_FILED")}>
                            Claim Filed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "RESOLVED")}>
                            Resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
              <Label>Vehicle</Label>
              <Select
                value={form.vehicleId}
                onValueChange={(v) => setForm((f) => ({ ...f, vehicleId: v ?? "" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.registrationNo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>Fault Type</Label>
              <Select
                value={form.faultType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, faultType: (v ?? "") as FaultType | "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fault type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="THIRD_PARTY">Third Party</SelectItem>
                  <SelectItem value="NO_FAULT">No Fault</SelectItem>
                  <SelectItem value="UNKNOWN">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estimated Repair Cost (AUD, optional)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.repairCost}
                onChange={(e) => setForm((f) => ({ ...f, repairCost: e.target.value }))}
                placeholder="500.00"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="insuranceClaim"
                type="checkbox"
                checked={form.insuranceClaim}
                onChange={(e) => setForm((f) => ({ ...f, insuranceClaim: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="insuranceClaim">Insurance Claim</Label>
            </div>
            <SheetFooter className="px-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create Report"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
