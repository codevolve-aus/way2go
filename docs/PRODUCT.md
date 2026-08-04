# WayZo — Product Reference

> **Maintenance note:** this is a living reference, not a one-time snapshot. Update it as
> part of any change that adds, removes, or meaningfully alters functionality. A stale
> version of this doc is worse than no doc — it actively misleads whoever reads it next.
> When in doubt, re-verify against the actual code rather than trusting this file blindly.

## 1. Overview

WayZo (WAYZO PTY LTD, trading as "WayZo Rentals") is a small vehicle rental business. The
app is a single Next.js repo with two halves: a **staff admin portal** at `/admin` (Google
OAuth, approval-gated) and a **public marketing + enquiry site** at `/` (no login, no
payment — enquiries only). There is no live checkout; every rental starts as a human-in-
the-loop enquiry that staff turn into a booking.

**Stack**: Next.js 16 (App Router, Turbopack) · React 19 · Prisma 7 + Neon Postgres via
the serverless driver adapter (`@prisma/adapter-neon`) · Base UI (`@base-ui/react`) +
Tailwind CSS v4 for the component system (not shadcn/Radix, despite the `shadcn` package
being present) · NextAuth v5 (beta) for admin auth · Resend for transactional email ·
Vercel Blob for photo storage · `@react-pdf/renderer` for the rental agreement PDF ·
`web-push` + Vercel Cron for pickup reminders. Deployed on Vercel (project `way2go`).

**Non-standard Next.js**: per the project's own `AGENTS.md`, this Next.js version has
breaking changes from what most training data assumes — check
`node_modules/next/dist/docs/` before assuming standard App Router behavior (this bit us
concretely with `params`/`searchParams` being async Promises that must be awaited).

## 2. Public customer site (`src/app/(site)`)

All pages here are Server Components pulling live data from Postgres; the layout
revalidates hourly (`export const revalidate = 3600` in `(site)/layout.tsx`) so admin
edits show up without a redeploy, except where a page/action explicitly calls
`revalidatePath()` for an immediate update.

- **Home (`/`)** — hero with a plain GET quick-quote form (pickup location + dates,
  submits straight into the Booking Enquiry form via query string, no client JS), an
  "Available Now" grid of up to 3 AVAILABLE vehicles with a "From $X/day" badge, a static
  3-step "How It Works" section, value-prop cards, and a closing CTA.
- **Our Fleet (`/our-fleet`)** — every AVAILABLE vehicle, grouped by category, each card
  showing photo, "From $X/day", seat/transmission/fuel icons, and a description snippet.
  Clicking a vehicle's photo or name links to its detail page.
- **Vehicle detail (`/our-fleet/[vehicleId]`)** — full photo gallery (click a thumbnail to
  swap the hero image, client-side `VehicleGallery`), all specs, full description, and a
  sticky pricing sidebar with a "Book This Vehicle" CTA that deep-links to
  `/booking-enquiry?vehicleId=...`. 404s via `notFound()` if the vehicle isn't AVAILABLE.
- **Booking Enquiry (`/booking-enquiry`)** — the core conversion flow. Two-column layout:
  left is the form, right is a sticky vehicle preview + live price estimate. Not a booking
  — no Booking row is created here, only a `Customer` record (see §4) and two emails.
  Notable behavior:
  - Vehicle picker lists individual vehicles (not categories) since the fleet is small.
  - Pickup/Return Date use a calendar picker that **disables dates overlapping any
    CONFIRMED or ACTIVE booking** for the selected vehicle (see `booking-enquiry-form.tsx`
    `DatePickerField` + the `bookings` prop fetched in `page.tsx`).
  - Price estimate is debounced (350ms) and calls `getPriceEstimate()` (§5) as dates/
    vehicle/promo code change — this is a live estimate only, re-confirmed server-side on
    submit.
  - Query params `vehicleId`, `pickupLocation`, `pickupDate`, `returnDate` prefill the
    form but are validated server-side against real DB values before use — never trusted
    directly from the URL.
  - AU phone number validated client- and server-side (`src/lib/phone.ts`).
- **Contact (`/contact`)** — branch list (from `Location`, active only) + a contact form
  that emails `CONTACT_EMAIL` (falls back to `ADMIN_EMAIL`, see §7).
- **Privacy Policy / Terms & Conditions** — rendered entirely from the `LegalDocument` /
  `LegalDocumentSection` tables (§6), with a "last updated" date. If no document exists in
  the DB, the page shows a graceful "being updated" fallback rather than erroring.

## 3. Admin portal (`src/app/admin`)

Every route under `/admin` requires an approved Google sign-in (§7). Each module below is
`page.tsx` (Server Component, data fetch) + a client `*-view.tsx` (UI + local state) +
`actions.ts` (Server Actions).

