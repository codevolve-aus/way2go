// Rental pricing engine — Turo-style: cheapest of daily/weekly/monthly proration,
// plus a configurable per-day-of-week surcharge, peak-period (seasonal/event) surcharge,
// promo discount, service fee and tax.
//
// Day-of-week and peak-period surcharges are both expressed as a % added on top of
// the per-night rate and stack additively for a given night (e.g. a Saturday night
// that also falls in a peak period gets both surcharges), mirroring how rental
// platforms layer a weekly rate calendar with seasonal/event-week surcharges rather
// than swapping out the whole rate card for short-term demand spikes.

export interface PeakPeriod {
  id: string
  name: string
  startDate: string // YYYY-MM-DD, inclusive
  endDate: string // YYYY-MM-DD, inclusive
  surchargePct: number
}

export interface PricingRules {
  dayOfWeekSurchargePct: Record<number, number> // keyed 0 = Sunday … 6 = Saturday
  peakPeriods: PeakPeriod[]
  serviceFeePct: number
  taxRatePct: number
  minRentalDays: number
}

export const DEFAULT_PRICING_RULES: PricingRules = {
  dayOfWeekSurchargePct: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 15, 6: 15 }, // Friday & Saturday nights
  peakPeriods: [],
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
  weekendNights: number // nights with a day-of-week surcharge applied
  peakNights: number // nights falling within a peak period
  baseRateType: BaseRateType
  baseSubtotal: number
  weekendSurcharge: number // $ from day-of-week surcharge
  peakSurcharge: number // $ from peak-period surcharge
  rentalSubtotal: number
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

// Sums the per-night day-of-week and peak-period surcharge %s across the
// stay. Multiple overlapping peak periods on the same night use the
// highest one, not a stacked sum, to avoid runaway surcharges.
function nightSurcharges(
  pickup: Date,
  nights: number,
  rules: PricingRules
): { weekendNights: number; peakNights: number; dayOfWeekPct: number; peakPct: number } {
  let weekendNights = 0
  let peakNights = 0
  let dayOfWeekPct = 0
  let peakPct = 0
  const cursor = startOfDay(pickup)

  for (let i = 0; i < nights; i++) {
    const dayPct = rules.dayOfWeekSurchargePct[cursor.getDay()] ?? 0
    if (dayPct > 0) weekendNights++
    dayOfWeekPct += dayPct

    const nightPeakPct = rules.peakPeriods.reduce((max, p) => {
      return isWithinPeakPeriod(cursor, p) ? Math.max(max, p.surchargePct) : max
    }, 0)
    if (nightPeakPct > 0) peakNights++
    peakPct += nightPeakPct

    cursor.setDate(cursor.getDate() + 1)
  }

  return { weekendNights, peakNights, dayOfWeekPct, peakPct }
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
      weekendNights: 0,
      peakNights: 0,
      baseRateType: "daily",
      baseSubtotal: 0,
      weekendSurcharge: 0,
      peakSurcharge: 0,
      rentalSubtotal: 0,
      discountAmount: 0,
      serviceFee: 0,
      taxAmount: 0,
      total: 0,
      belowMinimum: rules.minRentalDays > 0,
    }
  }

  const { type: baseRateType, amount: baseSubtotal } = cheapestBaseRate(nights, rate)
  const { weekendNights, peakNights, dayOfWeekPct, peakPct } = nightSurcharges(
    pickupDate,
    nights,
    rules
  )
  const perNightEquivalent = baseSubtotal / nights
  const weekendSurcharge = perNightEquivalent * (dayOfWeekPct / 100)
  const peakSurcharge = perNightEquivalent * (peakPct / 100)

  const rentalSubtotal = baseSubtotal + weekendSurcharge + peakSurcharge

  let discountAmount = 0
  if (discount?.discountPct) {
    discountAmount = rentalSubtotal * (discount.discountPct / 100)
  } else if (discount?.discountAmt) {
    discountAmount = Math.min(discount.discountAmt, rentalSubtotal)
  }

  const afterDiscount = rentalSubtotal - discountAmount
  const serviceFee = afterDiscount * (rules.serviceFeePct / 100)
  const taxAmount = (afterDiscount + serviceFee) * (rules.taxRatePct / 100)
  const total = afterDiscount + serviceFee + taxAmount

  return {
    nights,
    weekendNights,
    peakNights,
    baseRateType,
    baseSubtotal: round2(baseSubtotal),
    weekendSurcharge: round2(weekendSurcharge),
    peakSurcharge: round2(peakSurcharge),
    rentalSubtotal: round2(rentalSubtotal),
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
