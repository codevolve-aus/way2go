import { NextResponse } from "next/server"
import webpush from "web-push"
import { db } from "@/lib/db"
import { notifyTeam } from "@/lib/notifications-actions"

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

// Push reminders for upcoming pickups (existing behaviour) — unaffected by
// the notification prefs below, which only gate the team *email* alerts.
async function sendPickupPushReminders(now: Date, windowEnd: Date) {
  const push = getWebPush()
  if (!push) return { sent: 0, subscriptions: 0, skipped: "VAPID keys not configured" as const }

  const bookings = await db.booking.findMany({
    where: {
      pickupDate: { gte: now, lte: windowEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
      pickupReminderSentAt: null,
    },
    include: { customer: true, vehicle: true },
  })

  if (bookings.length === 0) return { sent: 0, subscriptions: 0 }

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

  return { sent, subscriptions: subscriptions.length }
}

// Team email alert for active rentals whose return is coming up — gated by
// the "Return Reminder" toggle in Settings → Notifications.
async function sendReturnReminders(now: Date, windowEnd: Date) {
  const bookings = await db.booking.findMany({
    where: {
      returnDate: { gte: now, lte: windowEnd },
      status: "ACTIVE",
      returnReminderSentAt: null,
    },
    include: { customer: true, vehicle: true },
  })

  let sent = 0
  for (const booking of bookings) {
    await notifyTeam("returnReminder", `Return Due Soon — ${booking.bookingNumber}`, [
      { label: "Booking", value: booking.bookingNumber },
      { label: "Customer", value: `${booking.customer.firstName} ${booking.customer.lastName}` },
      { label: "Vehicle", value: `${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}` },
      {
        label: "Return due",
        value: booking.returnDate.toLocaleString("en-AU", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Australia/Sydney",
        }),
      },
    ])
    await db.booking.update({ where: { id: booking.id }, data: { returnReminderSentAt: now } })
    sent++
  }

  return { sent, checked: bookings.length }
}

// Team email alert for scheduled vehicle maintenance coming up — gated by
// the "Maintenance Due" toggle in Settings → Notifications.
async function sendMaintenanceDueReminders(now: Date, windowEnd: Date) {
  const records = await db.maintenanceRecord.findMany({
    where: {
      scheduledDate: { gte: now, lte: windowEnd },
      status: "SCHEDULED",
      dueReminderSentAt: null,
    },
    include: { vehicle: true },
  })

  let sent = 0
  for (const record of records) {
    await notifyTeam("maintenanceDue", `Maintenance Due Soon — ${record.vehicle.make} ${record.vehicle.model}`, [
      { label: "Vehicle", value: `${record.vehicle.year} ${record.vehicle.make} ${record.vehicle.model}` },
      { label: "Registration", value: record.vehicle.registrationNo },
      { label: "Type", value: record.type },
      {
        label: "Scheduled",
        value: record.scheduledDate.toLocaleString("en-AU", {
          dateStyle: "medium",
          timeZone: "Australia/Sydney",
        }),
      },
    ])
    await db.maintenanceRecord.update({ where: { id: record.id }, data: { dueReminderSentAt: now } })
    sent++
  }

  return { sent, checked: records.length }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const now = new Date()
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000)

  const [pickupPush, returnReminders, maintenanceReminders] = await Promise.all([
    sendPickupPushReminders(now, windowEnd),
    sendReturnReminders(now, windowEnd),
    sendMaintenanceDueReminders(now, windowEnd),
  ])

  return NextResponse.json({ pickupPush, returnReminders, maintenanceReminders })
}
