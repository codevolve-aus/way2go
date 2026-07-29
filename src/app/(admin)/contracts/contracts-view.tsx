"use client"

import { useState, useTransition } from "react"
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
import { toast } from "sonner"
import type {
  Contract,
  Booking,
  Customer,
  Vehicle,
  ContractStatus,
} from "@/generated/prisma"

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

import { voidContract } from "./actions"

type ContractRow = Contract & {
  booking: Booking & { customer: Customer; vehicle: Vehicle }
}

function fmtAUD(amount: number) {
  return amount.toLocaleString("en-AU", { style: "currency", currency: "AUD" })
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })
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
        <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-0">Signed</Badge>
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

interface ContractsViewProps {
  contracts: ContractRow[]
}

export function ContractsView({ contracts }: ContractsViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isPending, startTransition] = useTransition()

  const draftCount = contracts.filter((c) => c.status === "DRAFT").length
  const activeCount = contracts.filter((c) => c.status === "ACTIVE").length
  const closedCount = contracts.filter((c) => c.status === "CLOSED").length
  const disputedCount = contracts.filter((c) => c.status === "DISPUTED").length

  const filtered = contracts.filter((c) => {
    const customerName =
      `${c.booking.customer.firstName} ${c.booking.customer.lastName}`.toLowerCase()
    const vehicleReg = c.booking.vehicle.registrationNo.toLowerCase()
    const matchSearch =
      search.trim() === "" ||
      c.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
      customerName.includes(search.toLowerCase()) ||
      vehicleReg.includes(search.toLowerCase()) ||
      c.booking.bookingNumber.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  function handleVoid(id: string, contractNumber: string) {
    startTransition(async () => {
      try {
        await voidContract(id)
        toast.success(`Contract ${contractNumber} has been voided`)
      } catch {
        toast.error("Failed to void contract")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Contracts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage rental agreements and contract lifecycle
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            toast.info(
              "Contracts are generated from bookings. Create a booking first, then generate a contract from its actions menu."
            )
          }
        >
          <FileText className="h-4 w-4" />
          New Contract
        </Button>
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
            <span className="text-3xl font-bold text-foreground">{draftCount}</span>
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
            <span className="text-3xl font-bold text-green-500">{activeCount}</span>
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
            <span className="text-3xl font-bold text-foreground">{closedCount}</span>
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
            <span className="text-3xl font-bold text-destructive">{disputedCount}</span>
          </CardContent>
        </Card>
      </div>

      {/* Pending Signatures Alert */}
      {draftCount > 0 && (
        <Card className="border-yellow-500/40 bg-yellow-500/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Pending Signatures</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {draftCount} contract{draftCount !== 1 ? "s" : ""} in draft status{" "}
                {draftCount !== 1 ? "are" : "is"} awaiting customer signature before activation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search contracts..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    No contracts found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((contract) => {
                  const depositPercent =
                    contract.depositAmount > 0
                      ? Math.round((contract.depositPaid / contract.depositAmount) * 100)
                      : 0
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="pl-4">
                        <span className="font-mono text-xs text-foreground">
                          {contract.contractNumber}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {contract.booking.customer.firstName}{" "}
                        {contract.booking.customer.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">
                        {contract.booking.vehicle.make} {contract.booking.vehicle.model} (
                        {contract.booking.vehicle.registrationNo})
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {contract.booking.bookingNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={contract.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {fmtAUD(contract.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {fmtAUD(contract.depositPaid)} / {fmtAUD(contract.depositAmount)}
                            </span>
                            <span>{depositPercent}%</span>
                          </div>
                          <Progress value={depositPercent} className="h-1.5 w-28" />
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {fmtDate(contract.createdAt)}
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
                              onClick={() =>
                                toast.info(`Viewing contract ${contract.contractNumber}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toast.info("PDF generation coming soon")
                              }
                            >
                              <Download className="h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            {contract.status !== "CLOSED" && (
                              <>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger
                                    render={
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <X className="h-4 w-4" />
                                        Void Contract
                                      </DropdownMenuItem>
                                    }
                                  />
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Void this contract?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Contract {contract.contractNumber} will be voided. This
                                        action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Keep Contract</AlertDialogCancel>
                                      <AlertDialogAction
                                        variant="destructive"
                                        disabled={isPending}
                                        onClick={() =>
                                          handleVoid(contract.id, contract.contractNumber)
                                        }
                                      >
                                        Yes, Void
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
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
    </div>
  )
}
