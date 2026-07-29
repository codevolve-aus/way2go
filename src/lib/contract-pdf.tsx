import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

const BLUE = "#1e40af"
const LIGHT_BLUE = "#dbeafe"
const GRAY = "#6b7280"
const LIGHT_GRAY = "#f9fafb"
const BORDER = "#e5e7eb"
const BLACK = "#111827"

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: BLACK, padding: 40 },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
  },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", color: BLUE },
  brandSub: { fontSize: 9, color: GRAY, marginTop: 2 },
  contractLabel: { fontSize: 9, color: GRAY, textAlign: "right" },
  contractNumber: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textAlign: "right",
    marginTop: 2,
  },
  // Section
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 14,
  },
  // Info grid
  grid: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  infoBox: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 4,
    padding: 10,
    marginBottom: 4,
  },
  infoRow: { flexDirection: "row", marginBottom: 4 },
  infoLabel: { width: 110, color: GRAY, fontSize: 8.5 },
  infoValue: { flex: 1, fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  // Highlight box
  highlight: {
    backgroundColor: LIGHT_BLUE,
    borderRadius: 4,
    padding: 10,
    marginTop: 12,
  },
  highlightTitle: {
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    fontSize: 9,
    marginBottom: 6,
  },
  bulletRow: { flexDirection: "row", marginBottom: 3 },
  bullet: { width: 12, color: BLUE },
  bulletText: { flex: 1, fontSize: 8.5 },
  // Status badge
  statusBadge: {
    backgroundColor: "#dcfce7",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  statusText: { color: "#166534", fontFamily: "Helvetica-Bold", fontSize: 8 },
  // Footer
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: GRAY,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginVertical: 10,
  },
  // T&C page
  tcTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    marginBottom: 16,
    textAlign: "center",
  },
  tcSection: { marginBottom: 10 },
  tcHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    marginBottom: 4,
    color: BLACK,
  },
  tcBody: { fontSize: 8.5, color: "#374151", lineHeight: 1.5 },
})

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value || "—"}</Text>
    </View>
  )
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function fmtAUD(n: number) {
  return n.toLocaleString("en-AU", { style: "currency", currency: "AUD" })
}

function durationDays(pickup: Date, ret: Date) {
  return Math.round((ret.getTime() - pickup.getTime()) / 86400000) + 1
}

export interface ContractPDFData {
  contractNumber: string
  bookingNumber: string
  createdAt: Date
  pickupDate: Date
  returnDate: Date
  pickupLocation: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address?: string | null
    city?: string | null
    state?: string | null
    postcode?: string | null
    dateOfBirth?: Date | null
    licenceNo?: string | null
    licenceState?: string | null
    licenceClass?: string | null
    licenceExpiry?: Date | null
  }
  vehicle: {
    make: string
    model: string
    year: number
    colour: string
    registrationNo: string
    fuelType: string
    transmission: string
    seats: number
  }
  missingFields: string[]
}

