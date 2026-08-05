"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { DEFAULT_COMPANY_DETAILS, type CompanyDetails } from "@/lib/company"

const COMPANY_DETAILS_KEY = "company_details"

export async function getCompanyDetails(): Promise<CompanyDetails> {
  try {
    const row = await db.setting.findUnique({ where: { key: COMPANY_DETAILS_KEY } })
    if (!row) return DEFAULT_COMPANY_DETAILS
    return { ...DEFAULT_COMPANY_DETAILS, ...JSON.parse(row.value) }
  } catch {
    return DEFAULT_COMPANY_DETAILS
  }
}

export async function updateCompanyDetails(details: CompanyDetails) {
  await db.setting.upsert({
    where: { key: COMPANY_DETAILS_KEY },
    create: { key: COMPANY_DETAILS_KEY, value: JSON.stringify(details) },
    update: { value: JSON.stringify(details) },
  })
  revalidatePath("/admin/settings")
}
