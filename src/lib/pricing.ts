// Rental pricing engine — Turo-style: cheapest of daily/weekly/monthly proration,
// plus a configurable per-day-of-week multiplier, peak-period (seasonal/event) surcharge,
// tiered length-of-stay discount, promo discount, service fee and tax.
//
// The day-of-week multiplier scales the per-night rate directly (1.0 = no change,
// 0.9 = 10% cheaper, 1.15 = 15% pricier), so weekdays can be discounted to drive
// utilization while weekends carry a premium — rather than only ever being able to
// add a surcharge. It combines with the peak-period surcharge (still a % added on
// top) additively for a given night, mirroring how rental platforms layer a weekly
// rate calendar with seasonal/event-week surcharges rather than swapping out the
// whole rate card for short-term demand spikes.
//
// The length-of-stay discount is a separate, automatic incentive keyed on total
// nights booked (e.g. 7+ nights: 10% off) — independent of whatever weekly/monthly
// rate numbers a rate card happens to have configured.

export interface PeakPeriod {
  id: string
  name: string
  startDate: string // YYYY-MM-DD, inclusive
  endDate: string // YYYY-MM-DD, inclusive
  surchargePct: number
}

// A tiered long-stay incentive, independent of whatever weekly/monthly rate
// card numbers are configured — e.g. "7+ nights: 10% off, 14+ nights: 15%
// off". Where a stay qualifies for more than one tier, the highest % wins
// rather than stacking, same rule as overlapping peak periods.
export interface LengthOfStayDiscountTier {
  id: string
  minNights: number
  discountPct: number
}

export interface PricingRules {
  dayOfWeekMultiplier: Record<number, number> // keyed 0 = Sunday … 6 = Saturday; 1 = no adjustment
  peakPeriods: PeakPeriod[]
  lengthOfStayDiscounts: LengthOfStayDiscountTier[]
  serviceFeePct: number
  taxRatePct: number
  minRentalDays: number
}

export const DEFAULT_PRICING_RULES: PricingRules = {
  dayOfWeekMultiplier: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1.15, 6: 1.15 }, // 15% premium Friday & Saturday nights
  peakPeriods: [],
  lengthOfStayDiscounts: [],
  serviceFeePct: 8,
  taxRatePct: 10,
  minRentalDays: 1,
}

export interface RateCardInput {
  dailyRate: number
  weeklyRate?: number | null
  monthlyRate?: number | null
}

export interface DiscountInput {
  discountPct?: number | null
  discountAmt?: number | null
}

export type BaseRateType = "daily" | "weekly" | "monthly"

export interface PriceBreakdown {
  nights: number
  dayOfWeekAdjustedNights: number // nights with a non-1.0 day-of-week multiplier applied
  peakNights: number // nights falling within a peak period
  baseRateType: BaseRateType
  baseSubtotal: number
  dayOfWeekAdjustment: number // $ from day-of-week multiplier — positive is a surcharge, negative is a discount
  peakSurcharge: number // $ from peak-period surcharge
  rentalSubtotal: number
  lengthOfStayDiscountPct: number // the qualifying tier's %, 0 if none applied
  lengthOfStayDiscount: number // $ from the length-of-stay tier
  discountAmount: number
  serviceFee: number
  taxAmount: number
  total: number
  belowMinimum: boolean
}

function startOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