const TERMS: { heading: string; body: string }[] = [
  {
    heading: "1. RENTAL PERIOD",
    body:
      "The rental commences on the pickup date and time specified in this agreement and ends on the agreed return date and time. Late returns will incur additional daily rental charges at the standard rate. The vehicle must be returned to the agreed location unless an alternative has been pre-arranged in writing.",
  },
  {
    heading: "2. DRIVER ELIGIBILITY",
    body:
      "All drivers must hold a current, valid driver's licence for the class of vehicle being rented. The primary driver must be at least 21 years of age. Drivers aged 21–24 may be subject to a Young Driver Surcharge. International drivers must present both their foreign licence and an official English translation or International Driving Permit.",
  },
  {
    heading: "3. AUTHORISED DRIVERS",
    body:
      "Only drivers listed on this rental agreement are authorised to operate the vehicle. Any person driving the vehicle who is not listed herein will void all insurance coverage and the primary renter will be held fully liable for any resulting damage, loss, or penalty.",
  },
  {
    heading: "4. VEHICLE USE",
    body:
      "The vehicle must not be used: (a) for any illegal purpose; (b) to carry more passengers than the vehicle is designed for; (c) off sealed roads or on terrain not suitable for the vehicle; (d) for towing, pushing or driving any other vehicle; (e) by any person under the influence of alcohol or drugs; (f) in any motor sport or race; (g) for hire to another party; or (h) outside of Australia without prior written consent.",
  },
  {
    heading: "5. FUEL POLICY",
    body:
      "The vehicle will be provided with a full tank of fuel. The renter must return the vehicle with a full tank. Failure to do so will result in a refuelling fee charged at the current market rate plus a service charge. Electric vehicles must be returned with a minimum of 80% charge unless otherwise agreed.",
  },
  {
    heading: "6. DAMAGE AND LIABILITY",
    body:
      "The renter accepts full financial liability for all damage to the vehicle, including overhead and underbody damage, tyre and windscreen damage, regardless of fault, up to the applicable excess amount stated in this agreement. Damage caused by prohibited use, or by an unlisted driver, carries unlimited liability. All damage must be reported to Way2Go immediately.",
  },
  {
    heading: "7. INSURANCE",
    body:
      "Compulsory Third Party (CTP) insurance is included. The vehicle is covered by Way2Go's comprehensive fleet insurance subject to the damage excess stated in this agreement. The renter's liability can be reduced by purchasing Damage Liability Reduction (DLR) at the time of rental. Insurance does not cover personal belongings left in the vehicle.",
  },
  {
    heading: "8. PAYMENT AND SECURITY DEPOSIT",
    body:
      "Payment is due at the time of vehicle collection unless a credit account has been established. A security deposit (as stated on page 1) is required and will be held via pre-authorisation or charged to the provided payment method. The deposit will be released within 5 business days of the vehicle being returned in satisfactory condition.",
  },
  {
    heading: "9. CANCELLATION POLICY",
    body:
      "Cancellations made more than 48 hours before the rental commencement date will receive a full refund. Cancellations made within 24–48 hours will incur a 50% cancellation fee. No-shows and cancellations with less than 24 hours' notice will be charged the full rental amount. Amendments are subject to vehicle availability.",
  },
  {
    heading: "10. BREAKDOWN AND EMERGENCIES",
    body:
      "In the event of a breakdown, accident, or theft, the renter must: (a) ensure the safety of all occupants; (b) contact emergency services if required; (c) contact Way2Go immediately on our 24-hour number; (d) not authorise any repairs without Way2Go's written consent; and (e) obtain a police report number for any accident or theft.",
  },
  {
    heading: "11. RETURN CONDITION",
    body:
      "The vehicle must be returned in the same condition as received, allowing for fair wear and tear. The renter is responsible for all cleaning costs if the vehicle is returned in an unacceptable condition. A vehicle inspection will be conducted at return and the renter will be notified of any damage claims within 24 hours.",
  },
  {
    heading: "12. PRIVACY",
    body:
      "Way2Go Vehicle Rentals collects and uses personal information in accordance with the Australian Privacy Act 1988. Information provided in this agreement is used solely for rental administration, insurance, and compliance purposes. Your information will not be shared with third parties except as required by law or for the purposes of processing claims.",
  },
  {
    heading: "13. GOVERNING LAW",
    body:
      "This agreement is governed by the laws of the state or territory in which the rental commences. Any disputes will be subject to the exclusive jurisdiction of the courts of that state or territory.",
  },
]

