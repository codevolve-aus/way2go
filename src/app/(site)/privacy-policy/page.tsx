import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How WayZo Vehicle Rentals collects, uses and protects your personal information.",
}

const sections = [
  {
    heading: "1. Introduction",
    body: `WayZo Vehicle Rentals ("WayZo", "we", "us") is committed to protecting your privacy.
This Privacy Policy explains how we collect, use, store and disclose personal information in
accordance with the Australian Privacy Act 1988 (Cth) and the Australian Privacy Principles.`,
  },
  {
    heading: "2. Information We Collect",
    body: `When you make a booking enquiry, contact us, or enter into a rental agreement, we may
collect your name, contact details, date of birth, driver's licence details, payment
information and any other information you choose to provide.`,
  },
  {
    heading: "3. How We Use Your Information",
    body: `We use your personal information to process booking enquiries and rental agreements,
verify your identity and driving eligibility, communicate with you about your rental,
process payments, and comply with our legal and insurance obligations.`,
  },
  {
    heading: "4. Disclosure of Information",
    body: `We do not sell your personal information. We may share information with insurers,
payment processors and law enforcement where required by law, or as necessary to provide
our services and process claims.`,
  },
  {
    heading: "5. Data Security",
    body: `We take reasonable steps to protect the personal information we hold from misuse,
interference, loss, and unauthorised access, modification or disclosure.`,
  },
  {
    heading: "6. Access and Correction",
    body: `You may request access to, or correction of, the personal information we hold about
you at any time by contacting us using the details on our Contact page.`,
  },
  {
    heading: "7. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. The latest version will always
be available on this page.`,
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Privacy Policy</h1>
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
