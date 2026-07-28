import { Metadata } from "next"
import {
  FileText,
  FilePen,
  FileCheck2,
  FileX2,
  AlertTriangle,
  Search,
  Eye,
  Download,
  X,
  MoreHorizontal,
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
import { Progress } from "@/components/ui/progress"

export const metadata: Metadata = { title: "Contracts" }

type ContractStatus = "DRAFT" | "SIGNED" | "ACTIVE" | "CLOSED" | "DISPUTED"

interface Contract {
  id: string
  contractNumber: string
  customer: string
  vehicle: string
  bookingNumber: string
  status: ContractStatus
  totalAmount: number
  depositPaid: number
  depositRequired: number
  createdDate: string
}

const contracts: Contract[] = [
  {
    id: "1",
    contractNumber: "CTR-2026-0041",
    customer: "James Hartley",
    vehicle: "Toyota HiLux SR5 (VIC 1AB 2CD)",
    bookingNumber: "BK-1041",
    status: "ACTIVE",
    totalAmount: 1540.0,
    depositPaid: 400,
    depositRequired: 400,
    createdDate: "2026-07-10",
  },
  {
    id: "2",
    contractNumber: "CTR-2026-0042",
    customer: "Priya Sharma",
    vehicle: "Mercedes-Benz Vito (VIC 3EF 4GH)",
    bookingNumber: "BK-1042",
    status: "SIGNED",
    totalAmount: 3200.0,
    depositPaid: 500,
    depositRequired: 800,
    createdDate: "2026-07-14",
  },
  {
    id: "3",
    contractNumber: "CTR-2026-0043",
    customer: "Sophie Nguyen",
    vehicle: "Ford Ranger XLT (VIC 5IJ 6KL)",
    bookingNumber: "BK-1043",
    status: "DRAFT",
    totalAmount: 980.0,
    depositPaid: 0,
    depositRequired: 300,
    createdDate: "2026-07-20",
  },
  {
    id: "4",
    contractNumber: "CTR-2026-0038",
    customer: "Dylan Matthews",
    vehicle: "Hyundai iLoad (VIC 7MN 8OP)",
    bookingNumber: "BK-1038",
    status: "CLOSED",
    totalAmount: 720.0,
    depositPaid: 200,
    depositRequired: 200,
    createdDate: "2026-06-28",
  },
  {
    id: "5",
    contractNumber: "CTR-2026-0039",
    customer: "Caitlin Walsh",
    vehicle: "Isuzu D-MAX LS-U (VIC 9QR 0ST)",
    bookingNumber: "BK-1039",
    status: "DISPUTED",
    totalAmount: 2100.0,
    depositPaid: 600,
    depositRequired: 600,
    createdDate: "2026-07-01",
  },
  {
    id: "6",
    contractNumber: "CTR-2026-0044",
    customer: "Lachlan O'Brien",
    vehicle: "Nissan Navara ST-X (VIC 2UV 3WX)",
    bookingNumber: "BK-1044",
    status: "DRAFT",
    totalAmount: 560.0,
    depositPaid: 0,
    depositRequired: 150,
    createdDate: "2026-07-24",
  },
  {
    id: "7",
    contractNumber: "CTR-2026-0040",
    customer: "Sophie Nguyen",
    vehicle: "Toyota LandCruiser 200 (VIC 4YZ 5AB)",
    bookingNumber: "BK-1040",
    status: "ACTIVE",
    totalAmount: 4800.0,
    depositPaid: 1000,
    depositRequired: 1000,
    createdDate: "2026-07-05",
  },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function StatusBadge({ status }: { status: ContractStatus }) {
  switch (status) {
    case "DRAFT":
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          Draft
        </Badge>
      )
    case "SIGNED":
      return (
        <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-0">
          Signed
        </Badge>
      )
    case "ACTIVE":
      return (
        <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-0">
          Active
        </Badge>
      )
    case "CLOSED":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Closed
        </Badge>
      )
    case "DISPUTED":
      return <Badge variant="destructive">Disputed</Badge>
  }
}

const draftCount = contracts.filter((c) => c.status === "DRAFT").length
const activeCount = contracts.filter((c) => c.status === "ACTIVE").length
const closedCount = contracts.filter((c) => c.status === "CLOSED").length
const disputedCount = contracts.filter((c) => c.status === "DISPUTED").length
const hasDrafts = draftCount > 0

export default function ContractsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Contracts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage rental agreements and contract lifecycle
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
              <FilePen className="h-4 w-4" />
              Draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-foreground">
              {draftCount}
            </span>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
              <FileCheck2 className="h-4 w-4" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">
              {activeCount}
            </span>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
              <FileText className="h-4 w-4" />
              Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-foreground">
              {closedCount}
            </span>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
              <FileX2 className="h-4 w-4" />
              Disputed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-destructive">
              {disputedCount}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Pending Signatures Alert */}
      {hasDrafts && (
        <Card className="border-yellow-500/40 bg-yellow-500/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Pending Signatures
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {draftCount} contract{draftCount !== 1 ? "s" : ""} in draft
                status {draftCount !== 1 ? "are" : "is"} awaiting customer
                signature before activation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search contracts..." className="pl-8" />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Contract #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Booking #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total (AUD)</TableHead>
                <TableHead className="min-w-[140px]">Deposit Paid</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => {
                const depositPercent = Math.round(
                  (contract.depositPaid / contract.depositRequired) * 100
                )
                return (
                  <TableRow key={contract.id}>
                    {/* Contract # */}
                    <TableCell className="pl-4">
                      <span className="font-mono text-xs text-foreground">
                        {contract.contractNumber}
                      </span>
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="font-medium text-foreground">
                      {contract.customer}
                    </TableCell>

                    {/* Vehicle */}
                    <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">
                      {contract.vehicle}
                    </TableCell>

                    {/* Booking # */}
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {contract.bookingNumber}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={contract.status} />
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(contract.totalAmount)}
                    </TableCell>

                    {/* Deposit Progress */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {formatCurrency(contract.depositPaid)} /{" "}
                            {formatCurrency(contract.depositRequired)}
                          </span>
                          <span>{depositPercent}%</span>
                        </div>
                        <Progress
                          value={depositPercent}
                          className="h-1.5 w-28"
                        />
                      </div>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(contract.createdDate)}
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
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          {contract.status !== "CLOSED" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive">
                                <X className="h-4 w-4" />
                                Close Contract
                              </DropdownMenuItem>
                            </>
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
