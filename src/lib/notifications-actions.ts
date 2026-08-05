"use server"

import { Resend } from "resend"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import {
  DEFAULT_NOTIFICATION_PREFS,
  type NotificationPrefs,
} from "@/lib/notifications"

const NOTIFICATION_PREFS_KEY = "notification_prefs"

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const row = await db.setting.findUnique({ where: { key: NOTIFICATION_PREFS_KEY } })
    if (!row) return DEFAULT_NOTIFICATION_PREFS
    return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(row.value) }
  } catch {
    return DEFAULT_NOTIFICATION_PREFS
  }
}

export async function updateNotificationPrefs(prefs: NotificationPrefs) {
  await db.setting.upsert({
    where: { key: NOTIFICATION_PREFS_KEY },
    create: { key: NOTIFICATION_PREFS_KEY, value: JSON.stringify(prefs) },
    update: { value: JSON.stringify(prefs) },
  })
  revalidatePath("/admin/settings")
}

const fromEmail = process.env.RESEND_FROM_EMAIL ?? "WayZo Rentals <noreply@wayzo.com.au>"
const teamEmail = process.env.CONTACT_EMAIL ?? process.env.ADMIN_EMAIL

function teamNotificationHtml(title: string, rows: { label: string; value: string }[]) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111827">
      <div style="background:#1e40af;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">${title}</h1>
        <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">WayZo Admin notification</p>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <table style="width:100%;font-size:13px;border-collapse:collapse">
          ${rows
            .filter((r) => r.value)
            .map(
              (r) => `
            <tr>
              <td style="padding:6px 0;color:#6b7280;width:160px;vertical-align:top">${r.label}</td>
              <td style="padding:6px 0;font-weight:600">${r.value.replace(/\n/g, "<br/>")}</td>
            </tr>`
            )
            .join("")}
        </table>
      </div>
    </div>
  `
}

// Best-effort: never throws. A misconfigured/unavailable mail provider
// shouldn't block the booking/payment/contract action that triggered it.
export async function notifyTeam(
  event: keyof NotificationPrefs,
  subject: string,
  rows: { label: string; value: string }[]
) {
  try {
    if (!process.env.RESEND_API_KEY || !teamEmail) return
    const prefs = await getNotificationPrefs()
    if (!prefs[event]) return

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: fromEmail,
      to: teamEmail,
      subject,
      html: teamNotificationHtml(subject, rows),
    })
  } catch {
    // swallow — see comment above
  }
}
