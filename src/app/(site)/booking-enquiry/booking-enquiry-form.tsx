"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import type { Matcher } from "react-day-picker"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { submitBookingEnquiry } from "../actions"
import { getPriceEstimate, type PriceEstimateResult } from "@/lib/pricing-actions"
import { isValidAustralianPhone } from "@/lib/phone"

interface BookingRange {
  vehicleId: string
  pickupDate: Date
  returnDate: Date
}

function DatePickerField({
  label,
  value,
  onChange,
  bookedRanges = [],
  minDate,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  bookedRanges?: { from: Date; to: Date }[]
  minDate?: Date
  required?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(value + "T12:00:00") : undefined

  function handleSelect(date: Date | undefined) {
    if (!date) return
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    onChange(`${y}-${m}-${d}`)
    setOpen(false)
  }

  const disabledMatchers: Matcher[] = [
    ...bookedRanges,
    ...(minDate ? [{ before: minDate } as Matcher] : []),
  ]

  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Popover open={open} onOpenChange={(o) => setOpen(o)}>
        <PopoverTrigger
          render={
            <Button variant="outline" className="w-full justify-start font-normal">
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              {selected ? (
                format(selected, "dd MMM yyyy")
              ) : (
                <span className="text-muted-foreground">Pick a date</span>
              )}
            </Button>
          }
        />
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={disabledMatchers.length ? disabledMatchers : undefined}
            modifiers={bookedRanges.length ? { booked: bookedRanges } : undefined}
            modifiersClassNames={{ booked: "line-through opacity-50" }}
            defaultMonth={selected ?? new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(amount)
}

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  vehicleId: "",
  pickupLocation: "",
  pickupDate: "",
  pickupTime: "10:00",
  returnDate: "",
  returnTime: "10:00",
  discountCode: "",
  notes: "",
}

export interface InitialValues {
  vehicleId?: string
  pickupLocation?: string
  pickupDate?: string
  returnDate?: string
}

function PriceEstimateCard({ result, isPending }: { result: PriceEstimateResult | null; isPending: boolean }) {
  if (isPending) {
    return <p className="text-sm text-muted-foreground">Calculating your estimate…</p>
  }
  if (!result) return null
  if (!result.ok) {
    return <p className="text-sm text-muted-foreground">{result.error}</p>
  }
  const { breakdown, rateName } = result
  return (
    <Card className="bg-muted/40">
      <CardContent className="pt-6 text-sm space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          Estimated Price — {rateName}
        </p>
        <div className="flex justify-between text-muted-foreground">
          <span>
            {breakdown.nights} night{breakdown.nights === 1 ? "" : "s"}
          </span>
          <span>{formatCurrency(breakdown.baseSubtotal)}</span>
        </div>
        {breakdown.weekendSurcharge > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Day-of-week surcharge</span>
            <span>+{formatCurrency(breakdown.weekendSurcharge)}</span>
          </div>
        )}
        {breakdown.peakSurcharge > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Peak season surcharge</span>
            <span>+{formatCurrency(breakdown.peakSurcharge)}</span>
          </div>
        )}
        {result.discountApplied && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Promo discount</span>
            <span>-{formatCurrency(breakdown.discountAmount)}</span>
          </div>
        )}
        {result.discountError && <p className="text-xs text-destructive">{result.discountError}</p>}
        <div className="flex justify-between text-muted-foreground">
          <span>Service fee</span>
          <span>{formatCurrency(breakdown.serviceFee)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span>{formatCurrency(breakdown.taxAmount)}</span>
        </div>
        <Separator className="my-1" />
        <div className="flex justify-between text-base font-semibold text-foreground">
          <span>Estimated Total</span>
          <span>{formatCurrency(breakdown.total)}</span>
        </div>
        {breakdown.belowMinimum && (
          <p className="text-xs text-destructive pt-1">
            This is shorter than our minimum rental length — we&apos;ll confirm options when we get in touch.
          </p>
        )}
        <p className="text-xs text-muted-foreground pt-1">
          Estimate only — final pricing is confirmed by our team.
        </p>
      </CardContent>
    </Card>
  )
}

interface VehicleOption {
  id: string
  make: string
  model: string
  year: number
  registrationNo: string
  categoryId: string
  seats: number
  transmission: string
  fuelType: string
  description: string | null
  photos: { url: string }[]
}

function vehicleLabel(v: VehicleOption) {
  return `${v.year} ${v.make} ${v.model} (${v.registrationNo})`
}

