"use client"

import { useState } from "react"
import {
  Users,
  Building2,
  ShieldOff,
  Search,
  MoreHorizontal,
  UserRound,
  CalendarX,
  PenLine,
  BookPlus,
  Ban,
  ShieldCheck,
  Plus,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

type CustomerType = "Individual" | "Corporate"
type CustomerStatus = "Active" | "Blacklisted"

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  licenceExpiry: string
  type: CustomerType
  totalBookings: number
  status: CustomerStatus
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

function isLicenceExpiringSoon(expiryDate: string): boolean {
  const today = new Date("2026-07-28")
  const expiry = new Date(expiryDate)
  const diffMs = expiry.getTime() - today.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= 30
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  licenceNumber: "",
  address: "",
}

interface CustomersViewProps {
  customers: Customer[]
  totalCustomers: number
  corporateAccounts: number
  blacklisted: number
}

export function CustomersView({
  customers,
  totalCustomers,
  corporateAccounts,
  blacklisted,
}: CustomersViewProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all-types")
  const [statusFilter, setStatusFilter] = useState("all-status")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const filtered = customers.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`
    const matchSearch =
      search.trim() === "" ||
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    const matchType =
      typeFilter === "all-types" ||
      c.type.toLowerCase() === typeFilter.toLowerCase()
    const matchStatus =
      statusFilter === "all-status" ||
      c.status.toLowerCase() === statusFilter.toLowerCase()
    return matchSearch && matchType && matchStatus
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.success("Customer created successfully")
    setOpen(false)
    setForm(emptyForm)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer accounts and rental history
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New Customer
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
              <Users className="h-4 w-4" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-foreground">{totalCustomers}</span>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
              <Building2 className="h-4 w-4" />
              Corporate Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-foreground">{corporateAccounts}</span>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
              <ShieldOff className="h-4 w-4" />
              Blacklisted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-destructive">{blacklisted}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all-types")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Customer type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-types">All Types</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all-status")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blacklisted">Blacklisted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Licence Expiry</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => {
                  const expiringSoon = isLicenceExpiringSoon(customer.licenceExpiry)
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(customer.firstName, customer.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {customer.firstName} {customer.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">{customer.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                      <TableCell>
                        {expiringSoon ? (
                          <div className="flex items-center gap-1.5">
                            <CalendarX className="h-4 w-4 text-destructive" />
                            <Badge variant="destructive">{formatDate(customer.licenceExpiry)}</Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {formatDate(customer.licenceExpiry)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.type === "Corporate" ? (
                          <Badge variant="secondary">
                            <Building2 className="h-3 w-3" />
                            Corporate
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <UserRound className="h-3 w-3" />
                            Individual
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-foreground">{customer.totalBookings}</TableCell>
                      <TableCell>
                        {customer.status === "Active" ? (
                          <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-0">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Blacklisted</Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-4 text-right">
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
                            <DropdownMenuItem
                              onSelect={() =>
                                toast.info(`Viewing profile for ${customer.firstName} ${customer.lastName}`)
                              }
                            >
                              <UserRound className="h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                toast.info(`Creating booking for ${customer.firstName} ${customer.lastName}`)
                              }
                            >
                              <BookPlus className="h-4 w-4" />
                              New Booking
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                toast.info(`Editing ${customer.firstName} ${customer.lastName}`)
                              }
                            >
                              <PenLine className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {customer.status === "Active" ? (
                              <AlertDialog>
                                <AlertDialogTrigger
                                  render={
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Ban className="h-4 w-4" />
                                      Blacklist
                                    </DropdownMenuItem>
                                  }
                                />
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Blacklist this customer?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {customer.firstName} {customer.lastName} will be blacklisted and unable to
                                      make new bookings.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      variant="destructive"
                                      onClick={() =>
                                        toast.success(
                                          `${customer.firstName} ${customer.lastName} has been blacklisted`
                                        )
                                      }
                                    >
                                      Yes, Blacklist
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <DropdownMenuItem
                                onSelect={() =>
                                  toast.success(
                                    `${customer.firstName} ${customer.lastName} has been unblacklisted`
                                  )
                                }
                              >
                                <ShieldCheck className="h-4 w-4" />
                                Unblacklist
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Customer Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New Customer</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 px-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                placeholder="James Hartley"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="james@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="0412 345 678"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Driver&apos;s Licence Number</Label>
              <Input
                value={form.licenceNumber}
                onChange={(e) => setForm((f) => ({ ...f, licenceNumber: e.target.value }))}
                placeholder="12345678"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="123 Main St, Sydney NSW 2000"
              />
            </div>
            <SheetFooter className="px-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Customer</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
