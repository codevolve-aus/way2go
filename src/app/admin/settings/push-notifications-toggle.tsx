"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "@/lib/push-actions"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

type Status = "checking" | "unsupported" | "enabled" | "disabled"

export function PushNotificationsToggle() {
  const [status, setStatus] = useState<Status>("checking")
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported")
        return
      }
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      setStatus(sub ? "enabled" : "disabled")
    }
    check()
  }, [])

  async function handleEnable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!publicKey) {
      toast.error("Push notifications aren't configured yet.")
      return
    }
    setIsPending(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
      const json = sub.toJSON()
      if (!json.keys?.p256dh || !json.keys?.auth) throw new Error("Missing subscription keys")
      await subscribeToPushNotifications({
        endpoint: sub.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      })
      setStatus("enabled")
      toast.success("Pickup reminders enabled on this device")
    } catch {
      toast.error("Couldn't enable push notifications — check your browser's notification permission.")
    } finally {
      setIsPending(false)
    }
  }

  async function handleDisable() {
    setIsPending(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      if (sub) {
        await unsubscribeFromPushNotifications(sub.endpoint)
        await sub.unsubscribe()
      }
      setStatus("disabled")
      toast.success("Pickup reminders disabled on this device")
    } catch {
      toast.error("Couldn't disable push notifications")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium">Pickup Reminders (this device)</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Get a push notification roughly a day before a booking&apos;s pickup time. Requires the
          app to be installed (Settings &rarr; Install App / Add to Home Screen).
        </p>
      </div>
      {status === "unsupported" && (
        <span className="text-xs text-muted-foreground shrink-0 ml-4">Not supported here</span>
      )}
      {status === "checking" && (
        <span className="text-xs text-muted-foreground shrink-0 ml-4">Checking&hellip;</span>
      )}
      {status === "disabled" && (
        <Button size="sm" onClick={handleEnable} disabled={isPending} className="shrink-0 ml-4">
          {isPending ? "Enabling…" : "Enable"}
        </Button>
      )}
      {status === "enabled" && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleDisable}
          disabled={isPending}
          className="shrink-0 ml-4"
        >
          {isPending ? "Disabling…" : "Disable"}
        </Button>
      )}
    </div>
  )
}
