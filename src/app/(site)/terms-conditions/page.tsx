import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for enquiring about and hiring a vehicle from WayZo.",
}

const sections = [
  {
    heading: "1. Overview",
    body: `These Terms & Conditions apply to your use of the WayZo website and to any vehicle
rental arranged with WayZo Vehicle Rentals ("WayZo", "we", "us"). By submitting a booking
enquiry or contact form, you agree to these terms.`,
  },
  {
    heading: "2. Booking Enquiries",
    body: `Submitting a booking enquiry through this website does not constitute a confirmed
booking or reservation. All enquiries are subject to vehicle availability, driver eligibility
and confirmation by a member of our team. A rental agreement is only formed once confirmed
in writing and signed at the time of vehicle collection.`,
  },
  {
    heading: "3. Eligibility",
    body: `Drivers must hold a current, valid driver's licence and meet the minimum age and
licence-holding requirements for the vehicle category requested. Additional conditions may
apply for certain vehicle categories.`,
  },
  {
    heading: "4. Pricing",
    body: `Rates quoted are indicative and may vary based on rental duration, vehicle
availability, season and any extras selected. Final pricing will be confirmed before your
rental agreement is signed.`,
  },
  {
    heading: "5. Vehicle Condition & Insurance",
    body: `All WayZo vehicles are maintained to a roadworthy standard and covered by our fleet
insurance, subject to the damage excess and conditions set out in your signed rental
agreement. The renter is responsible for the vehicle for the duration of the rental period.`,
  },
  {
    heading: "6. Cancellations",
    body: `Booking enquiries may be cancelled or amended free of charge prior to confirmation.
Cancellation terms for confirmed bookings will be provided at the time of confirmation.`,
  },
  {
    heading: "7. Limitation of Liability",
    body: `To the extent permitted by law, WayZo is not liable for any indirect or
consequential loss arising from the use of this website or from a vehicle rental, except
where such liability cannot be excluded under Australian Consumer Law.`,
  },
  {
    heading: "8. Contact",
    body: `Questions about these Terms & Conditions can be sent through our Contact page.`,
  },
]

export default function TermsConditionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Terms &amp; Conditions</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 31 July 2026</p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold mb-2">{section.heading}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}
