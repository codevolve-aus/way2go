"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { updateNotificationPrefs } from "@/lib/notifications-actions"
import type { NotificationPrefs } from "@/lib/notifications"

const events: { id: keyof NotificationPrefs; label: string; description: string }[] = [
  {
    id: "bookingConfirmed",
    label: "Booking Confirmed",
    description: "Send a team alert when a booking is confirmed",
  },
  {
    id: "contractReady",
    label: "Contract Ready",
    description: "Send a team alert when a rental agreement is sent to a customer",
  },
  {
    id: "returnReminder",
    label: "Return Reminder",
    description: "Send a team alert roughly a day before an active rental's return is due",
  },
  {
    id: "paymentReceived",
    label: "Payment Received",
    description: "Send a team alert when a payment is recorded against a booking",
  },
  {
    id: "maintenanceDue",
    label: "Maintenance Due",
    description: "Send a team alert roughly a day before scheduled vehicle maintenance is due",
  },
]

export function EmailNotificationsCard({ prefs }: { prefs: NotificationPrefs }) {
  const [form, setForm] = useState(prefs)
  const [isPending, startTransition] = useTransition()

  function toggle(id: keyof NotificationPrefs) {
    setForm((f) => ({ ...f, [id]: !f[id] }))
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateNotificationPrefs(form)
        toast.success("Notification preferences updated")
      } catch {
        toast.error("Failed to update notification preferences")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Email Notifications</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Choose which events send an internal alert to your team&apos;s notification inbox
          (separate from the booking/contract emails customers always receive).
        </p>
      </CardHeader>
      <CardContent className="space-y-0">
        {events.map((n, idx) => (
          <div key={n.id}>
            {idx > 0 && <Separator />}
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={form[n.id]}
                  onChange={() => toggle(n.id)}
                />
                <div className="h-5 w-9 rounded-full border border-border bg-muted transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
              </label>
            </div>
          </div>
        ))}
        <Separator />
        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
