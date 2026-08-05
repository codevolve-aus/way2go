"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { updateCompanyDetails } from "./company-actions"
import type { CompanyDetails } from "@/lib/company"

export function CompanyTab({ companyDetails }: { companyDetails: CompanyDetails }) {
  const [form, setForm] = useState(companyDetails)
  const [isPending, startTransition] = useTransition()

  function set<K extends keyof CompanyDetails>(key: K, value: CompanyDetails[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error("Company name is required")
      return
    }
    startTransition(async () => {
      try {
        await updateCompanyDetails(form)
        toast.success("Company details updated")
      } catch {
        toast.error("Failed to update company details")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Company Details</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Shown on invoices, contracts and outgoing correspondence.
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="abn">ABN</Label>
              <Input id="abn" value={form.abn} onChange={(e) => set("abn", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+61 2 0000 0000"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="123 Example Street"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Sydney"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  placeholder="NSW"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={form.postcode}
                  onChange={(e) => set("postcode", e.target.value)}
                  placeholder="2000"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
