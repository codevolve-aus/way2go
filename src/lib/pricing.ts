// Rental pricing engine — Turo-style: cheapest of daily/weekly/monthly proration,
// plus a configurable weekend-night surcharge, promo discount, service fee and tax.

export interface PricingRules {
  weekendSurchargePct: number
  weekendDays: number[] // 0 = Sunday … 6 = Saturday
  serviceFeePct: number
  taxRatePct: number
  minRentalDays: number
}

export const DEFAULT_PRICING_RULES: PricingRules = {
  weekendSurchargePct: 15,
  weekendDays: [5, 6], // Friday & Saturday nights
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
  weekendNights: number
  baseRateType: BaseRateType
  baseSubtotal: number
  weekendSurcharge: number
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

export function nightsBetween(pickup: Date, returnDate: Date): number {
  const ms = startOfDay(returnDate).getTime() - startOfDay(pickup).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

function countWeekendNights(pickup: Date, nights: number, weekendDays: number[]): number {
  let count = 0
  const cursor = startOfDay(pickup)
  for (let i = 0; i < nights; i++) {
    if (weekendDays.includes(cursor.getDay())) count++
    cursor.setDate(cursor.getDate() + 1)
  }
  return count
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
  const nights = Math.max(0, nightsBetween(pickupDate, returnDate))

  if (nights === 0) {
    return {
      nights: 0,
      weekendNights: 0,
      baseRateType: "daily",
      baseSubtotal: 0,
      weekendSurcharge: 0,
      rentalSubtotal: 0,
      discountAmount: 0,
      serviceFee: 0,
      taxAmount: 0,
      total: 0,
      belowMinimum: rules.minRentalDays > 0,
    }
  }

  const { type: baseRateType, amount: baseSubtotal } = cheapestBaseRate(nights, rate)
  const weekendNights = countWeekendNights(pickupDate, nights, rules.weekendDays)
  const perNightEquivalent = baseSubtotal / nights
  const weekendSurcharge =
    weekendNights * perNightEquivalent * (rules.weekendSurchargePct / 100)

  const rentalSubtotal = baseSubtotal + weekendSurcharge

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
    baseRateType,
    baseSubtotal: round2(baseSubtotal),
    weekendSurcharge: round2(weekendSurcharge),
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