- **Dashboard** — KPI cards (active bookings, available/total vehicles, revenue this
  month vs. last month, pending/overdue returns, total customers, today's pickups/
  returns) and a recent-bookings table. Read-only.
- **Bookings** — the booking CRUD + status pipeline (PENDING → CONFIRMED → send contract).
  Create/edit a booking (customer, vehicle, dates/times, pickup location, source, notes),
  with a date picker that disables dates already booked for the chosen vehicle. Live price
  estimate while editing. Actions: Confirm, Cancel, Send Contract Email (only once
  CONFIRMED — generates the Contract row + PDF + email, see §4).
- **Calendar** — availability grid, one row per vehicle, one column per day, 3 consecutive
  months shown at once (stacked), Prev/Next slide the whole window by a month. Colors:
  available / booked / maintenance / blocked. "Block Dates" button is present but not yet
  wired to an action (UI stub).
- **Contracts** — the collection/return workflow lives here (§4): Record Collection,
  Record Return, View (shows recorded odometer/fuel/notes/photos plus a computed "Total
  Distance Driven" once both legs are recorded), Void Contract. "Download PDF" from the
  list is a stub (the PDF is only actually generated when emailing from Bookings).
- **Customers** — CRUD, blacklist/unblacklist with a reason, corporate customer fields
  (company name, ABN). No merge/dedupe tooling beyond the enquiry-time
  email-or-phone match (§4).
- **Fleet** — vehicle CRUD (make/model/year/colour/rego/VIN/fuel/transmission/seats/
  odometer/notes/description), status changes (Available/Maintenance/Retired — Booked and
  Damaged are set automatically by other flows, see §4), and photo management (multi-
  photo upload to Vercel Blob, set primary, delete).
- **Pricing** — see §5 in full; this is the "price calculation configurable page." Four
  tabs: Rate Cards (per-category daily/weekly/monthly rates, optional seasonal date-window
  override, one default per category), Extras (line-item add-ons — model exists, always
  passed as an empty array from `page.tsx`, so the UI tab is currently non-functional),
  Discount Codes (create/activate/deactivate, % or flat, usage limit, expiry), Pricing
  Rules (day-of-week surcharge grid, Peak Periods list, service fee %, tax %, minimum
  rental days) with a live preview calculator.
- **Payments** — record a payment against a booking (deposit/rental fee/extra/damage/fuel/
  late-return/refund, cash/card/bank transfer/online). Create-only — no edit or refund
  action beyond adding a new REFUND-type payment row.
- **Damage** — log a damage report against a vehicle (optionally linked to a contract),
  fault type, repair/charged cost, insurance claim flag, status workflow (Reported →
  Assessed → Repair In Progress → Repaired → Claim Filed → Resolved).
- **Maintenance** — schedule/track service records per vehicle (service, registration,
  roadworthy, tyres, repair, cleaning, other), odometer-at-service, cost, vendor, status.
- **Reports** — read-only analytics: total revenue (sum of all payments), fleet
  utilisation %, total bookings, average rental duration, revenue by category, booking
  source breakdown, top 10 customers by spend.
- **Legal Pages** — WYSIWYG-ish editor for Privacy Policy / Terms & Conditions sections
  (heading + body per section, reorderable by array order). Every save replaces all
  sections for that document and writes a `LegalDocumentRevision` snapshot for audit/
  history — there's no way to view a past revision's content in the UI yet, only that a
  revision exists.
- **Settings** — five tabs, mixed real/stub:
  - *Company* — form UI only, **not persisted** ("Save Changes" is disabled).
  - *Locations* — "coming soon" placeholder; branch data (`Location` model) is real and
    used everywhere on the public site, but there's no admin UI to manage it (edits
    require direct DB access).
  - *Staff* — "coming soon" placeholder; the `Staff` model exists in the schema but has
    **zero references anywhere in the app code** — fully dead/unused.
  - *Notifications* — Push Notifications toggle is real (subscribes this browser via
    `PushSubscription`, feeds the cron reminder job). Email notification toggles are UI
    only, not wired to anything.
  - *Users* (admin-only) — real: approve/reject Google sign-ins pending in `UserApproval`.

## 4. Core business flow: the rental lifecycle

1. **Enquiry** (public `/booking-enquiry`) → `findOrCreateCustomer()` matches an existing
   `Customer` by email OR phone, or creates one. **No `Booking` row is created yet** —
   just the customer record plus a staff notification email and a customer
   acknowledgement email (both include the live price estimate if dates were given).
