"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import {
  calculateRentalPrice,
  DEFAULT_PRICING_RULES,
  type PricingRules,
  type PriceBreakdown,
} from "@/lib/pricing"

const PRICING_RULES_KEY = "pricing_rules"

export async function getPricingRules(): Promise<PricingRules> {
  try {
    const row = await db.setting.findUnique({ where: { key: PRICING_RULES_KEY } })
    if (!row) return DEFAULT_PRICING_RULES
    return { ...DEFAULT_PRICING_RULES, ...JSON.parse(row.value) }
  } catch {
    return DEFAULT_PRICING_RULES
  }
}

export async function updatePricingRules(rules: PricingRules) {
  await db.setting.upsert({
    where: { key: PRICING_RULES_KEY },
    create: { key: PRICING_RULES_KEY, value: JSON.stringify(rules) },
    update: { value: JSON.stringify(rules) },
  })
  revalidatePath("/admin/pricing")
  revalidatePath("/booking-enquiry")
}

export type PriceEstimateResult =
  | {
      ok: true
      breakdown: PriceBreakdown
      rateName: string
      discountApplied: boolean
      discountError?: string
    }
  | { ok: false; error: string }

export async function getPriceEstimate(input: {
  categoryId: string
  pickupDate: string
  pickupTime?: string
  returnDate: string
  returnTime?: string
  discountCode?: string
}): Promise<PriceEstimateResult> {
  const { categoryId, pickupDate: pickupStr, returnDate: returnStr, discountCode } = input

  if (!categoryId || !pickupStr || !returnStr) {
    return { ok: false, error: "Select a vehicle category and both dates" }
  }

  const pickupDate = new Date(`${pickupStr}T${input.pickupTime || "10:00"}:00`)
  const returnDate = new Date(`${returnStr}T${input.returnTime || "10:00"}:00`)

  if (Number.isNaN(pickupDate.getTime()) || Number.isNaN(returnDate.getTime())) {
    return { ok: false, error: "Invalid dates" }
  }
  if (returnDate <= pickupDate) {
    return { ok: false, error: "Return must be after pickup" }
  }

  const rates = await db.rentalRate.findMany({ where: { categoryId } })
  if (rates.length === 0) {
    return { ok: false, error: "No rate card configured for this category yet" }
  }

  // Seasonal windows are calendar-date ranges, not time-of-day sensitive —
  // compare against midnight of the pickup date, not the exact pickup time.
  const pickupDateOnly = new Date(`${pickupStr}T00:00:00`)
  const seasonal = rates.find(
    (r) => r.startDate && r.endDate && r.startDate <= pickupDateOnly && r.endDate >= pickupDateOnly
  )
  const rate = seasonal ?? rates.find((r) => r.isDefault) ?? rates[0]

  const rules = await getPricingRules()

  let discount: { discountPct?: number | null; discountAmt?: number | null } | undefined
  let discountApplied = false
  let discountError: string | undefined

  if (discountCode?.trim()) {
    const code = await db.discountCode.findUnique({
      where: { code: discountCode.trim().toUpperCase() },
    })
    if (!code) {
      discountError = "Promo code not found"
    } else if (!code.isActive) {
      discountError = "Promo code is no longer active"
    } else if (code.expiresAt && code.expiresAt < new Date()) {
      discountError = "Promo code has expired"
    } else if (code.usageLimit != null && code.usedCount >= code.usageLimit) {
      discountError = "Promo code usage limit reached"
    } else {
      discount = { discountPct: code.discountPct, discountAmt: code.discountAmt }
      discountApplied = true
    }
  }

  const breakdown = calculateRentalPrice({
    pickupDate,
    returnDate,
    rate: { dailyRate: rate.dailyRate, weeklyRate: rate.weeklyRate, monthlyRate: rate.monthlyRate },
    rules,
    discount,
  })

  return { ok: true, breakdown, rateName: rate.name, discountApplied, discountError }
}