function VehiclePreview({ vehicle }: { vehicle: VehicleOption }) {
  const photo = vehicle.photos[0]
  return (
    <Card className="bg-muted/40 overflow-hidden py-0">
      <div className="flex gap-3">
        <div className="relative h-24 w-32 shrink-0 bg-muted">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No photo
            </div>
          )}
        </div>
        <CardContent className="flex-1 py-3 pl-0 pr-3 text-sm">
          <p className="font-medium text-foreground">{vehicleLabel(vehicle)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {vehicle.seats} seats &middot; {vehicle.transmission.toLowerCase()} &middot;{" "}
            {vehicle.fuelType.toLowerCase()}
          </p>
          {vehicle.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{vehicle.description}</p>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

export function BookingEnquiryForm({
  vehicles,
  locations,
  bookings,
  initialValues,
}: {
  vehicles: VehicleOption[]
  locations: { id: string; name: string }[]
  bookings: BookingRange[]
  initialValues?: InitialValues
}) {
  const [form, setForm] = useState({ ...emptyForm, ...initialValues })
  const [isPending, startTransition] = useTransition()
  const [estimate, setEstimate] = useState<PriceEstimateResult | null>(null)
  const [isEstimating, startEstimateTransition] = useTransition()
  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId)
  const canEstimate = Boolean(selectedVehicle && form.pickupDate && form.returnDate)

  const bookedRanges = form.vehicleId
    ? bookings
        .filter((b) => b.vehicleId === form.vehicleId)
        .map((b) => ({ from: b.pickupDate, to: b.returnDate }))
    : []

  useEffect(() => {
    if (!canEstimate || !selectedVehicle) return
    const handle = setTimeout(() => {
      startEstimateTransition(async () => {
        const result = await getPriceEstimate({
          categoryId: selectedVehicle.categoryId,
          pickupDate: form.pickupDate,
          pickupTime: form.pickupTime,
          returnDate: form.returnDate,
          returnTime: form.returnTime,
          discountCode: form.discountCode || undefined,
        })
        setEstimate(result)
      })
    }, 350)
    return () => clearTimeout(handle)
  }, [
    canEstimate,
    selectedVehicle,
    form.pickupDate,
    form.pickupTime,
    form.returnDate,
    form.returnTime,
    form.discountCode,
  ])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please enter your first and last name.")
      return
    }
    if (!isValidAustralianPhone(form.phone)) {
      toast.error("Please enter a valid Australian phone number.")
      return
    }
    if (!selectedVehicle) {
      toast.error("Please select a vehicle.")
      return
    }
    if (form.pickupDate && form.returnDate) {
      const pickupDt = new Date(`${form.pickupDate}T${form.pickupTime}:00`)
      const returnDt = new Date(`${form.returnDate}T${form.returnTime}:00`)
      if (returnDt <= pickupDt) {
        toast.error("Return must be after pickup.")
        return
      }
    }
    startTransition(async () => {
      const { error } = await submitBookingEnquiry({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        categoryId: selectedVehicle.categoryId,
        vehicle: vehicleLabel(selectedVehicle),
        pickupLocation: form.pickupLocation,
        pickupDate: form.pickupDate,
        pickupTime: form.pickupTime,
        returnDate: form.returnDate,
        returnTime: form.returnTime,
        discountCode: form.discountCode,
        notes: form.notes,
      })
      if (error) {
        toast.error(error)
        return
      }
      toast.success("Thanks — we've received your enquiry and will confirm availability soon.")
      setForm(emptyForm)
      setEstimate(null)
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:items-start"
    >
      <div className="space-y-4 rounded-2xl bg-card ring-1 ring-foreground/10 p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-first-name">First Name</Label>
            <Input
              id="enquiry-first-name"
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-last-name">Last Name</Label>
            <Input
              id="enquiry-last-name"
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-phone">Phone</Label>
            <Input
              id="enquiry-phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-email">Email</Label>
            <Input
              id="enquiry-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-vehicle">
              Select Vehicle<span className="text-destructive ml-0.5">*</span>
            </Label>
            <Select
              items={vehicles.map((v) => ({ value: v.id, label: vehicleLabel(v) }))}
              value={form.vehicleId}
              onValueChange={(v) => setForm({ ...form, vehicleId: v ?? "" })}
            >
              <SelectTrigger id="enquiry-vehicle" className="w-full">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {vehicleLabel(v)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-location">Pickup Location</Label>
            <Select
              value={form.pickupLocation}
              onValueChange={(v) => setForm({ ...form, pickupLocation: v ?? "" })}
            >
              <SelectTrigger id="enquiry-location" className="w-full">
                <SelectValue placeholder="Select a branch" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l.id} value={l.name}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DatePickerField
            label="Pickup Date"
            value={form.pickupDate}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                pickupDate: v,
                returnDate: f.returnDate && f.returnDate < v ? "" : f.returnDate,
              }))
            }
            bookedRanges={bookedRanges}
            required
          />
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-pickup-time">Pickup Time</Label>
            <Input
              id="enquiry-pickup-time"
              type="time"
              required
              value={form.pickupTime}
              onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DatePickerField
            label="Return Date"
            value={form.returnDate}
            onChange={(v) => setForm({ ...form, returnDate: v })}
            bookedRanges={bookedRanges}
            minDate={form.pickupDate ? new Date(form.pickupDate + "T12:00:00") : undefined}
            required
          />
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-return-time">Return Time</Label>
            <Input
              id="enquiry-return-time"
              type="time"
              required
              value={form.returnTime}
              onChange={(e) => setForm({ ...form, returnTime: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="enquiry-discount">Promo Code (optional)</Label>
          <Input
            id="enquiry-discount"
            value={form.discountCode}
            onChange={(e) => setForm({ ...form, discountCode: e.target.value.toUpperCase() })}
            placeholder="SUMMER20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="enquiry-notes">Notes (optional)</Label>
          <Textarea
            id="enquiry-notes"
            rows={4}
            placeholder="Anything else we should know?"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <Button type="submit" size="xl" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Sending..." : "Send Enquiry"}
        </Button>
      </div>

      <div className="mt-6 lg:mt-0 lg:sticky lg:top-24 space-y-4">
        {selectedVehicle && <VehiclePreview vehicle={selectedVehicle} />}
        {canEstimate && <PriceEstimateCard result={estimate} isPending={isEstimating} />}
        {!selectedVehicle && (
          <Card className="bg-muted/40">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Select a vehicle and your dates to see an estimated price here.
            </CardContent>
          </Card>
        )}
      </div>
    </form>
  )
}
