import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarClock,
  AlertTriangle,
  Wrench,
  Plus,
  CheckCircle2,
  Pencil,
  X,
} from "lucide-react";

export const metadata = { title: "Maintenance" };

const today = "2026-07-28";

const maintenanceRecords = [
  {
    id: "MNT-001",
    vehicle: "Toyota Camry (ABC-123)",
    type: "SERVICE",
    scheduledDate: "2026-08-05",
    status: "SCHEDULED",
    odometerDue: 120000,
    cost: null,
    vendor: "Toyota Service Centre Sydney",
  },
  {
    id: "MNT-002",
    vehicle: "Honda CR-V (XYZ-789)",
    type: "REGISTRATION",
    scheduledDate: "2026-07-15",
    status: "OVERDUE",
    odometerDue: null,
    cost: null,
    vendor: "NSW Service NSW",
  },
  {
    id: "MNT-003",
    vehicle: "Ford Ranger (GHI-321)",
    type: "TYRE_REPLACEMENT",
    scheduledDate: "2026-07-30",
    status: "SCHEDULED",
    odometerDue: 85000,
    cost: null,
    vendor: "Bob Jane T-Marts Parramatta",
  },
  {
    id: "MNT-004",
    vehicle: "Hyundai i30 (DEF-456)",
    type: "SERVICE",
    scheduledDate: "2026-07-20",
    status: "IN_PROGRESS",
    odometerDue: 60000,
    cost: null,
    vendor: "Hyundai Authorized Service",
  },
  {
    id: "MNT-005",
    vehicle: "Kia Sportage (JKL-654)",
    type: "INSPECTION",
    scheduledDate: "2026-07-10",
    status: "COMPLETED",
    odometerDue: 50000,
    cost: 180.0,
    vendor: "Quick Inspect Pty Ltd",
  },
  {
    id: "MNT-006",
    vehicle: "Mazda CX-5 (MNO-987)",
    type: "BRAKE_SERVICE",
    scheduledDate: "2026-08-01",
    status: "SCHEDULED",
    odometerDue: 95000,
    cost: null,
    vendor: "Midas Brake & Clutch",
  },
  {
    id: "MNT-007",
    vehicle: "Nissan X-Trail (PQR-111)",
    type: "OIL_CHANGE",
    scheduledDate: "2026-07-25",
    status: "COMPLETED",
    odometerDue: 78000,
    cost: 95.0,
    vendor: "Jiffy Lube Chatswood",
  },
];

function typeBadge(type: string) {
  const styles: Record<string, string> = {
    SERVICE: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    REGISTRATION: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    TYRE_REPLACEMENT: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    INSPECTION: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    BRAKE_SERVICE: "bg-red-500/15 text-red-400 border-red-500/30",
    OIL_CHANGE: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  };
  const labels: Record<string, string> = {
    SERVICE: "Service",
    REGISTRATION: "Registration",
    TYRE_REPLACEMENT: "Tyre Replacement",
    INSPECTION: "Inspection",
    BRAKE_SERVICE: "Brake Service",
    OIL_CHANGE: "Oil Change",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${styles[type] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {labels[type] ?? type}
    </span>
  );
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    SCHEDULED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    OVERDUE: "bg-red-500/15 text-red-400 border-red-500/30",
    IN_PROGRESS: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  };
  const labels: Record<string, string> = {
    SCHEDULED: "Scheduled",
    OVERDUE: "Overdue",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtCurrency(n: number) {
  return `$${n.toFixed(2)}`;
}

const sevenDaysFromNow = new Date(today);
sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0];

export default function MaintenancePage() {
  const upcoming = maintenanceRecords.filter(
    (r) =>
      r.scheduledDate > today &&
      r.scheduledDate <= sevenDaysStr &&
      r.status === "SCHEDULED"
  ).length;
  const overdue = maintenanceRecords.filter(
    (r) => r.status === "OVERDUE"
  ).length;
  const inProgress = maintenanceRecords.filter(
    (r) => r.status === "IN_PROGRESS"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Maintenance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule and track vehicle maintenance
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Service
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming (7 days)
            </CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{upcoming}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-400">{overdue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Wrench className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-400">{inProgress}</p>
          </CardContent>
        </Card>
      </div>

      {overdue > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">
              {overdue} maintenance record{overdue > 1 ? "s are" : " is"} overdue
            </p>
            <p className="text-xs text-red-400/80 mt-0.5">
              Review and action overdue items to ensure fleet compliance and
              vehicle safety.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search vehicle, vendor, type..."
          className="max-w-sm"
        />
        <Select>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="SERVICE">Service</SelectItem>
            <SelectItem value="REGISTRATION">Registration</SelectItem>
            <SelectItem value="TYRE_REPLACEMENT">Tyre Replacement</SelectItem>
            <SelectItem value="INSPECTION">Inspection</SelectItem>
            <SelectItem value="BRAKE_SERVICE">Brake Service</SelectItem>
            <SelectItem value="OIL_CHANGE">Oil Change</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Odometer Due</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceRecords.map((r) => {
                const isOverdue = r.status === "OVERDUE";
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-sm">
                      {r.vehicle}
                    </TableCell>
                    <TableCell>{typeBadge(r.type)}</TableCell>
                    <TableCell
                      className={`text-sm ${isOverdue ? "text-red-400 font-medium" : "text-muted-foreground"}`}
                    >
                      {isOverdue && (
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                      )}
                      {fmtDate(r.scheduledDate)}
                    </TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {r.odometerDue !== null
                        ? `${r.odometerDue.toLocaleString()} km`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {r.cost !== null ? fmtCurrency(r.cost) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                      {r.vendor}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
