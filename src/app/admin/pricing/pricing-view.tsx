"use client"

import { useEffect, useState, useTransition } from "react"
import { PenLine, Tag, Plus, X } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  createRentalRate,
  updateRentalRate,
  createDiscountCode,
  toggleDiscountCode,
} from "./actions"
import { updatePricingRules, getPriceEstimate, type PriceEstimateResult } from "@/lib/pricing-actions"
import type { PricingRules } from "@/lib/pricing"

type CategoryOption = { id: string; name: string }

interface RateCard {
  id: string
  categoryId: string
  category: string
  name: string
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
  isDefault: boolean
  startDate: string
  endDate: string
}

interface Extra {
  id: string
  name: string
  rate: number
  unit: string
  isActive: boolean
}

type DiscountStatus = "Active" | "Expired" | "Exhausted"

interface DiscountCode {
  id: string
  code: string
  discountPercent: number
  usageLimit: number
  usedCount: number
  expiry: string
  status: DiscountStatus
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function DiscountStatusBadge({ status }: { status: DiscountStatus }) {
  switch (status) {
    case "Active":
      return (
        <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-0">Active</Badge>
      )
    case "Expired":
      return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>
    case "Exhausted":
      return <Badge variant="secondary">Exhausted</Badge>
  }
}

const emptyRateForm = {
  categoryId: "",
  name: "",
  dailyRate: "",
  weeklyRate: "",
  monthlyRate: "",
  isDefault: false,
  startDate: "",
  endDate: "",
}

const weekdayLabels = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
]

const emptyCodeForm = {
  code: "",
  discountPct: "",
  usageLimit: "",
  expiresAt: "",
}

function ExtrasDeactivateButton({ extra }: { extra: Extra }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setTimeout(() => setOpen(true), 0)}
      >
        <X className="h-4 w-4" />
        Deactivate
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate &quot;{extra.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This extra will no longer be available for new bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                toast.success(`${extra.name} has been deactivated`)
                setOpen(false)
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function DiscountRevokeButton({
  dc,
  isPending,
  startTransition,
}: {
  dc: DiscountCode
  isPending: boolean
  startTransition: (fn: () => Promise<void>) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setTimeout(() => setOpen(true), 0)}
      >
        Revoke
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke &quot;{dc.code}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This discount code will be revoked and can no longer be used.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await toggleDiscountCode(dc.id, false)
                    toast.success(`Code ${dc.code} has been revoked`)
                    setOpen(false)
                  } catch {
                    toast.error("Failed to revoke code")
                  }
                })
              }
            >
              {isPending ? "Revoking…" : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function PricingPreview({ categories }: { categories: CategoryOption[] }) {
  const [categoryId, setCategoryId] = useState("")
  const [pickupDate, setPickupDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [discountCode, setDiscountCode] = useState("")
  const [result, setResult] = useState<PriceEstimateResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const canEstimate = Boolean(categoryId && pickupDate && returnDate)

  useEffect(() => {
    if (!canEstimate) return
    const handle = setTimeout(() => {
      startTransition(async () => {
        const r = await getPriceEstimate({
          categoryId,
          pickupDate,
          returnDate,
          discountCode: discountCode || undefined,
        })
        setResult(r)
      })
    }, 350)
    return () => clearTimeout(handle)
  }, [canEstimate, categoryId, pickupDate, returnDate, discountCode])

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">Live Preview</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Test how a rate card and the rules above combine for a sample trip.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Pickup</Label>
            <Input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Return</Label>
            <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Promo Code (optional)</Label>
          <Input
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            placeholder="SUMMER20"
          />
        </div>

        {canEstimate && isPending && <p className="text-sm text-muted-foreground">Calculating…</p>}

        {canEstimate && !isPending && result && result.ok && (
          <div className="rounded-lg border border-border p-4 text-sm space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Rate card</span>
              <span>{result.rateName}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>
                {result.breakdown.nights} night{result.breakdown.nights === 1 ? "" : "s"} ·{" "}
                {result.breakdown.baseRateType}
              </span>
              <span>{formatCurrency(result.breakdown.baseSubtotal)}</span>
            </div>
            {result.breakdown.weekendSurcharge > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Weekend surcharge ({result.breakdown.weekendNights} night(s))</span>
                <span>+{formatCurrency(result.breakdown.weekendSurcharge)}</span>
              </div>
            )}
            {result.discountApplied && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span>-{formatCurrency(result.breakdown.discountAmount)}</span>
              </div>
            )}
            {result.discountError && <p className="text-xs text-destructive">{result.discountError}</p>}
            <div className="flex justify-between text-muted-foreground">
              <span>Service fee</span>
              <span>{formatCurrency(result.breakdown.serviceFee)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>{formatCurrency(result.breakdown.taxAmount)}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-semibold text-foreground text-base">
              <span>Total</span>
              <span>{formatCurrency(result.breakdown.total)}</span>
            </div>
            {result.breakdown.belowMinimum && (
              <p className="text-xs text-destructive pt-1">
                Below the configured minimum rental length.
              </p>
            )}
          </div>
        )}

        {canEstimate && !isPending && result && !result.ok && (
          <p className="text-sm text-destructive">{result.error}</p>
        )}
      </CardContent>
    </Card>
  )
}

