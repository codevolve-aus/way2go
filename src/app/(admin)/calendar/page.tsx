"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

type DayStatus = "available" | "booked" | "maintenance" | "blocked"

interface DayEntry {
  status: DayStatus
  customerInitial?: string
}

interface Vehicle {
  id: string
  name: string
  plate: string
}

interface CalendarEvent {
  vehicleId: string
  startDay: number
  endDay: number
  status: DayStatus
  customerInitial?: string
}

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const VEHICLES: Vehicle[] = [
  { id: "V1", name: "Toyota HiLux SR5", plate: "1AB 2CD" },
  { id: "V2", name: "Ford Ranger XLT", plate: "5IJ 6KL" },
  { id: "V3", name: "Mercedes-Benz Vito", plate: "3EF 4GH" },
  { id: "V4", name: "Isuzu D-MAX LS-U", plate: "9QR 0ST" },
  { id: "V5", name: "Nissan Navara ST-X", plate: "2UV 3WX" },
]

// July 2026 events (month offset 0 = July 2026)
const EVENTS_JULY: CalendarEvent[] = [
  // Bookings
  { vehicleId: "V1", startDay: 1, endDay: 5, status: "booked", customerInitial: "J" },
  { vehicleId: "V1", startDay: 14, endDay: 18, status: "booked", customerInitial: "S" },
  { vehicleId: "V2", startDay: 7, endDay: 12, status: "booked", customerInitial: "P" },
  { vehicleId: "V2", startDay: 22, endDay: 26, status: "booked", customerInitial: "D" },
  { vehicleId: "V3", startDay: 3, endDay: 9, status: "booked", customerInitial: "C" },
  { vehicleId: "V3", startDay: 25, endDay: 31, status: "booked", customerInitial: "S" },
  { vehicleId: "V4", startDay: 10, endDay: 15, status: "booked", customerInitial: "J" },
  { vehicleId: "V5", startDay: 18, endDay: 24, status: "booked", customerInitial: "P" },
  // Maintenance
  { vehicleId: "V1", startDay: 8, endDay: 10, status: "maintenance" },
  { vehicleId: "V4", startDay: 20, endDay: 22, status: "maintenance" },
  // Blocked
  { vehicleId: "V5", startDay: 1, endDay: 4, status: "blocked" },
  { vehicleId: "V2", startDay: 28, endDay: 31, status: "blocked" },
]

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function buildVehicleCalendar(
  vehicleId: string,
  events: CalendarEvent[],
  daysInMonth: number
): Record<number, DayEntry> {
  const calendar: Record<number, DayEntry> = {}
  for (let d = 1; d <= daysInMonth; d++) {
    calendar[d] = { status: "available" }
  }
  for (const evt of events) {
    if (evt.vehicleId !== vehicleId) continue
    for (let d = evt.startDay; d <= Math.min(evt.endDay, daysInMonth); d++) {
      calendar[d] = { status: evt.status, customerInitial: evt.customerInitial }
    }
  }
  return calendar
}

function getMonthLabel(baseYear: number, baseMonth: number, offset: number): string {
  const date = new Date(baseYear, baseMonth + offset, 1)
  return date.toLocaleDateString("en-AU", { month: "long", year: "numeric" })
}

function getMonthMeta(
  baseYear: number,
  baseMonth: number,
  offset: number
): { year: number; month: number; daysInMonth: number } {
  const date = new Date(baseYear, baseMonth + offset, 1)
  const year = date.getFullYear()
  const month = date.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  return { year, month, daysInMonth }
}

// ------------------------------------------------------------------
// Day cell
// ------------------------------------------------------------------

function DayCell({
  entry,
  isToday,
}: {
  entry: DayEntry
  isToday: boolean
}) {
  const base = "flex h-8 w-full items-center justify-center rounded text-xs font-medium transition-colors"

  const colorMap: Record<DayStatus, string> = {
    available: "bg-green-500/20 text-green-700 dark:text-green-400",
    booked: "bg-blue-500/40 text-blue-800 dark:text-blue-200",
    maintenance: "bg-yellow-500/40 text-yellow-800 dark:text-yellow-200",
    blocked: "bg-muted text-muted-foreground",
  }

  return (
    <div
      className={cn(
        base,
        colorMap[entry.status],
        isToday && "ring-2 ring-offset-1 ring-primary ring-offset-background"
      )}
    >
      {entry.status === "booked" && entry.customerInitial ? (
        <span className="font-bold">{entry.customerInitial}</span>
      ) : null}
    </div>
  )
}

// ------------------------------------------------------------------
// Legend
// ------------------------------------------------------------------

function Legend() {
  const items = [
    { label: "Available", className: "bg-green-500/20" },
    { label: "Booked", className: "bg-blue-500/40" },
    { label: "Maintenance", className: "bg-yellow-500/40" },
    { label: "Blocked", className: "bg-muted" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={cn("h-3 w-3 rounded-sm", item.className)} />
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ------------------------------------------------------------------
// Page
// ------------------------------------------------------------------

// Base month is July 2026 (month index 6, year 2026)
const BASE_YEAR = 2026
const BASE_MONTH = 6 // July
const TODAY_DAY = 28 // July 28 2026

export default function CalendarPage() {
  const [offset, setOffset] = useState(0)

  const { year, month, daysInMonth } = getMonthMeta(BASE_YEAR, BASE_MONTH, offset)
  const monthLabel = getMonthLabel(BASE_YEAR, BASE_MONTH, offset)

  // Only show today marker when viewing July 2026
  const isCurrentMonth = year === BASE_YEAR && month === BASE_MONTH

  // Use July events only when on the base month; otherwise show empty month
  const activeEvents = offset === 0 ? EVENTS_JULY : []

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Availability Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fleet availability at a glance
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month nav */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOffset((o) => o - 1)}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center text-sm font-medium px-2">
              {monthLabel}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOffset((o) => o + 1)}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline">
            <Lock className="h-4 w-4" />
            Block Dates
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div
            className="grid min-w-max"
            style={{
              gridTemplateColumns: `200px repeat(${daysInMonth}, minmax(32px, 1fr))`,
            }}
          >
            {/* Header row: vehicle label col + day numbers */}
            <div className="sticky left-0 z-10 bg-card border-b border-r border-border px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Vehicle
            </div>
            {days.map((day) => (
              <div
                key={day}
                className={cn(
                  "border-b border-border px-1 py-2 text-center text-xs font-medium",
                  isCurrentMonth && day === TODAY_DAY
                    ? "text-primary font-bold"
                    : "text-muted-foreground"
                )}
              >
                {day}
              </div>
            ))}

            {/* Vehicle rows */}
            {VEHICLES.map((vehicle, vIdx) => {
              const calendar = buildVehicleCalendar(
                vehicle.id,
                activeEvents,
                daysInMonth
              )
              const isLast = vIdx === VEHICLES.length - 1

              return (
                <>
                  {/* Vehicle name cell */}
                  <div
                    key={`label-${vehicle.id}`}
                    className={cn(
                      "sticky left-0 z-10 bg-card border-r border-border px-3 py-2",
                      !isLast && "border-b"
                    )}
                  >
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {vehicle.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{vehicle.plate}</p>
                  </div>

                  {/* Day cells */}
                  {days.map((day) => (
                    <div
                      key={`${vehicle.id}-${day}`}
                      className={cn(
                        "px-0.5 py-1.5",
                        !isLast && "border-b border-border"
                      )}
                    >
                      <DayCell
                        entry={calendar[day]}
                        isToday={isCurrentMonth && day === TODAY_DAY}
                      />
                    </div>
                  ))}
                </>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Legend />
    </div>
  )
}
