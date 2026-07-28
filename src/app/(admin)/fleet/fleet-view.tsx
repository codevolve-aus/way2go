"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Pencil,
  History,
  RefreshCw,
  Archive,
  Search,
  Plus,
  Eye,
  Wrench,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

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

type VehicleStatus = "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "DAMAGED" | "RETIRED"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  plate: string
  category: string
  status: VehicleStatus
  fuel: string
  transmission: string
  seats: number
  odometer: string
}

const statusBadgeClass: Record<VehicleStatus, string> = {
  AVAILABLE: "border-emerald-500/40 text-emerald-400",
  BOOKED: "border-blue-500/40 text-blue-400",
  MAINTENANCE: "border-amber-500/40 text-amber-400",
  DAMAGED: "border-red-500/40 text-red-400",
  RETIRED: "border-muted-foreground/30 text-muted-foreground",
}

const emptyForm = {
  makeModel: "",
  year: "",
  registration: "",
  category: "ECONOMY",
  color: "",
  status: "AVAILABLE",
}

interface FleetViewProps {
  vehicles: Vehicle[]
}

export function FleetView({ vehicles }: FleetViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const categories = Array.from(new Set(vehicles.map((v) => v.category))).sort()

  const filtered = vehicles.filter((v) => {
    const matchSearch =
      search.trim() === "" ||
      `${v.make} ${v.model} ${v.year} ${v.plate}`
        .toLowerCase()
        .includes(search.toLowerCase())
    const matchStatus = statusFilter === "ALL" || v.status === statusFilter
    const matchCategory = categoryFilter === "ALL" || v.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.success("Vehicle added successfully")
    setOpen(false)
    setForm(emptyForm)
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
        <Button onClick={() => setOpen(true)}>
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
            {categories.map((cat) => (
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
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No vehicles match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((vehicle) => (
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
                        {vehicle.plate}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{vehicle.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClass[vehicle.status]}>
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vehicle.fuel} / {vehicle.transmission}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{vehicle.seats}</TableCell>
                  <TableCell className="text-muted-foreground">{vehicle.odometer}</TableCell>
                  <TableCell>
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
                        <DropdownMenuItem
                          onSelect={() =>
                            toast.info(`Viewing ${vehicle.make} ${vehicle.model} (${vehicle.plate})`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            toast.info(`Editing ${vehicle.make} ${vehicle.model} (${vehicle.plate})`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            toast.info(`Viewing history for ${vehicle.plate}`)
                          }
                        >
                          <History className="h-4 w-4" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Wrench className="h-4 w-4" />
                                Mark Maintenance
                              </DropdownMenuItem>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Mark {vehicle.make} {vehicle.model} for maintenance?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This vehicle ({vehicle.plate}) will be marked as under maintenance and
                                unavailable for new bookings.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  toast.success(
                                    `${vehicle.make} ${vehicle.model} marked for maintenance`
                                  )
                                }
                              >
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete {vehicle.make} {vehicle.model}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove {vehicle.plate} from your fleet. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() =>
                                  toast.success(
                                    `${vehicle.make} ${vehicle.model} (${vehicle.plate}) deleted`
                                  )
                                }
                              >
                                Yes, Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
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
            <SheetTitle>Add Vehicle</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 px-4">
            <div className="space-y-1.5">
              <Label>Make / Model</Label>
              <Input
                value={form.makeModel}
                onChange={(e) => setForm((f) => ({ ...f, makeModel: e.target.value }))}
                placeholder="Toyota RAV4"
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
              <Label>Registration</Label>
              <Input
                value={form.registration}
                onChange={(e) => setForm((f) => ({ ...f, registration: e.target.value }))}
                placeholder="ABC-123"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v ?? "ECONOMY" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ECONOMY">Economy</SelectItem>
                  <SelectItem value="COMPACT">Compact</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="LUXURY">Luxury</SelectItem>
                  <SelectItem value="VAN">Van</SelectItem>
                  <SelectItem value="TRUCK">Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <Input
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                placeholder="Silver"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v ?? "AVAILABLE" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="BOOKED">Booked</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SheetFooter className="px-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Vehicle</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
