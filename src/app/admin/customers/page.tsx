import { Metadata } from "next"
import { db } from "@/lib/db"
import { CustomersView } from "./customers-view"

export const metadata: Metadata = { title: "Customers" }

export default async function CustomersPage() {
  const customers = await db.customer.findMany({ orderBy: { lastName: "asc" } })

  return <CustomersView customers={customers} />
}
