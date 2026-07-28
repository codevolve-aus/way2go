import { Badge } from "@/components/ui/badge";
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
  AlertTriangle,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Eye,
  RefreshCw,
  FileText,
} from "lucide-react";

export const metadata = { title: "Damage & Incidents" };

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
];

function faultBadge(fault: string) {
  const styles: Record<string, string> = {
    CUSTOMER: "bg-red-500/15 text-red-400 border-red-500/30",
    THIRD_PARTY: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    NO_FAULT: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };
  const labels: Record<string, string> = {
    CUSTOMER: "Customer",
    THIRD_PARTY: "Third Party",
    NO_FAULT: "No Fault",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[fault] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {labels[fault] ?? fault}
    </span>
  );
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    REPORTED: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    ASSESSED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    REPAIR_IN_PROGRESS: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    REPAIRED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    RESOLVED: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };
  const labels: Record<string, string> = {
    REPORTED: "Reported",
    ASSESSED: "Assessed",
    REPAIR_IN_PROGRESS: "In Repair",
    REPAIRED: "Repaired",
    RESOLVED: "Resolved",
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

export default function DamagePage() {
  const openReports = damageReports.filter((r) =>
    ["REPORTED", "ASSESSED"].includes(r.status)
  ).length;
  const underRepair = damageReports.filter(
    (r) => r.status === "REPAIR_IN_PROGRESS"
  ).length;
  const insuranceClaims = damageReports.filter((r) =>
    ["THIRD_PARTY"].includes(r.fault)
  ).length;
  const resolvedThisMonth = damageReports.filter((r) =>
    ["REPAIRED", "RESOLVED"].includes(r.status)
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Damage &amp; Incidents
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track and manage vehicle damage reports and incident claims
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Reports
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{openReports}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Under Repair
            </CardTitle>
            <Wrench className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-400">{underRepair}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Insurance Claims
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-400">{insuranceClaims}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved This Month
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-400">
              {resolvedThisMonth}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search reports, vehicle, customer..."
          className="max-w-sm"
        />
        <Select>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="REPORTED">Reported</SelectItem>
            <SelectItem value="ASSESSED">Assessed</SelectItem>
            <SelectItem value="REPAIR_IN_PROGRESS">In Repair</SelectItem>
            <SelectItem value="REPAIRED">Repaired</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Fault Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fault Types</SelectItem>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
            <SelectItem value="THIRD_PARTY">Third Party</SelectItem>
            <SelectItem value="NO_FAULT">No Fault</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report #</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Customer / Contract</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Fault</TableHead>
                <TableHead className="text-right">Repair Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {damageReports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs font-medium">
                    {r.id}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {r.vehicle}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{r.customer}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {r.contract}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p
                      className="text-sm text-muted-foreground truncate"
                      title={r.description}
                    >
                      {r.description}
                    </p>
                  </TableCell>
                  <TableCell>{faultBadge(r.fault)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {fmtCurrency(r.repairCost)}
                  </TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmtDate(r.created)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Claim
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
