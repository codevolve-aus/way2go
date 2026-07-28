"use client"

import { useState } from "react"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface RateCard {
  id: string
  category: string
  examples: string
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
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
  category: "ECONOMY",
  dailyRate: "",
  weeklyRate: "",
  depositAmount: "",
}

interface PricingViewProps {
  rateCards: RateCard[]
  extras: Extra[]
  discountCodes: DiscountCode[]
}

export function PricingView({ rateCards, extras, discountCodes }: PricingViewProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyRateForm)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.success("Rate card added successfully")
    setOpen(false)
    setForm(emptyRateForm)
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
        <Button onClick={() => setOpen(true)}>
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
                    <TableHead>Example Vehicles</TableHead>
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
                      <TableCell className="text-sm text-muted-foreground">{rc.examples}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(rc.dailyRate)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(rc.weeklyRate)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(rc.monthlyRate)}</TableCell>
                      <TableCell className="pr-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info(`Editing rate card for ${rc.category}`)}
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
                            <AlertDialog>
                              <AlertDialogTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <X className="h-4 w-4" />
                                    Deactivate
                                  </Button>
                                }
                              />
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
                                    onClick={() => toast.success(`${extra.name} has been deactivated`)}
                                  >
                                    Deactivate
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
                  onClick={() => toast.info("Create discount code form coming soon")}
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
                        <span className="text-muted-foreground"> / {dc.usageLimit}</span>
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
                            <AlertDialog>
                              <AlertDialogTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    Revoke
                                  </Button>
                                }
                              />
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
                                    onClick={() => toast.success(`Code ${dc.code} has been revoked`)}
                                  >
                                    Revoke
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
      </Tabs>

      {/* Add Rate Card Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Rate Card</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 px-4">
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
              <Label>Daily Rate (AUD)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.dailyRate}
                onChange={(e) => setForm((f) => ({ ...f, dailyRate: e.target.value }))}
                placeholder="89.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Weekly Rate (AUD)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.weeklyRate}
                onChange={(e) => setForm((f) => ({ ...f, weeklyRate: e.target.value }))}
                placeholder="540.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Deposit Amount (AUD)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.depositAmount}
                onChange={(e) => setForm((f) => ({ ...f, depositAmount: e.target.value }))}
                placeholder="300.00"
                required
              />
            </div>
            <SheetFooter className="px-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Rate Card</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
