"use client"

import { useState, useTransition } from "react"
import {
  Users,
  Building2,
  ShieldOff,
  Search,
  MoreHorizontal,
  UserRound,
  PenLine,
  BookPlus,
  Ban,
  ShieldCheck,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import type { Customer } from "@/generated/prisma"

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

import { createCustomer, blacklistCustomer, unblacklistCustomer, updateCustomer } from "./actions"

interface CustomersViewProps {
  customers: Customer[]
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  licenceNo: "",
  licenceState: "",
  address: "",
}

export function CustomersView({ customers }: CustomersViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all-status")
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [blacklistReason, setBlacklistReason] = useState("")
  const [isPending, startTransition] = useTransition()

  const totalCustomers = customers.length
  const blacklisted = customers.filter((c) => c.isBlacklisted).length

  const filtered = customers.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`
    const matchSearch =
      search.trim() === "" ||
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    const matchStatus =
      statusFilter === "all-status" ||
      (statusFilter === "active" && !c.isBlacklisted) ||
      (statusFilter === "blacklisted" && c.isBlacklisted)
    return matchSearch && matchStatus
  })

  function resetForm() {
    setForm(emptyForm)
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(customer: Customer) {
    setEditingId(customer.id)
    setForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      licenceNo: customer.licenceNo ?? "",
      licenceState: customer.licenceState ?? "",
      address: customer.address ?? "",
    })
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        if (editingId) {
          await updateCustomer(editingId, {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            licenceNo: form.licenceNo || undefined,
            licenceState: form.licenceState || undefined,
            address: form.address || undefined,
          })
          toast.success("Customer updated successfully")
        } else {
          await createCustomer({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            licenceNo: form.licenceNo || undefined,
            licenceState: form.licenceState || undefined,
            address: form.address || undefined,
          })
          toast.success("Customer created successfully")
        }
        setOpen(false)
        resetForm()
      } catch {
        toast.error(editingId ? "Failed to update customer" : "Failed to create customer")
      }
    })
  }

  function handleBlacklist(id: string, name: string) {
    if (!blacklistReason.trim()) {
      toast.error("Please enter a reason for blacklisting")
      return
    }
    startTransition(async () => {
      try {
        await blacklistCustomer(id, blacklistReason)
        toast.success(`${name} has been blacklisted`)
        setBlacklistReason("")
      } catch {
        toast.error("Failed to blacklist customer")
      }
    })
  }

  function handleUnblacklist(id: string, name: string) {
    startTransition(async () => {
      try {
        await unblacklistCustomer(id)
        toast.success(`${name} has been unblacklisted`)
      } catch {
        toast.error("Failed to unblacklist customer")
      }
    })
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
        <Button onClick={openAdd}>
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
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-foreground">
              {totalCustomers - blacklisted}
            </span>
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
                <TableHead>Licence No.</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => {
                  const fullName = `${customer.firstName} ${customer.lastName}`
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
                            <span className="font-medium text-foreground">{fullName}</span>
                            <span className="text-xs text-muted-foreground">{customer.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {customer.licenceNo ?? "—"}
                        {customer.licenceState ? ` (${customer.licenceState})` : ""}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {customer.address ?? "—"}
                      </TableCell>
                      <TableCell>
                        {customer.isBlacklisted ? (
                          <Badge variant="destructive">Blacklisted</Badge>
                        ) : (
                          <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-0">
                            Active
                          </Badge>
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
                              onClick={() => toast.info(`Viewing profile for ${fullName}`)}
                            >
                              <UserRound className="h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toast.info(`Creating booking for ${fullName}`)}
                            >
                              <BookPlus className="h-4 w-4" />
                              New Booking
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setTimeout(() => openEdit(customer), 0)}
                            >
                              <PenLine className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!customer.isBlacklisted ? (
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
                                      {fullName} will be blacklisted and unable to make new
                                      bookings. Please provide a reason.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="px-6 pb-2">
                                    <Textarea
                                      placeholder="Reason for blacklisting..."
                                      value={blacklistReason}
                                      onChange={(e) => setBlacklistReason(e.target.value)}
                                      rows={3}
                                    />
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      onClick={() => setBlacklistReason("")}
                                    >
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      variant="destructive"
                                      onClick={() => handleBlacklist(customer.id, fullName)}
                                    >
                                      Yes, Blacklist
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleUnblacklist(customer.id, fullName)}
                                disabled={isPending}
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

      {/* New / Edit Customer Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit Customer" : "New Customer"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 px-4">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                placeholder="James"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                placeholder="Hartley"
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
              <Label>Licence No. (optional)</Label>
              <Input
                value={form.licenceNo}
                onChange={(e) => setForm((f) => ({ ...f, licenceNo: e.target.value }))}
                placeholder="12345678"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Licence State (optional)</Label>
              <Input
                value={form.licenceState}
                onChange={(e) => setForm((f) => ({ ...f, licenceState: e.target.value }))}
                placeholder="NSW"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Address (optional)</Label>
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
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? editingId ? "Saving…" : "Creating…"
                  : editingId ? "Save Changes" : "Create Customer"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
