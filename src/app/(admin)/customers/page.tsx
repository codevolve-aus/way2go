import { Metadata } from "next"
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
} from "lucide-react"

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

export const metadata: Metadata = { title: "Customers" }

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

const customers: Customer[] = [
  {
    id: "C001",
    firstName: "James",
    lastName: "Hartley",
    email: "j.hartley@email.com.au",
    phone: "0412 345 678",
    licenceExpiry: "2026-08-10",
    type: "Individual",
    totalBookings: 14,
    status: "Active",
  },
  {
    id: "C002",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@telstra.com.au",
    phone: "0423 567 890",
    licenceExpiry: "2027-03-22",
    type: "Corporate",
    totalBookings: 47,
    status: "Active",
  },
  {
    id: "C003",
    firstName: "Lachlan",
    lastName: "O'Brien",
    email: "lachlan.obrien@gmail.com",
    phone: "0401 234 567",
    licenceExpiry: "2025-11-30",
    type: "Individual",
    totalBookings: 3,
    status: "Blacklisted",
  },
  {
    id: "C004",
    firstName: "Sophie",
    lastName: "Nguyen",
    email: "sophie.nguyen@anz.com.au",
    phone: "0438 901 234",
    licenceExpiry: "2028-06-15",
    type: "Corporate",
    totalBookings: 62,
    status: "Active",
  },
  {
    id: "C005",
    firstName: "Dylan",
    lastName: "Matthews",
    email: "dylan.matthews@hotmail.com",
    phone: "0456 789 012",
    licenceExpiry: "2026-08-20",
    type: "Individual",
    totalBookings: 8,
    status: "Active",
  },
  {
    id: "C006",
    firstName: "Caitlin",
    lastName: "Walsh",
    email: "c.walsh@bhp.com.au",
    phone: "0467 890 123",
    licenceExpiry: "2027-12-01",
    type: "Corporate",
    totalBookings: 29,
    status: "Active",
  },
]

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

const totalCustomers = customers.length
const corporateAccounts = customers.filter((c) => c.type === "Corporate").length
const blacklisted = customers.filter((c) => c.status === "Blacklisted").length

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage customer accounts and rental history
        </p>
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
            <span className="text-3xl font-bold text-foreground">
              {totalCustomers}
            </span>
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
            <span className="text-3xl font-bold text-foreground">
              {corporateAccounts}
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
            <span className="text-3xl font-bold text-destructive">
              {blacklisted}
            </span>
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
          />
        </div>

        <Select defaultValue="all-types">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Customer type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-types">All Types</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all-status">
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
              {customers.map((customer) => {
                const expiringSoon = isLicenceExpiringSoon(customer.licenceExpiry)
                return (
                  <TableRow key={customer.id}>
                    {/* Customer */}
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
                          <span className="text-xs text-muted-foreground">
                            {customer.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="text-muted-foreground">
                      {customer.phone}
                    </TableCell>

                    {/* Licence Expiry */}
                    <TableCell>
                      {expiringSoon ? (
                        <div className="flex items-center gap-1.5">
                          <CalendarX className="h-4 w-4 text-destructive" />
                          <Badge variant="destructive">
                            {formatDate(customer.licenceExpiry)}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {formatDate(customer.licenceExpiry)}
                        </span>
                      )}
                    </TableCell>

                    {/* Type */}
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

                    {/* Total Bookings */}
                    <TableCell className="text-foreground">
                      {customer.totalBookings}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {customer.status === "Active" ? (
                        <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-0">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Blacklisted</Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
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
                          <DropdownMenuItem>
                            <UserRound className="h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BookPlus className="h-4 w-4" />
                            New Booking
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <PenLine className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {customer.status === "Active" ? (
                            <DropdownMenuItem variant="destructive">
                              <Ban className="h-4 w-4" />
                              Blacklist
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <ShieldCheck className="h-4 w-4" />
                              Unblacklist
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
