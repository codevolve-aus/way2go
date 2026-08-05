"use server"

import { Resend } from "resend"
import { db } from "@/lib/db"
import { isValidAustralianPhone } from "@/lib/phone"
import { getPriceEstimate } from "@/lib/pricing-actions"
import type { PriceBreakdown } from "@/lib/pricing"

const fromEmail = process.env.RESEND_FROM_EMAIL ?? "WayZo Rentals <noreply@wayzo.com.au>"
// Customer-facing enquiries go to CONTACT_EMAIL; ADMIN_EMAIL is reserved for
// the auth admin auto-approval check in src/auth.ts and must stay untouched.
const toEmail = process.env.CONTACT_EMAIL ?? process.env.ADMIN_EMAIL

function wrapEmail(title: string, rows: { label: string; value: string }[]) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111827">
      <div style="background:#1e40af;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">${title}</h1>
        <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">Submitted via wayzo.com.au</p>
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

function formatEnquiryDateTime(d: string, t?: string) {
  if (!d) return ""
  const dt = new Date(`${d}T${t || "00:00"}:00`)
  const datePart = dt.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
  if (!t) return datePart
  const timePart = dt.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })
  return `${datePart}, ${timePart}`
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Flat label/value rows for the admin notification table.
function priceEstimateRows(breakdown: PriceBreakdown, discountApplied: boolean) {
  const rows: { label: string; value: string }[] = [
    {
      label: `Estimate (${breakdown.nights} night${breakdown.nights === 1 ? "" : "s"}, ${breakdown.baseRateType})`,
      value: formatCurrency(breakdown.baseSubtotal),
    },
  ]
  if (breakdown.dayOfWeekAdjustment !== 0) {
    const sign = breakdown.dayOfWeekAdjustment < 0 ? "-" : "+"
    rows.push({
      label: "Day-of-week pricing",
      value: `${sign}${formatCurrency(Math.abs(breakdown.dayOfWeekAdjustment))}`,
    })
  }
  if (breakdown.peakSurcharge > 0) {
    rows.push({ label: "Peak season surcharge", value: `+${formatCurrency(breakdown.peakSurcharge)}` })
  }
  if (discountApplied && breakdown.discountAmount > 0) {
    rows.push({ label: "Promo discount", value: `-${formatCurrency(breakdown.discountAmount)}` })
  }
  rows.push({ label: "Service fee", value: formatCurrency(breakdown.serviceFee) })
  rows.push({ label: "Tax", value: formatCurrency(breakdown.taxAmount) })
  rows.push({ label: "Estimated Total", value: formatCurrency(breakdown.total) })
  return rows
}

// Its own visually distinct box for the customer-facing email.
function priceEstimateBox(breakdown: PriceBreakdown, discountApplied: boolean) {
  const lines: { label: string; value: string; bold?: boolean }[] = [
    {
      label: `${breakdown.nights} night${breakdown.nights === 1 ? "" : "s"}`,
      value: formatCurrency(breakdown.baseSubtotal),
    },
  ]
  if (breakdown.dayOfWeekAdjustment !== 0) {
    const sign = breakdown.dayOfWeekAdjustment < 0 ? "-" : "+"
    lines.push({
      label: "Day-of-week pricing",
      value: `${sign}${formatCurrency(Math.abs(breakdown.dayOfWeekAdjustment))}`,
    })
  }
  if (breakdown.peakSurcharge > 0) {
    lines.push({ label: "Peak season surcharge", value: `+${formatCurrency(breakdown.peakSurcharge)}` })
  }
  if (discountApplied && breakdown.discountAmount > 0) {
    lines.push({ label: "Promo discount", value: `-${formatCurrency(breakdown.discountAmount)}` })
  }
  lines.push({ label: "Service fee", value: formatCurrency(breakdown.serviceFee) })
  lines.push({ label: "Tax", value: formatCurrency(breakdown.taxAmount) })
  lines.push({ label: "Estimated Total", value: formatCurrency(breakdown.total), bold: true })

  return `
    <div style="background:#dbeafe;border-radius:6px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 8px;font-weight:bold;color:#1e40af">Estimated Price</p>
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        ${lines
          .map(
            (l) => `
          <tr>
            <td style="padding:3px 0;${l.bold ? "font-weight:bold;border-top:1px solid #bfdbfe;padding-top:8px" : "color:#6b7280"}">${l.label}</td>
            <td style="text-align:right;${l.bold ? "font-weight:bold;font-size:14px;border-top:1px solid #bfdbfe;padding-top:8px" : ""}">${l.value}</td>
          </tr>`
          )
          .join("")}
      </table>
      <p style="margin:8px 0 0;font-size:11px;color:#1e3a8a">Estimate only — final pricing is confirmed by our team.</p>
    </div>
  `
}