// Billed in full 24-hour periods from the actual pickup timestamp, not
// calendar nights — collecting at 2pm Monday and returning at 3pm Wednesday
// is billed as 3 days (49 hours crosses into a third 24-hour period), the
// same way most rental counters bill a late return.
export function billableDaysBetween(pickup: Date, returnDate: Date): number {
  const ms = returnDate.getTime() - pickup.getTime()
  if (ms <= 0) return 0
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

function isWithinPeakPeriod(date: Date, period: PeakPeriod): boolean {
  const start = new Date(`${period.startDate}T00:00:00`)
  const end = new Date(`${period.endDate}T00:00:00`)
  return date >= start && date <= end
}

// Sums the per-night day-of-week multiplier deltas and peak-period surcharge
// %s across the stay. Multiple overlapping peak periods on the same night use
// the highest one, not a stacked sum, to avoid runaway surcharges.
function nightSurcharges(
  pickup: Date,
  nights: number,
  rules: PricingRules
): { dayOfWeekAdjustedNights: number; peakNights: number; dayOfWeekDelta: number; peakPct: number } {
  let dayOfWeekAdjustedNights = 0
  let peakNights = 0
  let dayOfWeekDelta = 0
  let peakPct = 0
  const cursor = startOfDay(pickup)

  for (let i = 0; i < nights; i++) {
    const multiplier = rules.dayOfWeekMultiplier[cursor.getDay()] ?? 1
    if (multiplier !== 1) dayOfWeekAdjustedNights++
    dayOfWeekDelta += multiplier - 1

    const nightPeakPct = rules.peakPeriods.reduce((max, p) => {
      return isWithinPeakPeriod(cursor, p) ? Math.max(max, p.surchargePct) : max
    }, 0)
    if (nightPeakPct > 0) peakNights++
    peakPct += nightPeakPct

    cursor.setDate(cursor.getDate() + 1)
  }

  return { dayOfWeekAdjustedNights, peakNights, dayOfWeekDelta, peakPct }
}

// Highest-qualifying-tier wins, not a stacked sum — same rule as overlapping
// peak periods, so a 21-night stay against "7+: 10%, 14+: 15%" tiers gets
// 15%, not 25%.
function lengthOfStayDiscountPct(nights: number, tiers: LengthOfStayDiscountTier[]): number {
  return tiers.reduce((max, t) => (nights >= t.minNights ? Math.max(max, t.discountPct) : max), 0)
}

function cheapestBaseRate(nights: number, rate: RateCardInput): { type: BaseRateType; amount: number } {
  const candidates: { type: BaseRateType; amount: number }[] = [
    { type: "daily", amount: nights * rate.dailyRate },
  ]

  if (rate.weeklyRate && nights >= 7) {
    const weeks = Math.floor(nights / 7)
    const remainder = nights % 7
    candidates.push({ type: "weekly", amount: weeks * rate.weeklyRate + remainder * rate.dailyRate })
  }

  if (rate.monthlyRate && nights >= 28) {
    const months = Math.floor(nights / 30)
    const remainder = nights - months * 30
    candidates.push({ type: "monthly", amount: months * rate.monthlyRate + remainder * rate.dailyRate })
  }

  return candidates.reduce((best, c) => (c.amount < best.amount ? c : best))
}

export function calculateRentalPrice(input: {
  pickupDate: Date
  returnDate: Date
  rate: RateCardInput
  rules: PricingRules
  discount?: DiscountInput
}): PriceBreakdown {
  const { pickupDate, returnDate, rate, rules, discount } = input
  const nights = billableDaysBetween(pickupDate, returnDate)

  if (nights === 0) {
    return {
      nights: 0,
      dayOfWeekAdjustedNights: 0,
      peakNights: 0,
      baseRateType: "daily",
      baseSubtotal: 0,
      dayOfWeekAdjustment: 0,
      peakSurcharge: 0,
      rentalSubtotal: 0,
      lengthOfStayDiscountPct: 0,
      lengthOfStayDiscount: 0,
      discountAmount: 0,
      serviceFee: 0,
      taxAmount: 0,
      total: 0,
      belowMinimum: rules.minRentalDays > 0,
    }
  }

  const { type: baseRateType, amount: baseSubtotal } = cheapestBaseRate(nights, rate)
  const { dayOfWeekAdjustedNights, peakNights, dayOfWeekDelta, peakPct } = nightSurcharges(
    pickupDate,
    nights,
    rules
  )
  const perNightEquivalent = baseSubtotal / nights
  const dayOfWeekAdjustment = perNightEquivalent * dayOfWeekDelta
  const peakSurcharge = perNightEquivalent * (peakPct / 100)

  const rentalSubtotal = baseSubtotal + dayOfWeekAdjustment + peakSurcharge

  // Sibling % off rentalSubtotal, same base as the promo code discount below
  // rather than compounding off each other — simplest to reason about and
  // matches how day-of-week/peak already both scale off the same per-night rate.
  const stayDiscountPct = lengthOfStayDiscountPct(nights, rules.lengthOfStayDiscounts)
  const lengthOfStayDiscount = rentalSubtotal * (stayDiscountPct / 100)

  let discountAmount = 0
  if (discount?.discountPct) {
    discountAmount = rentalSubtotal * (discount.discountPct / 100)
  } else if (discount?.discountAmt) {
    discountAmount = Math.min(discount.discountAmt, rentalSubtotal - lengthOfStayDiscount)
  }

  const afterDiscount = rentalSubtotal - lengthOfStayDiscount - discountAmount
  const serviceFee = afterDiscount * (rules.serviceFeePct / 100)
  const taxAmount = (afterDiscount + serviceFee) * (rules.taxRatePct / 100)
  const total = afterDiscount + serviceFee + taxAmount

  return {
    nights,
    dayOfWeekAdjustedNights,
    peakNights,
    baseRateType,
    baseSubtotal: round2(baseSubtotal),
    dayOfWeekAdjustment: round2(dayOfWeekAdjustment),
    peakSurcharge: round2(peakSurcharge),
    rentalSubtotal: round2(rentalSubtotal),
    lengthOfStayDiscountPct: stayDiscountPct,
    lengthOfStayDiscount: round2(lengthOfStayDiscount),
    discountAmount: round2(discountAmount),
    serviceFee: round2(serviceFee),
    taxAmount: round2(taxAmount),
    total: round2(total),
    belowMinimum: nights < rules.minRentalDays,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
