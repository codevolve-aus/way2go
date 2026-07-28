import { Metadata } from "next"
import { DamageView } from "./damage-view"

export const metadata: Metadata = { title: "Damage & Incidents" }

const damageReports = [
  {
    id: "DMG-001",
    vehicle: "Toyota Camry (ABC-123)",
    customer: "James Nguyen",
    contract: "BK-1042",
    description:
      "Rear bumper scrape caused during parallel parking in underground garage. Paint transfer from pillar.",
    fault: "CUSTOMER",
    repairCost: 850.0,
    status: "ASSESSED",
    created: "2026-07-10",
  },
  {
    id: "DMG-002",
    vehicle: "Honda CR-V (XYZ-789)",
    customer: "Sarah Mitchell",
    contract: "BK-1043",
    description:
      "Front left panel dented by unknown third-party vehicle while parked on street. No witnesses.",
    fault: "THIRD_PARTY",
    repairCost: 1400.0,
    status: "REPAIR_IN_PROGRESS",
    created: "2026-07-14",
  },
  {
    id: "DMG-003",
    vehicle: "Ford Ranger (GHI-321)",
    customer: "David Chen",
    contract: "BK-1038",
    description:
      "Minor stone chip on windscreen. Pre-existing damage confirmed on departure inspection photo.",
    fault: "NO_FAULT",
    repairCost: 120.0,
    status: "RESOLVED",
    created: "2026-07-05",
  },
  {
    id: "DMG-004",
    vehicle: "Hyundai i30 (DEF-456)",
    customer: "Emma Patel",
    contract: "BK-1044",
    description:
      "Interior upholstery stain on rear seat. Customer admits to spilling coffee.",
    fault: "CUSTOMER",
    repairCost: 300.0,
    status: "REPORTED",
    created: "2026-07-22",
  },
  {
    id: "DMG-005",
    vehicle: "Kia Sportage (JKL-654)",
    customer: "Tom Walsh",
    contract: "BK-1045",
    description:
      "Driver side mirror broken off in shopping centre carpark by another vehicle. CCTV footage obtained.",
    fault: "THIRD_PARTY",
    repairCost: 620.0,
    status: "REPAIRED",
    created: "2026-07-18",
  },
  {
    id: "DMG-006",
    vehicle: "Mazda CX-5 (MNO-987)",
    customer: "Lily Tran",
    contract: "BK-1039",
    description:
      "Tyre blowout on highway. Cause unknown — road hazard suspected. No other damage.",
    fault: "NO_FAULT",
    repairCost: 250.0,
    status: "ASSESSED",
    created: "2026-07-20",
  },
]

const openReports = damageReports.filter((r) =>
  ["REPORTED", "ASSESSED"].includes(r.status)
).length
const underRepair = damageReports.filter((r) => r.status === "REPAIR_IN_PROGRESS").length
const insuranceClaims = damageReports.filter((r) => ["THIRD_PARTY"].includes(r.fault)).length
const resolvedThisMonth = damageReports.filter((r) =>
  ["REPAIRED", "RESOLVED"].includes(r.status)
).length

export default function DamagePage() {
  return (
    <DamageView
      damageReports={damageReports}
      openReports={openReports}
      underRepair={underRepair}
      insuranceClaims={insuranceClaims}
      resolvedThisMonth={resolvedThisMonth}
    />
  )
}
