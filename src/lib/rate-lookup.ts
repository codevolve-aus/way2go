import { db } from "@/lib/db"
import type { RentalRate } from "@/generated/prisma"

// Mirrors the rate-selection logic in getPriceEstimate
// (src/lib/pricing-actions.ts), resolved against today's date rather than a
// specific enquiry, since this is just a catalog "from $X/day" display.
export function selectActiveRate(rates: RentalRate[]): RentalRate | undefined {
  if (rates.length === 0) return undefined
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const seasonal = rates.find(
    (r) => r.startDate && r.endDate && r.startDate <= today && r.endDate >= today
  )
  return seasonal ?? rates.find((r) => r.isDefault) ?? rates[0]
}

// Convenience wrapper for callers that don't already have the category's
// rates loaded (queries them fresh) — prefer selectActiveRate() directly
// when rates are already included in an existing query, to avoid N+1s.
export async function getStartingDailyRate(categoryId: string): Promise<number | null> {
  const rates = await db.rentalRate.findMany({ where: { categoryId } })
  const rate = selectActiveRate(rates)
  return rate?.dailyRate ?? null
}
