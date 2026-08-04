"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"

export interface PushSubscriptionInput {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export async function subscribeToPushNotifications(sub: PushSubscriptionInput) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await db.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userEmail: session.user.email,
    },
    update: {
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userEmail: session.user.email,
    },
  })
}

export async function unsubscribeFromPushNotifications(endpoint: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await db.pushSubscription.deleteMany({ where: { endpoint } })
}
