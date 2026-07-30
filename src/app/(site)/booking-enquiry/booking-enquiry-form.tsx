"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
import { submitBookingEnquiry } from "../actions"

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  vehicleCategory: "",
  pickupLocation: "",
  pickupDate: "",
  returnDate: "",
  notes: "",
}

export function BookingEnquiryForm({
  categories,
  locations,
}: {
  categories: { id: string; name: string }[]
  locations: { id: string; name: string }[]
}) {
  const [form, setForm] = useState(emptyForm)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const { error } = await submitBookingEnquiry(form)
      if (error) {
        toast.error(error)
        return
      }
      toast.success("Thanks — we've received your enquiry and will confirm availability soon.")
      setForm(emptyForm)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="enquiry-name">Name</Label>
          <Input
            id="enquiry-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="enquiry-category">Preferred Vehicle</Label>
          <Select
            value={form.vehicleCategory}
            onValueChange={(v) => setForm({ ...form, vehicleCategory: v ?? "" })}
          >
            <SelectTrigger id="enquiry-category" className="w-full">
              <SelectValue placeholder="Any category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
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
        <div className="space-y-1.5">
          <Label htmlFor="enquiry-pickup-date">Pickup Date</Label>
          <Input
            id="enquiry-pickup-date"
            type="date"
            required
            value={form.pickupDate}
            onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="enquiry-return-date">Return Date</Label>
          <Input
            id="enquiry-return-date"
            type="date"
            required
            value={form.returnDate}
            onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
          />
        </div>
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

      <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Sending..." : "Send Enquiry"}
      </Button>
    </form>
  )
}
