import { Metadata } from "next"
import { PricingView } from "./pricing-view"

export const metadata: Metadata = { title: "Pricing" }

interface RateCard {
  id: string
  category: string
  examples: string
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
}

interface Extra {
  id: string
  name: string
  rate: number
  unit: string
  isActive: boolean
}

type DiscountStatus = "Active" | "Expired" | "Exhausted"

interface DiscountCode {
  id: string
  code: string
  discountPercent: number
  usageLimit: number
  usedCount: number
  expiry: string
  status: DiscountStatus
}

const rateCards: RateCard[] = [
  {
    id: "RC1",
    category: "Compact",
    examples: "Toyota Yaris, Mazda 2",
    dailyRate: 65,
    weeklyRate: 390,
    monthlyRate: 1400,
  },
  {
    id: "RC2",
    category: "Sedan / Hatchback",
    examples: "Toyota Camry, Mazda 3",
    dailyRate: 89,
    weeklyRate: 540,
    monthlyRate: 1900,
  },
  {
    id: "RC3",
    category: "SUV",
    examples: "Toyota RAV4, Mazda CX-5",
    dailyRate: 119,
    weeklyRate: 720,
    monthlyRate: 2600,
  },
  {
    id: "RC4",
    category: "Ute / 4WD",
    examples: "HiLux, Ranger, Navara",
    dailyRate: 149,
    weeklyRate: 880,
    monthlyRate: 3200,
  },
  {
    id: "RC5",
    category: "Commercial Van",
    examples: "Mercedes Vito, Hyundai iLoad",
    dailyRate: 175,
    weeklyRate: 1050,
    monthlyRate: 3800,
  },
]

const extras: Extra[] = [
  { id: "E1", name: "GPS Navigation", rate: 10, unit: "day", isActive: true },
  { id: "E2", name: "Child Seat", rate: 8, unit: "day", isActive: true },
  { id: "E3", name: "Additional Driver", rate: 15, unit: "day", isActive: true },
  { id: "E4", name: "Insurance Upgrade", rate: 25, unit: "day", isActive: true },
  { id: "E5", name: "Roadside Assistance", rate: 5, unit: "day", isActive: false },
]

const discountCodes: DiscountCode[] = [
  {
    id: "D1",
    code: "SUMMER10",
    discountPercent: 10,
    usageLimit: 100,
    usedCount: 67,
    expiry: "2026-08-31",
    status: "Active",
  },
  {
    id: "D2",
    code: "CORP2026",
    discountPercent: 15,
    usageLimit: 50,
    usedCount: 50,
    expiry: "2026-12-31",
    status: "Exhausted",
  },
  {
    id: "D3",
    code: "EARLYBIRD",
    discountPercent: 20,
    usageLimit: 30,
    usedCount: 30,
    expiry: "2026-06-30",
    status: "Expired",
  },
  {
    id: "D4",
    code: "FLEET25",
    discountPercent: 25,
    usageLimit: 20,
    usedCount: 4,
    expiry: "2026-09-30",
    status: "Active",
  },
  {
    id: "D5",
    code: "WEEKEND5",
    discountPercent: 5,
    usageLimit: 200,
    usedCount: 112,
    expiry: "2026-10-31",
    status: "Active",
  },
]

export default function PricingPage() {
  return <PricingView rateCards={rateCards} extras={extras} discountCodes={discountCodes} />
}
