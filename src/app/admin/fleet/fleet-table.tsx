"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  History,
  RefreshCw,
  Archive,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type VehicleStatus = "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "DAMAGED" | "RETIRED";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  category: string;
  status: VehicleStatus;
  fuel: string;
  transmission: string;
  seats: number;
  odometer: string;
}

const statusBadgeClass: Record<VehicleStatus, string> = {
  AVAILABLE: "border-emerald-500/40 text-emerald-400",
  BOOKED: "border-blue-500/40 text-blue-400",
  MAINTENANCE: "border-amber-500/40 text-amber-400",
  DAMAGED: "border-red-500/40 text-red-400",
  RETIRED: "border-muted-foreground/30 text-muted-foreground",
};

const vehicles: Vehicle[] = [
  {
    id: "V-001",
    make: "Toyota",
    model: "RAV4",
    year: 2024,
    plate: "ABC-123",
    category: "SUV",
    status: "AVAILABLE",
    fuel: "Hybrid",
    transmission: "Auto",
    seats: 5,
    odometer: "12,480 km",
  },
  {
    id: "V-002",
    make: "Ford",
    model: "Ranger",
    year: 2024,
    plate: "DEF-456",
    category: "Ute",
    status: "BOOKED",
    fuel: "Diesel",
    transmission: "Auto",
    seats: 5,
    odometer: "28,310 km",
  },
  {
    id: "V-003",
    make: "Hyundai",
    model: "Tucson",
    year: 2023,
    plate: "GHI-789",
    category: "SUV",
    status: "AVAILABLE",
    fuel: "Petrol",
    transmission: "Auto",
    seats: 5,
    odometer: "41,550 km",
  },
  {
    id: "V-004",
    make: "Kia",
    model: "Carnival",
    year: 2023,
    plate: "JKL-012",
    category: "People Mover",
    status: "MAINTENANCE",
    fuel: "Petrol",
    transmission: "Auto",
    seats: 8,
    odometer: "63,200 km",
  },
  {
    id: "V-005",
    make: "Mazda",
    model: "CX-5",
    year: 2024,
    plate: "MNO-345",
    category: "SUV",
    status: "DAMAGED",
    fuel: "Petrol",
    transmission: "Auto",
    seats: 5,
    odometer: "19,740 km",
  },
  {
    id: "V-006",
    make: "Mitsubishi",
    model: "Outlander",
    year: 2022,
    plate: "PQR-678",
    category: "SUV",
    status: "RETIRED",
    fuel: "Petrol",
    transmission: "CVT",
    seats: 7,
    odometer: "118,900 km",
  },
];

const categories = Array.from(new Set(vehicles.map((v) => v.category))).sort();

export function FleetTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const filtered = vehicles.filter((v) => {
    const matchSearch =
      search.trim() === "" ||
      `${v.make} ${v.model} ${v.year} ${v.plate}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
    const matchCategory = categoryFilter === "ALL" || v.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="space-y-4">
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
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-muted-foreground"
                >
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
                        <span className="text-muted-foreground font-normal">
                          {vehicle.year}
                        </span>
                      </span>
                      <Badge
                        variant="outline"
                        className="w-fit font-mono text-[10px] text-muted-foreground border-border"
                      >
                        {vehicle.plate}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vehicle.category}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusBadgeClass[vehicle.status]}
                    >
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vehicle.fuel} / {vehicle.transmission}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vehicle.seats}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vehicle.odometer}
                  </TableCell>
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
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <History className="h-4 w-4" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="h-4 w-4" />
                          Change Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          <Archive className="h-4 w-4" />
                          Retire
                        </DropdownMenuItem>
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
    </div>
  );
}
