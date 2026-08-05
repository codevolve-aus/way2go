"use client"

import { useState, useTransition } from "react"
import { PenLine, Plus, Power, PowerOff } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { createLocation, updateLocation, setLocationActive } from "./locations-actions"
import type { Location } from "@/generated/prisma"

const emptyForm = {
  name: "",
  address: "",
  city: "",
  state: "",
  postcode: "",
  phone: "",
}

function DeactivateButton({ location }: { location: Location }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setTimeout(() => setOpen(true), 0)}
      >
        <PowerOff className="h-4 w-4" />
        Deactivate
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate &quot;{location.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This location will no longer appear as a pickup option on the public site. It stays
              on record and can be reactivated at any time.
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
                    await setLocationActive(location.id, false)
                    toast.success(`${location.name} deactivated`)
                    setOpen(false)
                  } catch {
                    toast.error("Failed to deactivate location")
                  }
                })
              }
            >
              {isPending ? "Deactivating…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ActivateButton({ location }: { location: Location }) {
  const [isPending, startTransition] = useTransition()
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await setLocationActive(location.id, true)
            toast.success(`${location.name} activated`)
          } catch {
            toast.error("Failed to activate location")
          }
        })
      }
    >
      <Power className="h-4 w-4" />
      {isPending ? "Activating…" : "Activate"}
    </Button>
  )
}

export function LocationsTab({ locations }: { locations: Location[] }) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isPending, startTransition] = useTransition()

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(loc: Location) {
    setEditingId(loc.id)
    setForm({
      name: loc.name,
      address: loc.address,
      city: loc.city,
      state: loc.state,
      postcode: loc.postcode,
      phone: loc.phone ?? "",
    })
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) {
      toast.error("Name, address and city are required")
      return
    }
    startTransition(async () => {
      try {
        if (editingId) {
          await updateLocation(editingId, form)
          toast.success("Location updated")
        } else {
          await createLocation(form)
          toast.success("Location added")
        }
        setOpen(false)
        setForm(emptyForm)
      } catch {
        toast.error(editingId ? "Failed to update location" : "Failed to add location")
      }
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Branch Locations</CardTitle>
        <Button size="sm" variant="outline" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {locations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">
            No locations yet — add your first branch above.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="pl-4 font-medium text-foreground">{loc.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {loc.address}, {loc.city} {loc.state} {loc.postcode}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{loc.phone || "—"}</TableCell>
                  <TableCell>
                    {loc.isActive ? (
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
                      <Button variant="ghost" size="sm" onClick={() => setTimeout(() => openEdit(loc), 0)}>
                        <PenLine className="h-4 w-4" />
                        Edit
                      </Button>
                      {loc.isActive ? (
                        <DeactivateButton location={loc} />
                      ) : (
                        <ActivateButton location={loc} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit Location" : "Add Location"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 px-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Sydney CBD"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Street Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="123 Example Street"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Sydney"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    placeholder="NSW"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Postcode</Label>
                  <Input
                    value={form.postcode}
                    onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))}
                    placeholder="2000"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Phone (optional)</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+61 2 0000 0000"
              />
            </div>
            <SheetFooter className="px-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? editingId ? "Saving…" : "Adding…"
                  : editingId ? "Save Changes" : "Add Location"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </Card>
  )
}
