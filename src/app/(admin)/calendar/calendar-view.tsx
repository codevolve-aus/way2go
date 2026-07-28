"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────

type DayStatus = "available" | "booked" | "maintenance" | "blocked"

interface DayEntry {
  status: DayStatus
  label?: string // customer initial or block reason initial
  tooltip?: string
}

export interface VehicleRow {
  id: string
  name: string
  plate: string
}

export interface BookingEvent {
  vehicleId: string
  startDate: string // ISO
  endDate: string   // ISO (inclusive)
  customerName: string
  bookingNumber: string
  status: string
}

export interface MaintenanceEvent {
  vehicleId: string
  startDate: string
  endDate: string // scheduledDate (point-in-time — treat as single day)
}

export interface BlockEvent {
  vehicleId: string
  startDate: string
  endDate: string
  reason: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function toYMD(date: Date | string): [number, number, number] {
  const d = typeof date === "string" ? new Date(date) : date
  return [d.getFullYear(), d.getMonth(), d.getDate()]
}

function overlapsDay(
  startISO: string,
  endISO: string,
  year: number,
  month: number,
  day: number
): boolean {
  const target = new Date(year, month, day)
  const start = new Date(startISO)
  const end = new Date(endISO)
  // Normalise to date-only comparison
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  target.setHours(12, 0, 0, 0)
  return target >= start && target <= end
}

function buildCalendar(
  vehicleId: string,
  year: number,
  month: number,
  daysInMonth: number,
  bookings: BookingEvent[],
  maintenance: MaintenanceEvent[],
  blocks: BlockEvent[]
): Record<number, DayEntry> {
  const cal: Record<number, DayEntry> = {}
  for (let d = 1; d <= daysInMonth; d++) {
    cal[d] = { status: "available" }
  }

  for (const b of bookings) {
    if (b.vehicleId !== vehicleId) continue
    for (let d = 1; d <= daysInMonth; d++) {
      if (overlapsDay(b.startDate, b.endDate, year, month, d)) {
        const initial = b.customerName.charAt(0).toUpperCase()
        cal[d] = { status: "booked", label: initial, tooltip: `${b.customerName} · ${b.bookingNumber}` }
      }
    }
  }

  for (const m of maintenance) {
    if (m.vehicleId !== vehicleId) continue
    for (let d = 1; d <= daysInMonth; d++) {
      if (overlapsDay(m.startDate, m.endDate, year, month, d)) {
        // Don't overwrite a booking
        if (cal[d].status !== "booked") {
          cal[d] = { status: "maintenance", label: "M", tooltip: "Maintenance" }
        }
      }
    }
  }

  for (const bl of blocks) {
    if (bl.vehicleId !== vehicleId) continue
    for (let d = 1; d <= daysInMonth; d++) {
      if (overlapsDay(bl.startDate, bl.endDate, year, month, d)) {
        if (cal[d].status === "available") {
          cal[d] = { status: "blocked", label: "B", tooltip: bl.reason }
        }
      }
    }
  }

  return cal
}

// ── Sub-components ─────────────────────────────────────────────────────────

const colorMap: Record<DayStatus, string> = {
  available:   "bg-green-500/20 text-green-700 dark:text-green-400",
  booked:      "bg-blue-500/40 text-blue-800 dark:text-blue-200",
  maintenance: "bg-yellow-500/40 text-yellow-800 dark:text-yellow-200",
  blocked:     "bg-muted text-muted-foreground",
}

function DayCell({ entry, isToday }: { entry: DayEntry; isToday: boolean }) {
  return (
    <div
      title={entry.tooltip}
      className={cn(
        "flex h-8 w-full items-center justify-center rounded text-xs font-medium transition-colors cursor-default",
        colorMap[entry.status],
        isToday && "ring-2 ring-offset-1 ring-primary ring-offset-background"
      )}
    >
      {entry.label ?? null}
    </div>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {[
        { label: "Available",    className: "bg-green-500/20" },
        { label: "Booked",       className: "bg-blue-500/40" },
        { label: "Maintenance",  className: "bg-yellow-500/40" },
        { label: "Blocked",      className: "bg-muted" },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={cn("h-3 w-3 rounded-sm", item.className)} />
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

interface Props {
  vehicles: VehicleRow[]
  bookings: BookingEvent[]
  maintenance: MaintenanceEvent[]
  blocks: BlockEvent[]
}

export function CalendarView({ vehicles, bookings, maintenance, blocks }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const daysInMonth = getDaysInMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  })

  const todayY = now.getFullYear()
  const todayM = now.getMonth()
  const todayD = now.getDate()
  const isCurrentMonth = year === todayY && month === todayM

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }
  function goToday() { setYear(todayY); setMonth(todayM) }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Availability Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Fleet availability at a glance</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background">
            <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center text-sm font-medium px-2">
              {monthLabel}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <Lock className="h-4 w-4" />
            Block Dates
          </Button>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
          No vehicles in fleet. Add vehicles first.
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <div
              className="grid min-w-max"
              style={{ gridTemplateColumns: `200px repeat(${daysInMonth}, minmax(30px, 1fr))` }}
            >
              {/* Header row */}
              <div className="sticky left-0 z-10 bg-card border-b border-r border-border px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Vehicle
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className={cn(
                    "border-b border-border px-1 py-2 text-center text-xs font-medium",
                    isCurrentMonth && day === todayD
                      ? "text-primary font-bold"
                      : "text-muted-foreground"
                  )}
                >
                  {day}
                </div>
              ))}

              {/* Vehicle rows */}
              {vehicles.map((vehicle, vIdx) => {
                const calendar = buildCalendar(
                  vehicle.id, year, month, daysInMonth,
                  bookings, maintenance, blocks
                )
                const isLast = vIdx === vehicles.length - 1

                return (
                  <>
                    <div
                      key={`label-${vehicle.id}`}
                      className={cn(
                        "sticky left-0 z-10 bg-card border-r border-border px-3 py-2",
                        !isLast && "border-b"
                      )}
                    >
                      <p className="text-sm font-medium text-foreground leading-tight">{vehicle.name}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.plate}</p>
                    </div>

                    {days.map((day) => (
                      <div
                        key={`${vehicle.id}-${day}`}
                        className={cn("px-0.5 py-1.5", !isLast && "border-b border-border")}
                      >
                        <DayCell
                          entry={calendar[day]}
                          isToday={isCurrentMonth && day === todayD}
                        />
                      </div>
                    ))}
                  </>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Legend />
    </div>
  )
}