function customerAckEmail(data: {
  name: string
  vehicle: string
  pickupLocation: string
  pickupDate: string
  pickupTime?: string
  returnDate: string
  returnTime?: string
  priceEstimate?: { breakdown: PriceBreakdown; discountApplied: boolean } | null
}) {
  const rows: [string, string][] = [
    ["Vehicle", data.vehicle],
    ["Pickup Location", data.pickupLocation],
    ["Pickup", formatEnquiryDateTime(data.pickupDate, data.pickupTime)],
    ["Return", formatEnquiryDateTime(data.returnDate, data.returnTime)],
  ]

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111827">
      <div style="background:#1e40af;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">WayZo Rentals</h1>
        <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">We&apos;ve received your booking enquiry</p>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <p style="margin:0 0 16px">Hi ${data.name},</p>
        <p style="margin:0 0 16px">
          Thanks for reaching out — we&apos;ve received your booking enquiry and our team will be in
          touch shortly to confirm availability and pricing. This isn&apos;t a confirmed booking yet.
        </p>
        <div style="background:#dbeafe;border-radius:6px;padding:16px;margin-bottom:16px">
          <p style="margin:0 0 8px;font-weight:bold;color:#1e40af">Your Enquiry</p>
          <table style="width:100%;font-size:13px;border-collapse:collapse">
            ${rows
              .filter(([, value]) => value)
              .map(
                ([label, value]) => `
              <tr>
                <td style="padding:3px 0;color:#6b7280;width:160px">${label}</td>
                <td style="font-weight:bold">${value}</td>
              </tr>`
              )
              .join("")}
          </table>
        </div>
        ${
          data.priceEstimate
            ? priceEstimateBox(data.priceEstimate.breakdown, data.priceEstimate.discountApplied)
            : ""
        }
        <p style="font-size:13px;color:#6b7280;margin:0">
          If anything above isn&apos;t right, just reply to this email and let us know.
        </p>
      </div>
      <div style="background:#f3f4f6;padding:16px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;text-align:center">
        <p style="margin:0;font-size:11px;color:#9ca3af">WayZo Rentals &bull; This is an automated message</p>
      </div>
    </div>
  `
}

export async function submitContact(data: {
  name: string
  email: string
  phone: string
  message: string
}) {
  if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
    return { error: "Please fill in your name, email and message." }
  }
  if (!toEmail) {
    return { error: "This form isn't configured yet — please call one of our branches instead." }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: data.email,
    subject: `New contact form message from ${data.name}`,
    html: wrapEmail("New Contact Message", [
      { label: "Name", value: data.name },
      { label: "Email", value: data.email },
      { label: "Phone", value: data.phone },
      { label: "Message", value: data.message },
    ]),
  })

  if (error) return { error: "We couldn't send your message. Please try again shortly." }
  return {}
}

// A returning customer is recognised by email OR phone matching an existing
// record — either one identifies them, since either could have changed.
async function findOrCreateCustomer(data: {
  firstName: string
  lastName: string
  email: string
  phone: string
}) {
  const email = data.email.trim()
  const phone = data.phone.trim()

  const existing = await db.customer.findFirst({ where: { OR: [{ email }, { phone }] } })
  if (existing) return existing

  return db.customer.create({
    data: { firstName: data.firstName.trim(), lastName: data.lastName.trim(), email, phone },
  })
}

export async function submitBookingEnquiry(data: {
  firstName: string
  lastName: string
  email: string
  phone: string
  categoryId?: string
  vehicle: string
  pickupLocation: string
  pickupDate: string
  pickupTime?: string
  returnDate: string
  returnTime?: string
  discountCode?: string
  notes: string
}) {
  if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim() || !data.phone.trim()) {
    return { error: "Please fill in your first name, last name, email and phone number." }
  }
  if (!isValidAustralianPhone(data.phone)) {
    return { error: "Please enter a valid Australian phone number." }
  }
  if (!toEmail) {
    return { error: "This form isn't configured yet — please call one of our branches instead." }
  }
  if (data.pickupDate && data.returnDate) {
    const pickupDt = new Date(`${data.pickupDate}T${data.pickupTime || "00:00"}:00`)
    const returnDt = new Date(`${data.returnDate}T${data.returnTime || "00:00"}:00`)
    if (returnDt <= pickupDt) {
      return { error: "Return must be after pickup." }
    }
  }

  const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`

  try {
    await findOrCreateCustomer(data)
  } catch {
    // Don't block the enquiry email if the customer record can't be synced
  }

  // Recomputed server-side (not trusted from the client) using the same
  // engine behind the on-site live estimate, so the email always reflects
  // current rate cards and pricing rules.
  let priceEstimate: { breakdown: PriceBreakdown; discountApplied: boolean } | null = null
  if (data.categoryId && data.pickupDate && data.returnDate) {
    try {
      const result = await getPriceEstimate({
        categoryId: data.categoryId,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        returnDate: data.returnDate,
        returnTime: data.returnTime,
        discountCode: data.discountCode,
      })
      if (result.ok) {
        priceEstimate = { breakdown: result.breakdown, discountApplied: result.discountApplied }
      }
    } catch {
      priceEstimate = null
    }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: data.email,
    subject: `New booking enquiry from ${fullName}`,
    html: wrapEmail("New Booking Enquiry", [
      { label: "Name", value: fullName },
      { label: "Email", value: data.email },
      { label: "Phone", value: data.phone },
      { label: "Vehicle", value: data.vehicle },
      { label: "Pickup Location", value: data.pickupLocation },
      { label: "Pickup", value: formatEnquiryDateTime(data.pickupDate, data.pickupTime) },
      { label: "Return", value: formatEnquiryDateTime(data.returnDate, data.returnTime) },
      { label: "Promo Code", value: data.discountCode ?? "" },
      { label: "Notes", value: data.notes },
      ...(priceEstimate ? priceEstimateRows(priceEstimate.breakdown, priceEstimate.discountApplied) : []),
    ]),
  })

  if (error) return { error: "We couldn't send your enquiry. Please try again shortly." }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.email,
      replyTo: toEmail,
      subject: "We've received your booking enquiry — WayZo Rentals",
      html: customerAckEmail({ ...data, name: data.firstName.trim(), priceEstimate }),
    })
  } catch {
    // Don't fail the submission if the customer acknowledgement email doesn't send
  }

  return {}
}
