"use client"

import { useRef, useState, useTransition } from "react"
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
  CarFront,
  KeyRound,
  Upload,
  Gauge,
  Fuel,
  Route,
} from "lucide-react"
import { toast } from "sonner"
import type {
  Contract,
  Booking,
  Customer,
  Vehicle,
  ContractStatus,
  FuelLevel,
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
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  voidContract,
  uploadContractPhoto,
  recordCollection,
  recordReturn,
} from "./actions"

const FUEL_LEVEL_LABELS: Record<FuelLevel, string> = {
  EMPTY: "Empty",
  QUARTER: "1/4",
  HALF: "1/2",
  THREE_QUARTER: "3/4",
  FULL: "Full",
}

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

function parsePhotos(json: string | null): string[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}

function ContractViewDialog({
  contract,
  onOpenChange,
}: {
  contract: ContractRow | null
  onOpenChange: (open: boolean) => void
}) {
  const prePhotos = contract ? parsePhotos(contract.preConditionPhotos) : []
  const postPhotos = contract ? parsePhotos(contract.postConditionPhotos) : []

  return (
    <Dialog open={contract !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {contract && (
          <>
            <DialogHeader>
              <DialogTitle>Contract {contract.contractNumber}</DialogTitle>
              <DialogDescription>
                {contract.booking.vehicle.make} {contract.booking.vehicle.model} (
                {contract.booking.vehicle.registrationNo}) &middot;{" "}
                {contract.booking.customer.firstName} {contract.booking.customer.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={contract.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Booking #</span>
                <span className="font-mono text-xs">{contract.booking.bookingNumber}</span>
              </div>

              {contract.pickupOdometer != null && contract.returnOdometer != null && (
                <div className="rounded-lg bg-primary/5 ring-1 ring-primary/20 p-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Route className="h-4 w-4 text-primary" />
                    Total Distance Driven
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {(contract.returnOdometer - contract.pickupOdometer).toLocaleString()} km
                  </span>
                </div>
              )}

              <div className="rounded-lg border border-border p-3 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5" />
                  Collection
                </p>
                {contract.pickupOdometer != null ? (
                  <>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        {contract.pickupOdometer.toLocaleString()} km
                      </span>
                      {contract.preRentalFuelLevel && (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Fuel className="h-4 w-4" />
                          {FUEL_LEVEL_LABELS[contract.preRentalFuelLevel]}
                        </span>
                      )}
                    </div>
                    {contract.preConditionNotes && (
                      <p className="text-sm text-muted-foreground">{contract.preConditionNotes}</p>
                    )}
                    {prePhotos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {prePhotos.map((url) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={url}
                            src={url}
                            alt=""
                            className="aspect-square rounded-lg object-cover ring-1 ring-foreground/10"
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Not yet recorded.</p>
                )}
              </div>

              <div className="rounded-lg border border-border p-3 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <CarFront className="h-3.5 w-3.5" />
                  Return
                </p>
                {contract.returnOdometer != null ? (
                  <>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        {contract.returnOdometer.toLocaleString()} km
                      </span>
                      {contract.postRentalFuelLevel && (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Fuel className="h-4 w-4" />
                          {FUEL_LEVEL_LABELS[contract.postRentalFuelLevel]}
                        </span>
                      )}
                    </div>
                    {contract.postConditionNotes && (
                      <p className="text-sm text-muted-foreground">{contract.postConditionNotes}</p>
                    )}
                    {postPhotos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {postPhotos.map((url) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={url}
                            src={url}
                            alt=""
                            className="aspect-square rounded-lg object-cover ring-1 ring-foreground/10"
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Not yet recorded.</p>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ConditionPhotoField({
  contractId,
  phase,
  photoUrls,
  onChange,
}: {
  contractId: string
  phase: "pre" | "post"
  photoUrls: string[]
  onChange: (urls: string[]) => void
}) {
  const [isUploading, startUpload] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    startUpload(async () => {
      try {
        const uploaded = await Promise.all(
          files.map((file) => {
            const formData = new FormData()
            formData.append("file", file)
            return uploadContractPhoto(contractId, phase, formData)
          })
        )
        onChange([...photoUrls, ...uploaded])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to upload photo")
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    })
  }

  return (
    <div className="space-y-2">
      <Label>Photos</Label>
      {photoUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {photoUrls.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(photoUrls.filter((u) => u !== url))}
                className="absolute top-1 right-1 rounded-full bg-background/90 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {isUploading ? "Uploading…" : "Add Photos"}
      </Button>
    </div>
  )
}

function RecordCollectionDialog({
  contract,
  open,
  onOpenChange,
}: {
  contract: ContractRow
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [odometer, setOdometer] = useState("")
  const [fuelLevel, setFuelLevel] = useState<FuelLevel | "">("")
  const [notes, setNotes] = useState("")
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!odometer || !fuelLevel) {
      toast.error("Please enter the odometer reading and fuel level.")
      return
    }
    startTransition(async () => {
      try {
        await recordCollection(contract.id, {
          pickupOdometer: Number(odometer),
          preRentalFuelLevel: fuelLevel as FuelLevel,
          preConditionNotes: notes || undefined,
          photoUrls,
        })
        toast.success(`Vehicle collection recorded for ${contract.contractNumber}`)
        onOpenChange(false)
      } catch {
        toast.error("Failed to record collection")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Vehicle Collection</DialogTitle>
          <DialogDescription>
            {contract.booking.vehicle.make} {contract.booking.vehicle.model} (
            {contract.booking.vehicle.registrationNo}) &middot;{" "}
            {contract.booking.customer.firstName} {contract.booking.customer.lastName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="collect-odometer">
              Odometer Reading (km)<span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="collect-odometer"
              type="number"
              min={0}
              step="1"
              required
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="collect-fuel">
              Fuel Level<span className="text-destructive ml-0.5">*</span>
            </Label>
            <Select
              items={Object.entries(FUEL_LEVEL_LABELS).map(([value, label]) => ({ value, label }))}
              value={fuelLevel}
              onValueChange={(v) => setFuelLevel((v ?? "") as FuelLevel)}
            >
              <SelectTrigger id="collect-fuel" className="w-full">
                <SelectValue placeholder="Select fuel level" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FUEL_LEVEL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ConditionPhotoField
            contractId={contract.id}
            phase="pre"
            photoUrls={photoUrls}
            onChange={setPhotoUrls}
          />
          <div className="space-y-1.5">
            <Label htmlFor="collect-notes">Condition Notes</Label>
            <Textarea
              id="collect-notes"
              rows={3}
              placeholder="Existing scratches, dents, warning lights, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Confirm Collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RecordReturnDialog({
  contract,
  open,
  onOpenChange,
}: {
  contract: ContractRow
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [odometer, setOdometer] = useState("")
  const [fuelLevel, setFuelLevel] = useState<FuelLevel | "">("")
  const [notes, setNotes] = useState("")
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!odometer || !fuelLevel) {
      toast.error("Please enter the odometer reading and fuel level.")
      return
    }
    const value = Number(odometer)
    if (contract.pickupOdometer != null && value < contract.pickupOdometer) {
      toast.error(
        `Return odometer must be at least ${contract.pickupOdometer.toLocaleString()} km (the pickup reading).`
      )
      return
    }
    startTransition(async () => {
      try {
        await recordReturn(contract.id, {
          returnOdometer: value,
          postRentalFuelLevel: fuelLevel as FuelLevel,
          postConditionNotes: notes || undefined,
          photoUrls,
        })
        toast.success(`Vehicle return recorded for ${contract.contractNumber}`)
        onOpenChange(false)
      } catch {
        toast.error("Failed to record return")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Vehicle Return</DialogTitle>
          <DialogDescription>
            {contract.booking.vehicle.make} {contract.booking.vehicle.model} (
            {contract.booking.vehicle.registrationNo}) &middot;{" "}
            {contract.booking.customer.firstName} {contract.booking.customer.lastName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="return-odometer">
              Odometer Reading (km)<span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="return-odometer"
              type="number"
              min={contract.pickupOdometer ?? 0}
              step="1"
              required
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
            />
            {contract.pickupOdometer != null && (
              <p className="text-xs text-muted-foreground">
                Pickup reading was {contract.pickupOdometer.toLocaleString()} km
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="return-fuel">
              Fuel Level<span className="text-destructive ml-0.5">*</span>
            </Label>
            <Select
              items={Object.entries(FUEL_LEVEL_LABELS).map(([value, label]) => ({ value, label }))}
              value={fuelLevel}
              onValueChange={(v) => setFuelLevel((v ?? "") as FuelLevel)}
            >
              <SelectTrigger id="return-fuel" className="w-full">
                <SelectValue placeholder="Select fuel level" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FUEL_LEVEL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ConditionPhotoField
            contractId={contract.id}
            phase="post"
            photoUrls={photoUrls}
            onChange={setPhotoUrls}
          />
          <div className="space-y-1.5">
            <Label htmlFor="return-notes">Condition Notes</Label>
            <Textarea
              id="return-notes"
              rows={3}
              placeholder="New damage, cleanliness, missing items, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Confirm Return"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ContractActionsMenu({
  contract,
  isPending,
  onVoid,
  onView,
}: {
  contract: ContractRow
  isPending: boolean
  onVoid: () => void
  onView: () => void
}) {
  const [voidOpen, setVoidOpen] = useState(false)
  const [collectionOpen, setCollectionOpen] = useState(false)
  const [collectionKey, setCollectionKey] = useState(0)
  const [returnOpen, setReturnOpen] = useState(false)
  const [returnKey, setReturnKey] = useState(0)

  return (
    <>
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
          <DropdownMenuItem onClick={onView}>
            <Eye className="h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("PDF generation coming soon")}>
            <Download className="h-4 w-4" />
            Download PDF
          </DropdownMenuItem>
          {(contract.status === "DRAFT" || contract.status === "SIGNED") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  setTimeout(() => {
                    setCollectionKey((k) => k + 1)
                    setCollectionOpen(true)
                  }, 0)
                }
              >
                <KeyRound className="h-4 w-4" />
                Record Collection
              </DropdownMenuItem>
            </>
          )}
          {contract.status === "ACTIVE" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  setTimeout(() => {
                    setReturnKey((k) => k + 1)
                    setReturnOpen(true)
                  }, 0)
                }
              >
                <CarFront className="h-4 w-4" />
                Record Return
              </DropdownMenuItem>
            </>
          )}
          {contract.status !== "CLOSED" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setTimeout(() => setVoidOpen(true), 0)}
              >
                <X className="h-4 w-4" />
                Void Contract
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <RecordCollectionDialog
        key={collectionKey}
        contract={contract}
        open={collectionOpen}
        onOpenChange={setCollectionOpen}
      />
      <RecordReturnDialog
        key={returnKey}
        contract={contract}
        open={returnOpen}
        onOpenChange={setReturnOpen}
      />

      <AlertDialog open={voidOpen} onOpenChange={setVoidOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void this contract?</AlertDialogTitle>
            <AlertDialogDescription>
              Contract {contract.contractNumber} will be voided. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Contract</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={() => { onVoid(); setVoidOpen(false) }}
            >
              Yes, Void
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface ContractsViewProps {
  contracts: ContractRow[]
}

export function ContractsView({ contracts }: ContractsViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isPending, startTransition] = useTransition()
  const [viewContract, setViewContract] = useState<ContractRow | null>(null)

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
        <Select
          items={[
            { value: "all", label: "All Statuses" },
            { value: "draft", label: "Draft" },
            { value: "signed", label: "Signed" },
            { value: "active", label: "Active" },
            { value: "closed", label: "Closed" },
            { value: "disputed", label: "Disputed" },
          ]}
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        >
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
                        <ContractActionsMenu
                          contract={contract}
                          isPending={isPending}
                          onVoid={() => handleVoid(contract.id, contract.contractNumber)}
                          onView={() => setViewContract(contract)}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ContractViewDialog
        contract={viewContract}
        onOpenChange={(open) => { if (!open) setViewContract(null) }}
      />
    </div>
  )
}