interface PricingViewProps {
  rateCards: RateCard[]
  extras: Extra[]
  discountCodes: DiscountCode[]
  categories: CategoryOption[]
  pricingRules: PricingRules
}

export function PricingView({ rateCards, extras, discountCodes, categories, pricingRules }: PricingViewProps) {
  const [rateOpen, setRateOpen] = useState(false)
  const [editingRateId, setEditingRateId] = useState<string | null>(null)
  const [rateForm, setRateForm] = useState(emptyRateForm)
  const [codeOpen, setCodeOpen] = useState(false)
  const [codeForm, setCodeForm] = useState(emptyCodeForm)
  const [isPending, startTransition] = useTransition()

  function openAddRate() {
    setEditingRateId(null)
    setRateForm(emptyRateForm)
    setRateOpen(true)
  }

  function openEditRate(rc: RateCard) {
    setEditingRateId(rc.id)
    setRateForm({
      categoryId: rc.categoryId,
      name: rc.name,
      dailyRate: String(rc.dailyRate),
      weeklyRate: rc.weeklyRate ? String(rc.weeklyRate) : "",
      monthlyRate: rc.monthlyRate ? String(rc.monthlyRate) : "",
      isDefault: rc.isDefault,
      startDate: rc.startDate,
      endDate: rc.endDate,
    })
    setRateOpen(true)
  }

  function handleRateSubmit(e: React.FormEvent) {
    e.preventDefault()
    const dailyRate = parseFloat(rateForm.dailyRate)
    if (isNaN(dailyRate)) {
      toast.error("Enter a valid daily rate")
      return
    }
    const weeklyRate = rateForm.weeklyRate ? parseFloat(rateForm.weeklyRate) : undefined
    const monthlyRate = rateForm.monthlyRate ? parseFloat(rateForm.monthlyRate) : undefined
    startTransition(async () => {
      try {
        if (editingRateId) {
          await updateRentalRate(editingRateId, {
            dailyRate,
            weeklyRate,
            monthlyRate,
            isDefault: rateForm.isDefault,
            startDate: rateForm.startDate || undefined,
            endDate: rateForm.endDate || undefined,
          })
          toast.success("Rate card updated successfully")
        } else {
          if (!rateForm.categoryId) {
            toast.error("Please select a category")
            return
          }
          await createRentalRate({
            categoryId: rateForm.categoryId,
            name: rateForm.name,
            dailyRate,
            weeklyRate,
            monthlyRate,
            isDefault: rateForm.isDefault,
            startDate: rateForm.startDate || undefined,
            endDate: rateForm.endDate || undefined,
          })
          toast.success("Rate card added successfully")
        }
        setRateOpen(false)
        setRateForm(emptyRateForm)
      } catch {
        toast.error(editingRateId ? "Failed to update rate card" : "Failed to add rate card")
      }
    })
  }

  const [rulesForm, setRulesForm] = useState(pricingRules)
  const [isSavingRules, startRulesTransition] = useTransition()

  function toggleWeekendDay(day: number) {
    setRulesForm((f) => ({
      ...f,
      weekendDays: f.weekendDays.includes(day)
        ? f.weekendDays.filter((d) => d !== day)
        : [...f.weekendDays, day].sort(),
    }))
  }

  function handleRulesSubmit(e: React.FormEvent) {
    e.preventDefault()
    startRulesTransition(async () => {
      try {
        await updatePricingRules(rulesForm)
        toast.success("Pricing rules updated")
      } catch {
        toast.error("Failed to update pricing rules")
      }
    })
  }

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!codeForm.code.trim()) {
      toast.error("Please enter a code")
      return
    }
    startTransition(async () => {
      try {
        await createDiscountCode({
          code: codeForm.code,
          discountPct: codeForm.discountPct ? parseFloat(codeForm.discountPct) : undefined,
          usageLimit: codeForm.usageLimit ? parseInt(codeForm.usageLimit, 10) : undefined,
          expiresAt: codeForm.expiresAt || undefined,
        })
        toast.success(`Discount code ${codeForm.code.toUpperCase()} created`)
        setCodeOpen(false)
        setCodeForm(emptyCodeForm)
      } catch {
        toast.error("Failed to create discount code")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pricing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage rate cards, extras and promotional codes
          </p>
        </div>
        <Button onClick={openAddRate}>
          <Tag className="h-4 w-4" />
          Add Rate Card
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rate-cards">
        <TabsList>
          <TabsTrigger value="rate-cards">Rate Cards</TabsTrigger>
          <TabsTrigger value="extras">Extras</TabsTrigger>
          <TabsTrigger value="discount-codes">Discount Codes</TabsTrigger>
          <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
        </TabsList>

        {/* ---- Rate Cards Tab ---- */}
        <TabsContent value="rate-cards" className="mt-4">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-medium">Vehicle Category Rate Cards</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Category</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Daily</TableHead>
                    <TableHead className="text-right">Weekly</TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                    <TableHead className="pr-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateCards.map((rc) => (
                    <TableRow key={rc.id}>
                      <TableCell className="pl-4 font-medium text-foreground">{rc.category}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {rc.name}
                        {rc.isDefault && (
                          <Badge variant="secondary" className="ml-2 align-middle">Default</Badge>
                        )}
                        {(rc.startDate || rc.endDate) && (
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {formatDate(rc.startDate)} – {formatDate(rc.endDate)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(rc.dailyRate)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(rc.weeklyRate)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(rc.monthlyRate)}</TableCell>
                      <TableCell className="pr-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTimeout(() => openEditRate(rc), 0)}
                        >
                          <PenLine className="h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Extras Tab ---- */}
        <TabsContent value="extras" className="mt-4">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Optional Extras</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info("Add extra form coming soon")}
                >
                  <Plus className="h-4 w-4" />
                  Add Extra
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Extra</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead>Per</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extras.map((extra) => (
                    <TableRow key={extra.id}>
                      <TableCell className="pl-4 font-medium text-foreground">{extra.name}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatCurrency(extra.rate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm capitalize">
                        {extra.unit}
                      </TableCell>
                      <TableCell>
                        {extra.isActive ? (
                          <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-0">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info(`Editing extra: ${extra.name}`)}
                          >
                            <PenLine className="h-4 w-4" />
                            Edit
                          </Button>
                          {extra.isActive && (
                            <ExtrasDeactivateButton extra={extra} />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Discount Codes Tab ---- */}
        <TabsContent value="discount-codes" className="mt-4">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Promotional Codes</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCodeOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Code
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Code</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Usage</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountCodes.map((dc) => (
                    <TableRow key={dc.id}>
                      <TableCell className="pl-4">
                        <span className="font-mono text-sm font-medium text-foreground tracking-wide">
                          {dc.code}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium text-foreground">
                        {dc.discountPercent}%
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="tabular-nums text-foreground">{dc.usedCount}</span>
                        <span className="text-muted-foreground"> / {dc.usageLimit || "∞"}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(dc.expiry)}
                      </TableCell>
                      <TableCell>
                        <DiscountStatusBadge status={dc.status} />
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info(`Editing code ${dc.code}`)}
                          >
                            <PenLine className="h-4 w-4" />
                            Edit
                          </Button>
                          <Separator orientation="vertical" className="h-4 mx-0.5" />
                          {dc.status === "Active" ? (
                            <DiscountRevokeButton
                              dc={dc}
                              isPending={isPending}
                              startTransition={startTransition}
                            />
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground"
                              disabled
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Pricing Rules Tab ---- */}
        <TabsContent value="rules" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-medium">Global Pricing Rules</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Applied on top of every rate card when estimating a price.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRulesSubmit} className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Weekend Surcharge (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={rulesForm.weekendSurchargePct}
                        onChange={(e) =>
                          setRulesForm((f) => ({ ...f, weekendSurchargePct: parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Minimum Rental (days)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={rulesForm.minRentalDays}
                        onChange={(e) =>
                          setRulesForm((f) => ({ ...f, minRentalDays: parseInt(e.target.value, 10) || 0 }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Service Fee (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={rulesForm.serviceFeePct}
                        onChange={(e) =>
                          setRulesForm((f) => ({ ...f, serviceFeePct: parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tax Rate (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={rulesForm.taxRatePct}
                        onChange={(e) =>
                          setRulesForm((f) => ({ ...f, taxRatePct: parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Weekend Nights</Label>
                    <p className="text-xs text-muted-foreground">
                      Nights on these days carry the weekend surcharge above.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {weekdayLabels.map((d) => {
                        const active = rulesForm.weekendDays.includes(d.value)
                        return (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => toggleWeekendDay(d.value)}
                            className={`h-8 px-3 rounded-md text-xs font-medium border transition-colors ${
                              active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-transparent text-muted-foreground border-input hover:bg-muted"
                            }`}
                          >
                            {d.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSavingRules}>
                      {isSavingRules ? "Saving…" : "Save Rules"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <PricingPreview categories={categories} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Add / Edit Rate Card Sheet */}
      <Sheet open={rateOpen} onOpenChange={setRateOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingRateId ? "Edit Rate Card" : "Add Rate Card"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleRateSubmit} className="flex flex-col gap-4 py-4 px-4">
            {!editingRateId && (
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={rateForm.categoryId}
                  onValueChange={(v) => setRateForm((f) => ({ ...f, categoryId: v ?? "" }))}
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
            )}
            {!editingRateId && (
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={rateForm.name}
                  onChange={(e) => setRateForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Economy Standard"
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Daily Rate (AUD)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={rateForm.dailyRate}
                onChange={(e) => setRateForm((f) => ({ ...f, dailyRate: e.target.value }))}
                placeholder="89.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Weekly Rate (AUD, optional)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={rateForm.weeklyRate}
                onChange={(e) => setRateForm((f) => ({ ...f, weeklyRate: e.target.value }))}
                placeholder="540.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Monthly Rate (AUD, optional)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={rateForm.monthlyRate}
                onChange={(e) => setRateForm((f) => ({ ...f, monthlyRate: e.target.value }))}
                placeholder="1800.00"
              />
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Seasonal Window (optional)
              </Label>
              <p className="text-xs text-muted-foreground">
                Leave blank for a year-round rate. If set, this rate applies only to bookings
                that pick up within this window and takes priority over the default rate.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={rateForm.startDate}
                  onChange={(e) => setRateForm((f) => ({ ...f, startDate: e.target.value }))}
                />
                <Input
                  type="date"
                  value={rateForm.endDate}
                  onChange={(e) => setRateForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={rateForm.isDefault}
                onChange={(e) => setRateForm((f) => ({ ...f, isDefault: e.target.checked }))}
              />
              Default rate for this category
            </label>
            <SheetFooter className="px-0">
              <Button type="button" variant="outline" onClick={() => setRateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? editingRateId ? "Saving…" : "Adding…"
                  : editingRateId ? "Save Changes" : "Add Rate Card"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Create Discount Code Sheet */}
      <Sheet open={codeOpen} onOpenChange={setCodeOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create Discount Code</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4 py-4 px-4">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input
                value={codeForm.code}
                onChange={(e) => setCodeForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER20"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Discount % (optional)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={codeForm.discountPct}
                onChange={(e) => setCodeForm((f) => ({ ...f, discountPct: e.target.value }))}
                placeholder="20"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Usage Limit (optional)</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={codeForm.usageLimit}
                onChange={(e) => setCodeForm((f) => ({ ...f, usageLimit: e.target.value }))}
                placeholder="100"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Expires At (optional)</Label>
              <Input
                type="date"
                value={codeForm.expiresAt}
                onChange={(e) => setCodeForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
            <SheetFooter className="px-0">
              <Button type="button" variant="outline" onClick={() => setCodeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create Code"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
