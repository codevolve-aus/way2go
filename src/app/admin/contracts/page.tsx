import { Metadata } from "next"
import { db } from "@/lib/db"
import { ContractsView } from "./contracts-view"

export const metadata: Metadata = { title: "Contracts" }

export default async function ContractsPage() {
  const contracts = await db.contract.findMany({
    include: { booking: { include: { customer: true, vehicle: true } } },
    orderBy: { createdAt: "desc" },
  })
  return <ContractsView contracts={contracts} />
}
