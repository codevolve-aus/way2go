"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { BookingStatus, BookingSource } from "@/generated/prisma"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"
import { Resend } from "resend"
import { ContractPDF, type ContractPDFData } from "@/lib/contract-pdf"

async function nextBookingNumber() {
  const year = new Date().getFullYear()
  const count = await db.booking.count()
  return `BK-${year}-${String(count + 1).padStart(4, "0")}`
}

export async function createBooking(data: {
  customerId: string
  vehicleId: string
  pickupDate: string
  returnDate: string
  pickupLocation: string
  source: BookingSource
  notes?: string
}) {
  const bookingNumber = await nextBookingNumber()
  await db.booking.create({
    data: {
      bookingNumber,
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      pickupDate: new Date(data.pickupDate),
      returnDate: new Date(data.returnDate),
      pickupLocation: data.pickupLocation,
      source: data.source,
      notes: data.notes,
      status: "PENDING",
    },
  })
  revalidatePath("/bookings")
}

export async function updateBooking(
  id: string,
  data: {
    customerId: string
    vehicleId: string
    pickupDate: string
    returnDate: string
    pickupLocation: string
    source: BookingSource
    notes?: string
  }
) {
  await db.booking.update({
    where: { id },
    data: {
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      pickupDate: new Date(data.pickupDate),
      returnDate: new Date(data.returnDate),
      pickupLocation: data.pickupLocation,
      source: data.source,
      notes: data.notes || null,
    },
  })
  revalidatePath("/bookings")
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  await db.booking.update({ where: { id }, data: { status } })
  revalidatePath("/bookings")
}

