import { Metadata } from "next"
import { db } from "@/lib/db"
import { PricingView } from "./pricing-view"

export const metadata: Metadata = { title: "Pricing" }

export default async function PricingPage() {
  const [rates, rawCodes, categories] = await Promise.all([
    db.rentalRate.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    db.discountCode.findMany({ orderBy: { createdAt: "desc" } }),
    db.vehicleCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ])

  const now = new Date()

  const rateCards = rates.map((r) => ({
    id: r.id,
    categoryId: r.categoryId,
    category: r.category.name,
    name: r.name,
    dailyRate: r.dailyRate,
    weeklyRate: r.weeklyRate ?? 0,
    monthlyRate: r.monthlyRate ?? 0,
  }))

  const discountCodes = rawCodes.map((c) => {
    const exhausted = c.usageLimit != null && c.usedCount >= c.usageLimit
    const expired = c.expiresAt != null && c.expiresAt < now
    const status: "Active" | "Expired" | "Exhausted" = exhausted
      ? "Exhausted"
      : expired
      ? "Expired"
      : "Active"
    return {
      id: c.id,
      code: c.code,
      discountPercent: c.discountPct ?? 0,
      usageLimit: c.usageLimit ?? 0,
      usedCount: c.usedCount,
      expiry: c.expiresAt ? c.expiresAt.toISOString() : "",
      status,
    }
  })

  return (
    <PricingView
      rateCards={rateCards}
      extras={[]}
      discountCodes={discountCodes}
      categories={categories}
    />
  )
}
