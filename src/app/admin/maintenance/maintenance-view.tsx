"use client"

import { useState, useTransition } from "react"
import {
  CalendarClock,
  AlertTriangle,
  Wrench,
  Plus,
  CheckCircle2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import type { MaintenanceType } from "@/generated/prisma"

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
} from "@/components/ui/alert-dialog"

import {
  createMaintenanceRecord,
  updateMaintenanceStatus,
  deleteMaintenanceRecord,
} from "./actions"

type VehicleOption = { id: string; make: string; model: string; registrationNo: string }

type MaintenanceRecord = {
  id: string
  vehicleId: string
  vehicle: string
  type: string
  scheduledDate: string
  status: string
  odometerDue: number | null
  cost: number | null
  vendor: string
}

function typeBadge(type: string) {
  const styles: Record<string, string> = {
    SERVICE: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    REGISTRATION: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    TYRE_REPLACEMENT: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    INSPECTION: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    BRAKE_SERVICE: "bg-red-500/15 text-red-400 border-red-500/30",
    OIL_CHANGE: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  }
  const labels: Record<string, string> = {
    SERVICE: "Service",
    REGISTRATION: "Registration",
    TYRE_REPLACEMENT: "Tyre Replacement",
    INSPECTION: "Inspection",
    BRAKE_SERVICE: "Brake Service",
    OIL_CHANGE: "Oil Change",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${styles[type] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {labels[type] ?? type}
    </span>
  )
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    SCHEDULED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    OVERDUE: "bg-red-500/15 text-red-400 border-red-500/30",
    IN_PROGRESS: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  }
  const labels: Record<string, string> = {
    SCHEDULED: "Scheduled",
    OVERDUE: "Overdue",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
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

function MaintenanceCancelButton({ record }: { record: MaintenanceRecord }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => setTimeout(() => setOpen(true), 0)}
      >
        <X className="h-4 w-4 mr-1" />
        Cancel
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this maintenance record?</AlertDialogTitle>
            <AlertDialogDescription>
              Maintenance record for {record.vehicle} will be cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Record</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await deleteMaintenanceRecord(record.id)
                    toast.success("Maintenance record cancelled")
                  } catch {
                    toast.error("Failed")
                  }
                })
              }
            >
              {isPending ? "Cancelling…" : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const emptyForm = {
  vehicleId: "",
  type: "SERVICE" as MaintenanceType,
  description: "",
  cost: "",
  date: "",
}

interface MaintenanceViewProps {
  maintenanceRecords: MaintenanceRecord[]
  vehicles: VehicleOption[]
  upcoming: number
  overdue: number
  inProgress: number
}

export function MaintenanceView({
  maintenanceRecords,
  vehicles,
  upcoming,
  overdue,
  inProgress,
}: MaintenanceViewProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [isPending, startTransition] = useTransition()

  const filtered = maintenanceRecords.filter((r) => {
    const matchSearch =
      search.trim() === "" ||
      r.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      r.vendor.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || r.type === typeFilter
    const matchStatus = statusFilter === "all" || r.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.vehicleId) {
      toast.error("Please select a vehicle")
      return
    }
    startTransition(async () => {
      try {
        await createMaintenanceRecord({
          vehicleId: form.vehicleId,
          type: form.type,
          scheduledDate: new Date(form.date),
          description: form.description || undefined,
          cost: form.cost ? parseFloat(form.cost) : undefined,
        })
        toast.success("Maintenance record scheduled")
        setOpen(false)
        setForm(emptyForm)
      } catch {
        toast.error("Failed to schedule maintenance")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Maintenance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule and track vehicle maintenance
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Service
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming (7 days)
            </CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{upcoming}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-400">{overdue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Wrench className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-400">{inProgress}</p>
          </CardContent>
        </Card>
      </div>

      {overdue > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">
              {overdue} maintenance record{overdue > 1 ? "s are" : " is"} overdue
            </p>
            <p className="text-xs text-red-400/80 mt-0.5">
              Review and action overdue items to ensure fleet compliance and vehicle safety.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search vehicle, vendor, type..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="SERVICE">Service</SelectItem>
            <SelectItem value="REGISTRATION">Registration</SelectItem>
            <SelectItem value="TYRE_REPLACEMENT">Tyre Replacement</SelectItem>
            <SelectItem value="INSPECTION">Inspection</SelectItem>
            <SelectItem value="BRAKE_SERVICE">Brake Service</SelectItem>
            <SelectItem value="OIL_CHANGE">Oil Change</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Odometer Due</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    No maintenance records found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => {
                  const isOverdue = r.status === "OVERDUE"
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-sm">{r.vehicle}</TableCell>
                      <TableCell>{typeBadge(r.type)}</TableCell>
                      <TableCell
                        className={`text-sm ${isOverdue ? "text-red-400 font-medium" : "text-muted-foreground"}`}
                      >
                        {isOverdue && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                        {fmtDate(r.scheduledDate)}
                      </TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {r.odometerDue !== null ? `${r.odometerDue.toLocaleString()} km` : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {r.cost !== null ? fmtCurrency(r.cost) : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                        {r.vendor}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            onClick={() =>
                              startTransition(async () => {
                                try {
                                  await updateMaintenanceStatus(r.id, "COMPLETED")
                                  toast.success("Marked as completed")
                                } catch {
                                  toast.error("Failed")
                                }
                              })
                            }
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <MaintenanceCancelButton record={r} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Schedule Service Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Schedule Service</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 px-4">
            <div className="space-y-1.5">
              <Label>Vehicle</Label>
              <Select
                items={vehicles.map((v) => ({
                  value: v.id,
                  label: `${v.make} ${v.model} (${v.registrationNo})`,
                }))}
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
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: (v ?? "SERVICE") as MaintenanceType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SERVICE">Service</SelectItem>
                  <SelectItem value="REGISTRATION">Registration</SelectItem>
                  <SelectItem value="TYRE_REPLACEMENT">Tyre Replacement</SelectItem>
                  <SelectItem value="INSPECTION">Inspection</SelectItem>
                  <SelectItem value="BRAKE_SERVICE">Brake Service</SelectItem>
                  <SelectItem value="OIL_CHANGE">Oil Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the maintenance work..."
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Estimated Cost (AUD)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                placeholder="250.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Scheduled Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <SheetFooter className="px-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Scheduling…" : "Schedule Service"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
