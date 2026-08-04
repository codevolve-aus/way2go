"use server"

import { Resend } from "resend"
import { db } from "@/lib/db"
import { isValidAustralianPhone } from "@/lib/phone"

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

function formatEnquiryDate(d: string) {
  if (!d) return ""
  return new Date(`${d}T00:00:00`).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function customerAckEmail(data: {
  name: string
  vehicleCategory: string
  pickupLocation: string
  pickupDate: string
  returnDate: string
}) {
  const rows: [string, string][] = [
    ["Preferred Vehicle", data.vehicleCategory],
    ["Pickup Location", data.pickupLocation],
    ["Pickup Date", formatEnquiryDate(data.pickupDate)],
    ["Return Date", formatEnquiryDate(data.returnDate)],
  ]

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111827">
      <div style="background:#1e40af;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">WayZo Vehicle Rentals</h1>
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
        <p style="font-size:13px;color:#6b7280;margin:0">
          If anything above isn&apos;t right, just reply to this email and let us know.
        </p>
      </div>
      <div style="background:#f3f4f6;padding:16px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;text-align:center">
        <p style="margin:0;font-size:11px;color:#9ca3af">WayZo Vehicle Rentals &bull; This is an automated message</p>
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
  vehicleCategory: string
  pickupLocation: string
  pickupDate: string
  returnDate: string
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

  const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`

  try {
    await findOrCreateCustomer(data)
  } catch {
    // Don't block the enquiry email if the customer record can't be synced
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
      { label: "Preferred Vehicle", value: data.vehicleCategory },
      { label: "Pickup Location", value: data.pickupLocation },
      { label: "Pickup Date", value: data.pickupDate },
      { label: "Return Date", value: data.returnDate },
      { label: "Promo Code", value: data.discountCode ?? "" },
      { label: "Notes", value: data.notes },
    ]),
  })

  if (error) return { error: "We couldn't send your enquiry. Please try again shortly." }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.email,
      replyTo: toEmail,
      subject: "We've received your booking enquiry — WayZo Vehicle Rentals",
      html: customerAckEmail({ ...data, name: data.firstName.trim() }),
    })
  } catch {
    // Don't fail the submission if the customer acknowledgement email doesn't send
  }

  return {}
}