export async function sendContractEmail(bookingId: string): Promise<{ error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { error: "Email not configured. Add RESEND_API_KEY to environment variables." }
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, vehicle: true, contract: true },
  })
  if (!booking) return { error: "Booking not found" }
  if (booking.status !== "CONFIRMED") return { error: "Booking must be confirmed before sending a contract" }

  // Create or retrieve contract record
  let contract = booking.contract
  if (!contract) {
    const year = new Date().getFullYear()
    const count = await db.contract.count()
    const contractNumber = `CT-${year}-${String(count + 1).padStart(4, "0")}`
    contract = await db.contract.create({
      data: {
        contractNumber,
        bookingId: booking.id,
        status: "DRAFT",
        totalAmount: 0,
        depositAmount: 0,
      },
    })
  }

  // Determine which customer fields are missing
  const c = booking.customer
  const missingFields: string[] = []
  if (!c.dateOfBirth) missingFields.push("Date of birth")
  if (!c.licenceNo) missingFields.push("Driver's licence number")
  if (!c.licenceState) missingFields.push("Licence issuing state")
  if (!c.licenceExpiry) missingFields.push("Licence expiry date")
  if (!c.licenceClass) missingFields.push("Licence class")
  if (!c.address) missingFields.push("Residential address")
  missingFields.push("Emergency contact name and phone number")
  missingFields.push("Signed copy of this rental agreement (signature page overleaf)")

  const pdfData: ContractPDFData = {
    contractNumber: contract.contractNumber,
    bookingNumber: booking.bookingNumber,
    createdAt: contract.createdAt,
    pickupDate: booking.pickupDate,
    returnDate: booking.returnDate,
    pickupLocation: booking.pickupLocation,
    customer: {
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      state: c.state,
      postcode: c.postcode,
      dateOfBirth: c.dateOfBirth,
      licenceNo: c.licenceNo,
      licenceState: c.licenceState,
      licenceClass: c.licenceClass,
      licenceExpiry: c.licenceExpiry,
    },
    vehicle: {
      make: booking.vehicle.make,
      model: booking.vehicle.model,
      year: booking.vehicle.year,
      colour: booking.vehicle.colour,
      registrationNo: booking.vehicle.registrationNo,
      fuelType: booking.vehicle.fuelType,
      transmission: booking.vehicle.transmission,
      seats: booking.vehicle.seats,
    },
    missingFields,
  }

  const pdfBuffer = await renderToBuffer(
    createElement(ContractPDF, { data: pdfData }) as unknown as ReactElement<DocumentProps>
  )
  const fullName = `${c.firstName} ${c.lastName}`
  const pickupFmt = booking.pickupDate.toLocaleDateString("en-AU", {
    day: "2-digit", month: "long", year: "numeric",
  })
  const returnFmt = booking.returnDate.toLocaleDateString("en-AU", {
    day: "2-digit", month: "long", year: "numeric",
  })

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Way2Go Rentals <noreply@way2go.com.au>"

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111827">
      <div style="background:#1e40af;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px">Way2Go Vehicle Rentals</h1>
        <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">Rental Agreement &amp; Terms and Conditions</p>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none">
        <p style="margin:0 0 16px">Dear ${fullName},</p>
        <p style="margin:0 0 16px">
          Thank you for confirming your rental with Way2Go. Please find attached your
          <strong>Rental Agreement (${contract.contractNumber})</strong> including our full Terms and Conditions.
        </p>
        <div style="background:#dbeafe;border-radius:6px;padding:16px;margin-bottom:16px">
          <p style="margin:0 0 8px;font-weight:bold;color:#1e40af">Your Booking Summary</p>
          <table style="width:100%;font-size:13px;border-collapse:collapse">
            <tr><td style="padding:3px 0;color:#6b7280;width:160px">Booking Reference</td><td style="font-weight:bold">${booking.bookingNumber}</td></tr>
            <tr><td style="padding:3px 0;color:#6b7280">Vehicle</td><td style="font-weight:bold">${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}</td></tr>
            <tr><td style="padding:3px 0;color:#6b7280">Registration</td><td style="font-weight:bold">${booking.vehicle.registrationNo}</td></tr>
            <tr><td style="padding:3px 0;color:#6b7280">Pickup Date</td><td style="font-weight:bold">${pickupFmt}</td></tr>
            <tr><td style="padding:3px 0;color:#6b7280">Return Date</td><td style="font-weight:bold">${returnFmt}</td></tr>
            <tr><td style="padding:3px 0;color:#6b7280">Pickup Location</td><td style="font-weight:bold">${booking.pickupLocation}</td></tr>
          </table>
        </div>
        ${missingFields.length > 0 ? `
        <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:6px;padding:16px;margin-bottom:16px">
          <p style="margin:0 0 8px;font-weight:bold;color:#92400e">⚠ Action Required</p>
          <p style="margin:0 0 8px;font-size:13px;color:#92400e">
            To complete your rental agreement, we need the following information before your rental date:
          </p>
          <ul style="margin:0;padding-left:20px;font-size:13px;color:#78350f">
            ${missingFields.map(f => `<li style="margin-bottom:4px">${f}</li>`).join("")}
          </ul>
        </div>
        ` : ""}
        <p style="font-size:13px;margin:0 0 8px">
          <strong>Next Steps:</strong>
        </p>
        <ol style="font-size:13px;margin:0 0 16px;padding-left:20px;color:#374151">
          <li style="margin-bottom:6px">Read the attached Terms and Conditions carefully.</li>
          <li style="margin-bottom:6px">Print, sign and bring the signature page on the day of collection, or reply to this email with any questions.</li>
          ${missingFields.length > 0 ? `<li style="margin-bottom:6px">Reply to this email or call us to provide the required information listed above.</li>` : ""}
          <li style="margin-bottom:6px">Bring your valid driver's licence and accepted payment method on collection day.</li>
        </ol>
        <p style="font-size:13px;color:#6b7280;margin:0">
          If you have any questions, please don't hesitate to contact us. We look forward to seeing you!
        </p>
      </div>
      <div style="background:#f3f4f6;padding:16px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;text-align:center">
        <p style="margin:0;font-size:11px;color:#9ca3af">Way2Go Vehicle Rentals &bull; This is an automated message</p>
      </div>
    </div>
  `

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: c.email,
    subject: `Your Rental Agreement — ${booking.bookingNumber} | Way2Go Vehicle Rentals`,
    html: htmlBody,
    attachments: [
      {
        filename: `${contract.contractNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  })

  if (error) return { error: error.message }

  revalidatePath("/bookings")
  revalidatePath("/contracts")
  return {}
}
