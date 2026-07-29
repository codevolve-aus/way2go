"use client"

import { useState, useTransition } from "react"
import {
  MoreHorizontal,
  Pencil,
  History,
  Eye,
  Wrench,
  Trash2,
  Search,
  Plus,
  RefreshCw,
  Archive,
} from "lucide-react"
import { toast } from "sonner"
import type { Vehicle, VehicleCategory, VehicleStatus, FuelType, Transmission } from "@/generated/prisma"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Textarea } from "@/components/ui/textarea"

import { createVehicle, updateVehicle, updateVehicleStatus, deleteVehicle } from "./actions"

type VehicleRow = Vehicle & { category: VehicleCategory }
type CategoryOption = Pick<VehicleCategory, "id" | "name">

interface FleetViewProps {
  vehicles: VehicleRow[]
  categories: CategoryOption[]
}

const statusBadgeClass: Record<VehicleStatus, string> = {
  AVAILABLE: "border-emerald-500/40 text-emerald-400",
  BOOKED: "border-blue-500/40 text-blue-400",
  MAINTENANCE: "border-amber-500/40 text-amber-400",
  DAMAGED: "border-red-500/40 text-red-400",
  RETIRED: "border-muted-foreground/30 text-muted-foreground",
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })
}

type VehicleForm = {
  make: string
  model: string
  year: string
  colour: string
  registrationNo: string
  categoryId: string
  fuelType: FuelType
  transmission: Transmission
  seats: string
  vin: string
  notes: string
}

function VehicleActionsMenu({
  vehicle, label, isPending,
  onEdit, onSetAvailable, onSetMaintenance, onRetire, onDelete,
}: {
  vehicle: VehicleRow
  label: string
  isPending: boolean
  onEdit: () => void
  onSetAvailable: () => void
  onSetMaintenance: () => void
  onRetire: () => void
  onDelete: () => void
}) {
  const [maintenanceOpen, setMaintenanceOpen] = useState(false)
  const [retireOpen, setRetireOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => toast.info(`Viewing ${label} (${vehicle.registrationNo})`)}>
            <Eye className="h-4 w-4" />View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTimeout(onEdit, 0)}>
            <Pencil className="h-4 w-4" />Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info(`Viewing history for ${vehicle.registrationNo}`)}>
            <History className="h-4 w-4" />View History
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSetAvailable} disabled={isPending}>
            <RefreshCw className="h-4 w-4" />Set Available
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTimeout(() => setMaintenanceOpen(true), 0)}>
            <Wrench className="h-4 w-4" />Set Maintenance
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTimeout(() => setRetireOpen(true), 0)}>
            <Archive className="h-4 w-4" />Retire
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setTimeout(() => setDeleteOpen(true), 0)}>
            <Trash2 className="h-4 w-4" />Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark {label} for maintenance?</AlertDialogTitle>
            <AlertDialogDescription>
              This vehicle ({vehicle.registrationNo}) will be marked as under maintenance and unavailable for new bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { onSetMaintenance(); setMaintenanceOpen(false) }}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={retireOpen} onOpenChange={setRetireOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retire {label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This vehicle ({vehicle.registrationNo}) will be retired and removed from active service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => { onRetire(); setRetireOpen(false) }}>Yes, Retire</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {vehicle.registrationNo} from your fleet. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => { onDelete(); setDeleteOpen(false) }}>Yes, Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const emptyForm: VehicleForm = {
  make: "",
  model: "",
  year: "",
  colour: "",
  registrationNo: "",
  categoryId: "",
  fuelType: "PETROL",
  transmission: "AUTOMATIC",
  seats: "5",
  vin: "",
  notes: "",
}

