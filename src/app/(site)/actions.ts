"use server"

import { Resend } from "resend"

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

export async function submitBookingEnquiry(data: {
  name: string
  email: string
  phone: string
  vehicleCategory: string
  pickupLocation: string
  pickupDate: string
  returnDate: string
  discountCode?: string
  notes: string
}) {
  if (!data.name.trim() || !data.email.trim() || !data.phone.trim()) {
    return { error: "Please fill in your name, email and phone number." }
  }
  if (!toEmail) {
    return { error: "This form isn't configured yet — please call one of our branches instead." }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: data.email,
    subject: `New booking enquiry from ${data.name}`,
    html: wrapEmail("New Booking Enquiry", [
      { label: "Name", value: data.name },
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
  return {}
}
