import { NextResponse } from "next/server"
import webpush from "web-push"
import { db } from "@/lib/db"

const REMINDER_WINDOW_HOURS = 36

function getWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return null

  webpush.setVapidDetails(
    `mailto:${process.env.ADMIN_EMAIL ?? "info@wayzo.com.au"}`,
    publicKey,
    privateKey
  )
  return webpush
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const push = getWebPush()
  if (!push) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 })
  }

  const now = new Date()
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000)

  const bookings = await db.booking.findMany({
    where: {
      pickupDate: { gte: now, lte: windowEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
      pickupReminderSentAt: null,
    },
    include: { customer: true, vehicle: true },
  })

  if (bookings.length === 0) {
    return NextResponse.json({ sent: 0, subscriptions: 0 })
  }

  const subscriptions = await db.pushSubscription.findMany()

  let sent = 0
  for (const booking of bookings) {
    const pickup = booking.pickupDate.toLocaleString("en-AU", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Australia/Sydney",
    })
    const payload = JSON.stringify({
      title: "Upcoming pickup",
      body: `${booking.customer.firstName} ${booking.customer.lastName} — ${booking.vehicle.make} ${booking.vehicle.model} — ${pickup}`,
      url: "/admin/bookings",
    })

    for (const sub of subscriptions) {
      try {
        await push.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await db.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
        }
      }
    }

    await db.booking.update({
      where: { id: booking.id },
      data: { pickupReminderSentAt: now },
    })
    sent++
  }

  return NextResponse.json({ sent, subscriptions: subscriptions.length })
}
