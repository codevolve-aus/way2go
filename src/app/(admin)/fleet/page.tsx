import { Metadata } from "next"
import { FleetView } from "./fleet-view"

export const metadata: Metadata = { title: "Fleet" }

type VehicleStatus = "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "DAMAGED" | "RETIRED"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  plate: string
  category: string
  status: VehicleStatus
  fuel: string
  transmission: string
  seats: number
  odometer: string
}

const vehicles: Vehicle[] = [
  {
    id: "V-001",
    make: "Toyota",
    model: "RAV4",
    year: 2024,
    plate: "ABC-123",
    category: "SUV",
    status: "AVAILABLE",
    fuel: "Hybrid",
    transmission: "Auto",
    seats: 5,
    odometer: "12,480 km",
  },
  {
    id: "V-002",
    make: "Ford",
    model: "Ranger",
    year: 2024,
    plate: "DEF-456",
    category: "Ute",
    status: "BOOKED",
    fuel: "Diesel",
    transmission: "Auto",
    seats: 5,
    odometer: "28,310 km",
  },
  {
    id: "V-003",
    make: "Hyundai",
    model: "Tucson",
    year: 2023,
    plate: "GHI-789",
    category: "SUV",
    status: "AVAILABLE",
    fuel: "Petrol",
    transmission: "Auto",
    seats: 5,
    odometer: "41,550 km",
  },
  {
    id: "V-004",
    make: "Kia",
    model: "Carnival",
    year: 2023,
    plate: "JKL-012",
    category: "People Mover",
    status: "MAINTENANCE",
    fuel: "Petrol",
    transmission: "Auto",
    seats: 8,
    odometer: "63,200 km",
  },
  {
    id: "V-005",
    make: "Mazda",
    model: "CX-5",
    year: 2024,
    plate: "MNO-345",
    category: "SUV",
    status: "DAMAGED",
    fuel: "Petrol",
    transmission: "Auto",
    seats: 5,
    odometer: "19,740 km",
  },
  {
    id: "V-006",
    make: "Mitsubishi",
    model: "Outlander",
    year: 2022,
    plate: "PQR-678",
    category: "SUV",
    status: "RETIRED",
    fuel: "Petrol",
    transmission: "CVT",
    seats: 7,
    odometer: "118,900 km",
  },
]

export default function FleetPage() {
  return <FleetView vehicles={vehicles} />
}