2. **Staff creates a Booking** (Admin → Bookings, manual) — status `PENDING`.
3. **Confirm** → status `CONFIRMED`.
4. **Send Contract Email** (only from `CONFIRMED`) → creates a `Contract` row
   (`DRAFT`, numbered `CT-YYYY-NNNN`) if one doesn't exist, renders the rental agreement
   PDF (`src/lib/contract-pdf.tsx`), and emails it to the customer along with a list of any
   missing profile fields (DOB, licence details, address, emergency contact, signature)
   needed before pickup.
5. **Record Collection** (Admin → Contracts, once DRAFT/SIGNED) — staff captures pickup
   odometer, fuel level, condition notes, and photos (uploaded to Vercel Blob under
   `contracts/{id}/pre/`). This atomically sets `Contract.status = ACTIVE`,
   `Booking.status = ACTIVE`, and `Vehicle.status = BOOKED` + `Vehicle.odometer` to the
   pickup reading.
6. **Record Return** (once ACTIVE) — same capture for return odometer/fuel/notes/photos
   (`contracts/{id}/post/`). Sets `Contract.status = CLOSED` + `closedAt`,
   `Booking.status = COMPLETED` + `actualReturnDate`, and `Vehicle.status = AVAILABLE` +
   `Vehicle.odometer` to the return reading. The Contract View dialog then shows a
   computed "Total Distance Driven" (`returnOdometer - pickupOdometer`).
7. **DamageReport** is a related but independent record — it can optionally reference a
   `Contract` (`contractId`), but nothing in the collection/return flow auto-creates one;
   staff file it manually from Admin → Damage if something's wrong at return.

`Payment` rows are recorded independently at any point via Admin → Payments and aren't
tied to a specific lifecycle step. `Invoice` exists in the schema but has **no creation
path anywhere in the app** — fully unused.

## 5. Pricing engine (`src/lib/pricing.ts` + `src/lib/pricing-actions.ts`)

`getPriceEstimate()` in `pricing-actions.ts` is the **single source of truth** for price
calculation — every consumer (public booking form, admin booking form, admin pricing
preview, both enquiry emails) calls it. Nothing else should reimplement pricing math.

Layers, applied in order:

1. **Rate selection** — for the vehicle's category, pick the `RentalRate` whose
   `startDate`/`endDate` window covers the pickup date if one exists (a full seasonal
   rate-card override — different daily/weekly/monthly numbers for e.g. a "Summer Peak"
   card), else the category's `isDefault` rate, else the first rate found
   (`src/lib/rate-lookup.ts` mirrors this same selection logic for catalog "from $X/day"
   display without needing a live date).
2. **Base subtotal** — cheapest of daily/weekly/monthly proration for the stay length
   (`cheapestBaseRate`), billed in true 24-hour periods from the actual pickup timestamp
   (`billableDaysBetween`), not calendar nights — a 2pm Monday → 3pm Wednesday rental
   bills as 3 days, matching how rental counters bill a late return.
3. **Day-of-week surcharge** — per-night %, independently configurable for each of
   Sun–Sat (`PricingRules.dayOfWeekSurchargePct`), defaults to Fri/Sat +15%.
4. **Peak Period surcharge** — admin-managed list of named date ranges with a % surcharge
   (`PricingRules.peakPeriods`), stacks additively with the day-of-week surcharge on the
   same night; where two peak periods overlap the same night, the higher one applies
   rather than stacking further.
5. **Discount** — from a `DiscountCode` (% or flat amount, checked for active/expired/
   usage-limit) applied after the surcharges.
6. **Service fee %** and **tax %** — applied last, in that order, both configurable
   globally.
7. **Minimum rental days** — surfaced as `belowMinimum` on the breakdown rather than
   blocking the estimate; the UI shows a warning, staff still confirm manually.

All of the above (except rate cards, which live on `RentalRate` rows) are stored as one
JSON blob under the `Setting` key `pricing_rules`, edited via Admin → Pricing → Pricing
Rules.

## 6. Data model summary (`prisma/schema.prisma`)

- **Fleet**: `VehicleCategory` → `Vehicle` → `VehiclePhoto` / `VehicleDocument`.
  `VehicleCategory` also owns `RentalRate` (pricing) rows.
- **Customers**: `Customer` (blacklist flag + reason, optional corporate fields).
- **Bookings**: `Booking` (the core reservation) → `BookingExtra` → `Extra` (extras model
  exists, no admin UI wired to create/manage `Extra` records — see §3) and → `Payment[]`,
  → `Contract?` (1:1).
- **Contracts**: `Contract` → `DamageReport[]` (optional link). Condition photos are
  stored as a JSON-encoded array of Blob URLs in a plain `String?` field
  (`preConditionPhotos`/`postConditionPhotos`), not a relational photo table.
