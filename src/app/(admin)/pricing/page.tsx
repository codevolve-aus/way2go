import { Metadata } from "next"
import { PenLine, Tag } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = { title: "Pricing" }

// ------------------------------------------------------------------
// Rate Cards
// ------------------------------------------------------------------

interface RateCard {
  id: string
  category: string
  examples: string
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
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

// ------------------------------------------------------------------
// Extras
// ------------------------------------------------------------------

interface Extra {
  id: string
  name: string
  rate: number
  unit: string
  isActive: boolean
}

const extras: Extra[] = [
  { id: "E1", name: "GPS Navigation", rate: 10, unit: "day", isActive: true },
  { id: "E2", name: "Child Seat", rate: 8, unit: "day", isActive: true },
  { id: "E3", name: "Additional Driver", rate: 15, unit: "day", isActive: true },
  { id: "E4", name: "Insurance Upgrade", rate: 25, unit: "day", isActive: true },
  { id: "E5", name: "Roadside Assistance", rate: 5, unit: "day", isActive: false },
]

// ------------------------------------------------------------------
// Discount Codes
// ------------------------------------------------------------------

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

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function DiscountStatusBadge({ status }: { status: DiscountStatus }) {
  switch (status) {
    case "Active":
      return (
        <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-0">
          Active
        </Badge>
      )
    case "Expired":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Expired
        </Badge>
      )
    case "Exhausted":
      return <Badge variant="secondary">Exhausted</Badge>
  }
}

// ------------------------------------------------------------------
// Page
// ------------------------------------------------------------------

export default function PricingPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pricing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage rate cards, extras and promotional codes
          </p>
        </div>
        <Button>
          <Tag className="h-4 w-4" />
          Add Rate Card
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rate-cards">
        <TabsList>
          <TabsTrigger value="rate-cards">Rate Cards</TabsTrigger>
          <TabsTrigger value="extras">Extras</TabsTrigger>
          <TabsTrigger value="discount-codes">Discount Codes</TabsTrigger>
        </TabsList>

        {/* ---- Rate Cards Tab ---- */}
        <TabsContent value="rate-cards" className="mt-4">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-medium">
                Vehicle Category Rate Cards
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Category</TableHead>
                    <TableHead>Example Vehicles</TableHead>
                    <TableHead className="text-right">Daily</TableHead>
                    <TableHead className="text-right">Weekly</TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                    <TableHead className="pr-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateCards.map((rc) => (
                    <TableRow key={rc.id}>
                      <TableCell className="pl-4 font-medium text-foreground">
                        {rc.category}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {rc.examples}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(rc.dailyRate)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(rc.weeklyRate)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(rc.monthlyRate)}
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <Button variant="ghost" size="sm">
                          <PenLine className="h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Extras Tab ---- */}
        <TabsContent value="extras" className="mt-4">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  Optional Extras
                </CardTitle>
                <Button size="sm" variant="outline">
                  Add Extra
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Extra</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead>Per</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extras.map((extra) => (
                    <TableRow key={extra.id}>
                      <TableCell className="pl-4 font-medium text-foreground">
                        {extra.name}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatCurrency(extra.rate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm capitalize">
                        {extra.unit}
                      </TableCell>
                      <TableCell>
                        {extra.isActive ? (
                          <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-0">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <Button variant="ghost" size="sm">
                          <PenLine className="h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Discount Codes Tab ---- */}
        <TabsContent value="discount-codes" className="mt-4">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  Promotional Codes
                </CardTitle>
                <Button size="sm" variant="outline">
                  Create Code
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Code</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Usage</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountCodes.map((dc) => (
                    <TableRow key={dc.id}>
                      <TableCell className="pl-4">
                        <span className="font-mono text-sm font-medium text-foreground tracking-wide">
                          {dc.code}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium text-foreground">
                        {dc.discountPercent}%
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="tabular-nums text-foreground">
                          {dc.usedCount}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}/ {dc.usageLimit}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(dc.expiry)}
                      </TableCell>
                      <TableCell>
                        <DiscountStatusBadge status={dc.status} />
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm">
                            <PenLine className="h-4 w-4" />
                            Edit
                          </Button>
                          <Separator orientation="vertical" className="h-4 mx-0.5" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Revoke
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
