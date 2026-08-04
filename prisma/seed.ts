import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString =
  process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL ?? "";
const adapter = new PrismaNeon({ connectionString });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding reference data...");

  // Vehicle Categories
  const categories = [
    { name: "Economy", description: "Small, fuel-efficient vehicles" },
    { name: "Compact", description: "Mid-size sedans and hatchbacks" },
    { name: "SUV", description: "Sport utility vehicles" },
    { name: "People Mover", description: "Vans and people movers for large groups" },
    { name: "Ute / Truck", description: "Utility vehicles and light trucks" },
    { name: "Luxury", description: "Premium and prestige vehicles" },
    { name: "Electric", description: "Battery electric vehicles" },
  ];

  for (const cat of categories) {
    await db.vehicleCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`✓ ${categories.length} vehicle categories`);

  // Locations
  const locations = [
    {
      name: "Sydney CBD",
      address: "100 George Street",
      city: "Sydney",
      state: "NSW",
      postcode: "2000",
      phone: "+61 2 9876 5432",
    },
    {
      name: "Parramatta",
      address: "45 Church Street",
      city: "Parramatta",
      state: "NSW",
      postcode: "2150",
      phone: "+61 2 9891 2345",
    },
    {
      name: "Sydney Airport",
      address: "Terminal 1, Sydney Airport",
      city: "Mascot",
      state: "NSW",
      postcode: "2020",
      phone: "+61 2 9700 8899",
    },
  ];

  for (const loc of locations) {
    const existing = await db.location.findFirst({ where: { name: loc.name } });
    if (!existing) {
      await db.location.create({ data: loc });
    }
  }
  console.log(`✓ ${locations.length} locations`);

  // Legal Documents
  const legalDocuments = [
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      sections: [
        {
          heading: "1. Introduction",
          body: `WAYZO PTY LTD (ABN 99 700 912 698), trading as WayZo Rentals ("WayZo", "we", "us", "our") respects your privacy and is committed to handling your personal information responsibly. This Privacy Policy explains what personal information we collect, how we use and disclose it, and how you can access or correct it, in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).

By making a booking enquiry, contacting us, or otherwise providing us with personal information, you agree to the collection and use of that information as described in this policy.`,
        },
        {
          heading: "2. Information We Collect",
          body: `We collect personal information that is reasonably necessary to provide our vehicle rental services, including:

- Contact details: name, email address, phone number
- Driver information: date of birth, driver's licence number, licence class and expiry, licence state
- Booking details: preferred pickup/return dates, preferred vehicle, pickup location
- Payment and billing details, where relevant to a confirmed rental
- Any other information you choose to include in an enquiry, message, or during the rental process (e.g. special requests)

We only collect sensitive information (such as information relevant to a driving-eligibility check) where necessary and with your consent.`,
        },
        {
          heading: "3. How We Use Your Information",
          body: `We use your personal information to:

- Respond to booking enquiries and contact form messages
- Assess driver eligibility and prepare a rental agreement
- Process a confirmed rental, including payments, invoices, and the return of the vehicle
- Communicate with you about your enquiry or rental (confirmations, reminders, updates)
- Meet our legal, insurance, and regulatory obligations
- Improve our services and the WayZo website

We do not use your personal information for automated decision-making that has a legal or similarly significant effect on you.`,
        },
        {
          heading: "4. Booking Enquiries & Communications",
          body: `Submitting a Booking Enquiry or Contact form on our website sends your details directly to our team by email so we can respond to you. It does not create a marketing subscription. We will only send you marketing or promotional communications if you separately opt in, and you may unsubscribe from any such communications at any time.`,
        },
        {
          heading: "5. Disclosure to Third Parties",
          body: `We do not sell or rent your personal information. We may disclose personal information to:

- Insurers, for the purposes of arranging cover or processing a claim
- Payment processors, to process payments and bonds
- Law enforcement or government authorities, where required or authorised by law
- Professional advisers (e.g. accountants, lawyers), bound by confidentiality obligations

Any third party we share information with is only provided the information reasonably necessary for that purpose.`,
        },
        {
          heading: "6. Data Security & Retention",
          body: `We take reasonable technical and organisational steps to protect personal information from misuse, interference, loss, unauthorised access, modification, or disclosure. We retain personal information only for as long as reasonably necessary to fulfil the purposes described in this policy, or as required by law (including tax, insurance, and record-keeping obligations for rental agreements).`,
        },
        {
          heading: "7. Cookies & Website Usage",
          body: `Our website may use minimal, strictly necessary cookies or similar technologies required for the site to function correctly (for example, to remember your interface preferences). We do not currently use third-party advertising or tracking cookies. If this changes, this policy will be updated accordingly.`,
        },
        {
          heading: "8. Access, Correction & Complaints",
          body: `You may request access to, or correction of, the personal information we hold about you at any time by contacting us using the details below. If you believe we have breached the Australian Privacy Principles, you may lodge a complaint with us in the first instance, or with the Office of the Australian Information Commissioner (OAIC) at oaic.gov.au.`,
        },
        {
          heading: "9. Changes to This Policy",
          body: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations. The current version will always be available on this page, along with the date it was last updated.`,
        },
        {
          heading: "10. Contact Us",
          body: `For any questions about this Privacy Policy or how we handle your personal information, please get in touch via our Contact page, or call us directly.`,
        },
      ],
    },
    {
      slug: "terms-conditions",
      title: "Terms & Conditions",
      sections: [
        {
          heading: "1. Overview & Acceptance",
          body: `These Terms & Conditions govern your use of the WayZo Rentals website operated by WAYZO PTY LTD (ABN 99 700 912 698) ("WayZo", "we", "us", "our"), and any vehicle rental arranged with us. By submitting a Booking Enquiry, Contact form, or entering into a rental with WayZo, you agree to be bound by these terms, along with the specific terms set out in your signed Rental Agreement at the time of collection.`,
        },
        {
          heading: "2. Booking Enquiries Are Not Confirmed Bookings",
          body: `Submitting a Booking Enquiry through this website is a request only — it does not reserve a vehicle or guarantee availability, and does not form a contract. A rental is only confirmed once we have contacted you to confirm dates, pricing and vehicle availability, and is only finalised once a Rental Agreement is signed at the time of vehicle collection.`,
        },
        {
          heading: "3. Driver Eligibility",
          body: `All drivers must hold a current, valid driver's licence appropriate to the vehicle category being hired, and meet any minimum age and licence-holding-period requirements we specify at the time of booking. Provisional/P1 licence holders and international visitors may be subject to additional conditions. We may decline to rent a vehicle to any person who does not meet our eligibility requirements, at our discretion.`,
        },
        {
          heading: "4. Vehicle Use & Restrictions",
          body: `The vehicle must only be driven by the renter and any additional drivers listed and approved on the Rental Agreement. The vehicle must not be used: for any illegal purpose; to carry passengers or goods for hire or reward without our written consent; off-road or outside of sealed public roads unless agreed in writing; while towing, unless agreed in writing; or in a way that breaches any road rule, licence condition, or the terms of our fleet insurance.`,
        },
        {
          heading: "5. Fuel Policy",
          body: `Unless otherwise agreed in writing, the vehicle is provided with a specified fuel level and must be returned with the same fuel level. If the vehicle is returned with less fuel than at collection, a refuelling charge (fuel cost plus a service fee) will apply, as set out in your Rental Agreement.`,
        },
        {
          heading: "6. Security Bond",
          body: `A refundable security bond may be required at the time of collection, in the amount specified in your Rental Agreement. The bond (or any unused portion) is refunded after the vehicle is returned, inspected, and any outstanding charges (fuel, damage, cleaning, tolls, fines, late fees) have been deducted.`,
        },
        {
          heading: "7. Pricing & Payment",
          body: `Rates quoted in response to a Booking Enquiry are indicative and may vary based on rental duration, dates, and vehicle availability. Final pricing, payment terms, and any deposit required will be confirmed before your Rental Agreement is signed. Prices are in Australian Dollars (AUD) and, unless stated otherwise, are inclusive of GST.`,
        },
        {
          heading: "8. Insurance & Damage Liability",
          body: `Our vehicles are covered by comprehensive fleet insurance and Compulsory Third Party (CTP) insurance. The renter accepts financial liability for damage to the vehicle during the rental period up to the damage excess amount stated in the Rental Agreement, regardless of fault, except where such liability is excluded by law. Damage caused by any prohibited use (see clause 4) or by an unlisted driver carries unlimited liability. Insurance does not cover personal belongings left in the vehicle.`,
        },
        {
          heading: "9. Accidents & Breakdowns",
          body: `In the event of an accident, breakdown, or theft, the renter must: ensure the safety of all occupants; contact emergency services if required; contact WayZo as soon as possible; not authorise or arrange any repairs without our written consent; and, for any accident or theft, obtain a police report/event number. Failure to promptly report an incident may affect insurance cover and the renter's liability.`,
        },
        {
          heading: "10. Late Returns & Extensions",
          body: `The vehicle must be returned by the date and time stated in the Rental Agreement. If you need more time, contact us as early as possible to request an extension — extensions are subject to vehicle availability and additional charges. Vehicles returned late without a pre-approved extension may incur additional daily charges as set out in your Rental Agreement.`,
        },
        {
          heading: "11. Cleaning & Additional Fees",
          body: `Vehicles must be returned in a reasonably clean condition, free of rubbish, stains and odours. Excessive cleaning required beyond normal use (including smoking residue or pet hair, where smoking or pets have not been agreed to in advance) will incur a cleaning fee as set out in your Rental Agreement. Tolls, parking and traffic infringements incurred during the rental period are the renter's responsibility, plus an administration fee where applicable.`,
        },
        {
          heading: "12. Cancellations",
          body: `Booking Enquiries can be cancelled or changed free of charge at any time before a Rental Agreement is signed. Cancellation terms for a confirmed booking (including any applicable fees for late cancellation or no-show) will be provided to you at the time of confirmation.`,
        },
        {
          heading: "13. Limitation of Liability",
          body: `To the maximum extent permitted by law, WayZo's liability arising from this website or a vehicle rental is limited to the resupply of the relevant service, and we exclude liability for indirect or consequential loss. Nothing in these terms excludes, restricts or modifies any consumer guarantee, right or remedy under the Australian Consumer Law that cannot lawfully be excluded.`,
        },
        {
          heading: "14. Governing Law",
          body: `These Terms & Conditions, and any Rental Agreement entered into with WayZo, are governed by the laws of New South Wales, Australia, and the parties submit to the exclusive jurisdiction of its courts.`,
        },
        {
          heading: "15. Contact Us",
          body: `Questions about these Terms & Conditions, or about an existing or upcoming rental, can be sent through our Contact page or by phone.`,
        },
      ],
    },
  ];

  for (const doc of legalDocuments) {
    const legalDocument = await db.legalDocument.upsert({
      where: { slug: doc.slug },
      update: {},
      create: {
        slug: doc.slug,
        title: doc.title,
        updatedBy: "Seed script",
        sections: {
          create: doc.sections.map((s, i) => ({ order: i, heading: s.heading, body: s.body })),
        },
      },
    });
    await db.legalDocumentRevision.upsert({
      where: { id: `seed-${legalDocument.id}` },
      update: {},
      create: {
        id: `seed-${legalDocument.id}`,
        documentId: legalDocument.id,
        snapshot: { title: doc.title, sections: doc.sections },
        editedBy: "Seed script",
      },
    });
  }
  console.log(`✓ ${legalDocuments.length} legal documents`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