export function ContractPDF({ data }: { data: ContractPDFData }) {
  const days = durationDays(data.pickupDate, data.returnDate)
  const fullName = `${data.customer.firstName} ${data.customer.lastName}`
  const addressLine = [
    data.customer.address,
    data.customer.city,
    data.customer.state,
    data.customer.postcode,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <Document
      title={`Rental Agreement ${data.contractNumber}`}
      author="Way2Go Vehicle Rentals"
    >
      {/* ── Page 1: Contract Details ── */}
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>Way2Go</Text>
            <Text style={s.brandSub}>Vehicle Rentals</Text>
          </View>
          <View>
            <Text style={s.contractLabel}>RENTAL AGREEMENT</Text>
            <Text style={s.contractNumber}>{data.contractNumber}</Text>
            <Text style={[s.contractLabel, { marginTop: 4 }]}>
              Issued: {fmtDate(data.createdAt)}
            </Text>
          </View>
        </View>

        {/* Status */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <View style={s.statusBadge}>
            <Text style={s.statusText}>CONFIRMED</Text>
          </View>
          <Text style={{ color: GRAY, fontSize: 8 }}>
            Booking Reference: {data.bookingNumber}
          </Text>
        </View>

        <View style={s.divider} />

        {/* Rental Details + Customer Details side by side */}
        <Text style={s.sectionTitle}>Rental Details</Text>
        <View style={s.grid}>
          <View style={[s.col, s.infoBox]}>
            <InfoRow label="Pickup Date" value={fmtDate(data.pickupDate)} />
            <InfoRow label="Return Date" value={fmtDate(data.returnDate)} />
            <InfoRow label="Duration" value={`${days} day${days !== 1 ? "s" : ""}`} />
            <InfoRow label="Pickup Location" value={data.pickupLocation} />
          </View>
          <View style={[s.col, s.infoBox]}>
            <InfoRow
              label="Vehicle"
              value={`${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}`}
            />
            <InfoRow label="Colour" value={data.vehicle.colour} />
            <InfoRow label="Registration" value={data.vehicle.registrationNo} />
            <InfoRow label="Transmission" value={data.vehicle.transmission} />
            <InfoRow label="Fuel Type" value={data.vehicle.fuelType} />
          </View>
        </View>

        <Text style={s.sectionTitle}>Customer Details</Text>
        <View style={s.infoBox}>
          <View style={s.grid}>
            <View style={s.col}>
              <InfoRow label="Full Name" value={fullName} />
              <InfoRow label="Email" value={data.customer.email} />
              <InfoRow label="Phone" value={data.customer.phone} />
              <InfoRow label="Address" value={addressLine || "Not provided"} />
            </View>
            <View style={s.col}>
              <InfoRow label="Date of Birth" value={data.customer.dateOfBirth ? fmtDate(data.customer.dateOfBirth) : "Not provided"} />
              <InfoRow label="Licence No." value={data.customer.licenceNo || "Not provided"} />
              <InfoRow label="Licence State" value={data.customer.licenceState || "Not provided"} />
              <InfoRow label="Licence Class" value={data.customer.licenceClass || "Not provided"} />
              <InfoRow label="Licence Expiry" value={data.customer.licenceExpiry ? fmtDate(data.customer.licenceExpiry) : "Not provided"} />
            </View>
          </View>
        </View>

        <Text style={s.sectionTitle}>Pricing</Text>
        <View style={s.infoBox}>
          <View style={s.grid}>
            <View style={s.col}>
              <InfoRow label="Rental Duration" value={`${days} day${days !== 1 ? "s" : ""}`} />
              <InfoRow label="Daily Rate" value="As per agreed rate" />
            </View>
            <View style={s.col}>
              <InfoRow label="Total Amount" value="To be confirmed" />
              <InfoRow label="Security Deposit" value="To be confirmed" />
            </View>
          </View>
          <Text style={{ fontSize: 7.5, color: GRAY, marginTop: 6 }}>
            Final pricing will be confirmed at vehicle collection. Accepted payment methods: EFTPOS, credit/debit card, bank transfer.
          </Text>
        </View>

        {/* Missing info alert */}
        {data.missingFields.length > 0 && (
          <View style={s.highlight}>
            <Text style={s.highlightTitle}>⚠ Action Required — Information Needed</Text>
            <Text style={{ fontSize: 8.5, marginBottom: 6 }}>
              To complete this rental agreement we require the following information. Please reply to this email or contact us to provide these details before your rental date.
            </Text>
            {data.missingFields.map((field, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.bullet}>•</Text>
                <Text style={s.bulletText}>{field}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={s.pageNumber}>
          <Text>Way2Go Vehicle Rentals — Rental Agreement {data.contractNumber}</Text>
          <Text>Page 1 of 2 — See overleaf for full Terms and Conditions</Text>
        </View>
      </Page>

      {/* ── Page 2: Terms & Conditions ── */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.brand}>Way2Go</Text>
            <Text style={s.brandSub}>Vehicle Rentals</Text>
          </View>
          <View>
            <Text style={[s.contractLabel, { textAlign: "right" }]}>
              Agreement {data.contractNumber}
            </Text>
          </View>
        </View>

        <Text style={s.tcTitle}>Rental Agreement — Terms and Conditions</Text>

        {TERMS.map((term) => (
          <View key={term.heading} style={s.tcSection}>
            <Text style={s.tcHeading}>{term.heading}</Text>
            <Text style={s.tcBody}>{term.body}</Text>
          </View>
        ))}

        {/* Signature section */}
        <View style={[s.infoBox, { marginTop: 14 }]}>
          <Text style={[s.highlightTitle, { color: BLACK, marginBottom: 8 }]}>
            CUSTOMER DECLARATION
          </Text>
          <Text style={{ fontSize: 8.5, marginBottom: 14 }}>
            By signing below I confirm that I have read, understood and agree to be bound by the Terms and Conditions of this Rental Agreement, and that all information provided is true and correct.
          </Text>
          <View style={s.grid}>
            <View style={s.col}>
              <Text style={{ fontSize: 8, color: GRAY, marginBottom: 20 }}>Customer Signature</Text>
              <View style={{ borderTopWidth: 1, borderTopColor: BLACK, paddingTop: 4 }}>
                <Text style={{ fontSize: 7.5, color: GRAY }}>Signature</Text>
              </View>
            </View>
            <View style={s.col}>
              <Text style={{ fontSize: 8, color: GRAY, marginBottom: 20 }}>Date Signed</Text>
              <View style={{ borderTopWidth: 1, borderTopColor: BLACK, paddingTop: 4 }}>
                <Text style={{ fontSize: 7.5, color: GRAY }}>Date</Text>
              </View>
            </View>
            <View style={s.col}>
              <Text style={{ fontSize: 8, color: GRAY, marginBottom: 20 }}>Print Full Name</Text>
              <View style={{ borderTopWidth: 1, borderTopColor: BLACK, paddingTop: 4 }}>
                <Text style={{ fontSize: 7.5, color: GRAY }}>Full Name</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={s.pageNumber}>
          <Text>Way2Go Vehicle Rentals — Rental Agreement {data.contractNumber}</Text>
          <Text>Page 2 of 2</Text>
        </View>
      </Page>
    </Document>
  )
}