- **Pricing**: `RentalRate`, `DiscountCode`.
- **Payments**: `Payment`, `Invoice` (schema-only, no creation path — see §4).
- **Damage & Maintenance**: `DamageReport`, `MaintenanceRecord`.
- **Operational**: `CalendarBlock` (vehicle-level date blocks — model exists, no admin
  action currently creates one, the Calendar page's "Block Dates" button is a stub),
  `Location` (branch data, no admin CRUD — see §3).
- **Auth**: `UserApproval` (email/status/role gate for admin access — see §7). `Staff`
  model exists, **completely unused** in app code.
- **Misc**: `Setting` (generic key-value store, currently used only for `pricing_rules`),
  `PushSubscription` (web push endpoints), `LegalDocument` / `LegalDocumentSection` /
  `LegalDocumentRevision`.

## 7. Integrations & infrastructure

- **Vercel Blob** (`@vercel/blob`) — public-access image storage for vehicle photos
  (`vehicles/{vehicleId}/...`) and contract condition photos
  (`contracts/{contractId}/pre|post/...`). `next.config.ts` allowlists
  `*.public.blob.vercel-storage.com` for `next/image`.
- **Resend** — all transactional email: booking enquiry notification (to `CONTACT_EMAIL`,
  falling back to `ADMIN_EMAIL`) + customer acknowledgement, contact form (same
  recipient), contract PDF email. `ADMIN_EMAIL` is dual-purpose — it's also the auth
  auto-approval check in `src/auth.ts`, so it's intentionally kept separate from
  `CONTACT_EMAIL` rather than reused.
- **NextAuth v5 (beta)** — Google OAuth only, JWT session strategy (no DB session table).
  First sign-in creates a `UserApproval` row (`PENDING`/`AGENT` by default, or
  `APPROVED`/`ADMIN` automatically if the email matches `ADMIN_EMAIL`). Non-admin routes
  are open; every `/admin/*` route requires `status === APPROVED`, enforced in
  `src/auth.config.ts`'s `authorized()` callback (edge-compatible, no Prisma import) —
  `PENDING` redirects to `/pending`, `REJECTED` to `/rejected`.
- **Vercel Cron** (`vercel.json`) — one job, daily at 21:00 UTC, hitting
  `/api/cron/booking-reminders`. Finds PENDING/CONFIRMED bookings with pickup in the next
  36 hours that haven't had a reminder sent, and pushes a web-push notification to every
  subscribed admin browser. The project is on Vercel's Hobby plan, which caps cron to
  once/day minimum — this is effectively a daily digest, not a precise T-minus-N-hours
  trigger.
- **PWA** — both portals are installable: public site manifest at `/manifest.webmanifest`
  (name "WayZo Rentals", theme `#2563eb`), admin manifest at
  `/admin/manifest.webmanifest`, separately configured.

## 8. Known conventions / gotchas for future changes

- **Base UI `Select`** needs an explicit `items` prop (`{value, label}[]` or
  `Record<string, label>`) on the `<Select>` wrapper or `Select.Value` falls back to
  showing the raw stored value instead of resolving a label. This bit the codebase in
  ~9 files historically — always pass `items` when adding a new Select.
- **Next.js 16 async params** — `params` and `searchParams` on page/layout/route props
  are `Promise`s and must be `await`ed. A validation hook in this environment sometimes
  flags already-awaited values as unawaited (false positive when the awaited value has
  been destructured/renamed before use) — verify manually rather than trusting it blindly.
- **`revalidatePath()` discipline** — every mutating Server Action must revalidate every
  path that reads the changed data, not just the admin page it was called from. Example:
  a vehicle photo change touches `/admin/fleet`, `/our-fleet`, `/our-fleet/[vehicleId]`,
  and `/booking-enquiry` (all read vehicle/photo data).
- **`formatCurrency()`** is intentionally duplicated per-file rather than extracted to a
  shared util — matches the existing codebase convention, don't "fix" it into a shared
  helper as a drive-by change.
- **Pricing math only ever goes through `getPriceEstimate()`** (§5) — never reimplement
  rate selection or surcharge math inline in a component or email template.
- **Non-standard Next.js version** — check `node_modules/next/dist/docs/` before assuming
  standard App Router behavior; this repo's `AGENTS.md` explicitly warns training-data
  assumptions may not hold.
- **Schema has several unused/half-wired fields** — don't assume something is live just
  because it's in `schema.prisma`. Confirmed currently unused or UI-stub only: `Staff`
  model, `Invoice` model, `Extra`/`BookingExtra` (schema exists, no admin management UI),
  `CalendarBlock` creation (Calendar page's "Block Dates" button), `Location` admin CRUD,
  Settings → Company persistence, Settings → Email notification toggles, Contracts list →
  "Download PDF" (PDF generation only happens via the Bookings → Send Contract Email
  flow). Re-verify this list before relying on it — it may change as gaps get filled in.