export function FleetView({ vehicles, categories }: FleetViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isPending, startTransition] = useTransition()

  const filtered = vehicles.filter((v) => {
    const matchSearch =
      search.trim() === "" ||
      `${v.make} ${v.model} ${v.registrationNo} ${v.category.name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    const matchStatus = statusFilter === "ALL" || v.status === statusFilter
    const matchCategory = categoryFilter === "ALL" || v.category.name === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  const categoryNames = Array.from(new Set(vehicles.map((v) => v.category.name))).sort()

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(vehicle: VehicleRow) {
    setEditingId(vehicle.id)
    setForm({
      make: vehicle.make,
      model: vehicle.model,
      year: String(vehicle.year),
      colour: vehicle.colour,
      registrationNo: vehicle.registrationNo,
      categoryId: vehicle.categoryId,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      seats: String(vehicle.seats),
      vin: vehicle.vin ?? "",
      notes: vehicle.notes ?? "",
    })
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.categoryId) {
      toast.error("Please select a vehicle category")
      return
    }
    const year = parseInt(form.year, 10)
    const seats = parseInt(form.seats, 10)
    if (isNaN(year) || year < 1990 || year > new Date().getFullYear() + 1) {
      toast.error("Enter a valid year")
      return
    }
    if (isNaN(seats) || seats < 1) {
      toast.error("Enter a valid seat count")
      return
    }
    const payload = {
      make: form.make,
      model: form.model,
      year,
      colour: form.colour,
      registrationNo: form.registrationNo,
      categoryId: form.categoryId,
      fuelType: form.fuelType,
      transmission: form.transmission,
      seats,
      vin: form.vin || undefined,
      notes: form.notes || undefined,
    }
    startTransition(async () => {
      try {
        if (editingId) {
          await updateVehicle(editingId, payload)
          toast.success("Vehicle updated successfully")
        } else {
          await createVehicle(payload)
          toast.success("Vehicle added successfully")
        }
        setOpen(false)
      } catch (err) {
        const msg = err instanceof Error ? err.message : ""
        toast.error(msg.includes("Unique constraint") ? "Registration number already exists" : editingId ? "Failed to update vehicle" : "Failed to add vehicle")
      }
    })
  }

  function handleSetAvailable(id: string, label: string) {
    startTransition(async () => {
      try {
        await updateVehicleStatus(id, "AVAILABLE")
        toast.success(`${label} set to Available`)
      } catch {
        toast.error("Failed to update status")
      }
    })
  }

  function handleSetMaintenance(id: string, label: string) {
    startTransition(async () => {
      try {
        await updateVehicleStatus(id, "MAINTENANCE")
        toast.success(`${label} marked for maintenance`)
      } catch {
        toast.error("Failed to update status")
      }
    })
  }

  function handleRetire(id: string, label: string) {
    startTransition(async () => {
      try {
        await updateVehicleStatus(id, "RETIRED")
        toast.success(`${label} retired`)
      } catch {
        toast.error("Failed to update status")
      }
    })
  }

  function handleDelete(id: string, label: string) {
    startTransition(async () => {
      try {
        await deleteVehicle(id)
        toast.success(`${label} deleted`)
      } catch {
        toast.error("Failed to delete vehicle")
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Fleet</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and monitor all vehicles in your fleet.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search make, model, plate…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="BOOKED">Booked</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="DAMAGED">Damaged</SelectItem>
            <SelectItem value="RETIRED">Retired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categoryNames.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fuel / Trans</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Odometer</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No vehicles match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((vehicle) => {
                const label = `${vehicle.make} ${vehicle.model}`
                return (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">
                          {vehicle.make} {vehicle.model}{" "}
                          <span className="text-muted-foreground font-normal">{vehicle.year}</span>
                        </span>
                        <Badge
                          variant="outline"
                          className="w-fit font-mono text-[10px] text-muted-foreground border-border"
                        >
                          {vehicle.registrationNo}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{vehicle.category.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass[vehicle.status]}>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {vehicle.fuelType} / {vehicle.transmission}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{vehicle.seats}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {vehicle.odometer.toLocaleString()} km
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {fmtDate(vehicle.createdAt)}
                    </TableCell>
                    <TableCell>
                      <VehicleActionsMenu
                        vehicle={vehicle}
                        label={label}
                        isPending={isPending}
                        onEdit={() => openEdit(vehicle)}
                        onSetAvailable={() => handleSetAvailable(vehicle.id, label)}
                        onSetMaintenance={() => handleSetMaintenance(vehicle.id, label)}
                        onRetire={() => handleRetire(vehicle.id, label)}
                        onDelete={() => handleDelete(vehicle.id, label)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {vehicles.length} vehicles
      </p>

      {/* Add Vehicle Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit Vehicle" : "Add Vehicle"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 px-4">
            <div className="space-y-1.5">
              <Label>Make</Label>
              <Input
                value={form.make}
                onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
                placeholder="Toyota"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                placeholder="RAV4"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input
                type="number"
                min="2000"
                max="2030"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                placeholder="2024"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Colour</Label>
              <Input
                value={form.colour}
                onChange={(e) => setForm((f) => ({ ...f, colour: e.target.value }))}
                placeholder="Silver"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Registration No.</Label>
              <Input
                value={form.registrationNo}
                onChange={(e) => setForm((f) => ({ ...f, registrationNo: e.target.value }))}
                placeholder="ABC-123"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v ?? "" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fuel Type</Label>
              <Select
                value={form.fuelType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, fuelType: (v ?? "PETROL") as typeof f.fuelType }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PETROL">Petrol</SelectItem>
                  <SelectItem value="DIESEL">Diesel</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                  <SelectItem value="ELECTRIC">Electric</SelectItem>
                  <SelectItem value="LPG">LPG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Transmission</Label>
              <Select
                value={form.transmission}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    transmission: (v ?? "AUTOMATIC") as typeof f.transmission,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Seats</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={form.seats}
                onChange={(e) => setForm((f) => ({ ...f, seats: e.target.value }))}
                placeholder="5"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>VIN (optional)</Label>
              <Input
                value={form.vin}
                onChange={(e) => setForm((f) => ({ ...f, vin: e.target.value }))}
                placeholder="1HGBH41JXMN109186"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
            <SheetFooter className="px-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (editingId ? "Saving…" : "Adding…") : (editingId ? "Save Changes" : "Add Vehicle")}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
