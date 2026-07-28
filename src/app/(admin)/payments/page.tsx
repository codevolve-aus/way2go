import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  AlertCircle,
  Clock,
  Receipt,
  Download,
  Send,
  Eye,
} from "lucide-react";

export const metadata = { title: "Payments" };

const payments = [
  {
    id: "PAY-001",
    bookingId: "BK-1042",
    customer: "James Nguyen",
    amount: 450.0,
    type: "DEPOSIT",
    method: "CARD",
    date: "2026-07-20",
  },
  {
    id: "PAY-002",
    bookingId: "BK-1043",
    customer: "Sarah Mitchell",
    amount: 1250.0,
    type: "RENTAL_FEE",
    method: "CARD",
    date: "2026-07-21",
  },
  {
    id: "PAY-003",
    bookingId: "BK-1038",
    customer: "David Chen",
    amount: 200.0,
    type: "DAMAGE_FEE",
    method: "CASH",
    date: "2026-07-19",
  },
  {
    id: "PAY-004",
    bookingId: "BK-1044",
    customer: "Emma Patel",
    amount: 850.0,
    type: "RENTAL_FEE",
    method: "BANK_TRANSFER",
    date: "2026-07-22",
  },
  {
    id: "PAY-005",
    bookingId: "BK-1045",
    customer: "Tom Walsh",
    amount: 300.0,
    type: "DEPOSIT",
    method: "CARD",
    date: "2026-07-23",
  },
  {
    id: "PAY-006",
    bookingId: "BK-1039",
    customer: "Lily Tran",
    amount: 75.0,
    type: "LATE_FEE",
    method: "CASH",
    date: "2026-07-18",
  },
  {
    id: "PAY-007",
    bookingId: "BK-1046",
    customer: "Michael Park",
    amount: 2100.0,
    type: "RENTAL_FEE",
    method: "CARD",
    date: "2026-07-24",
  },
  {
    id: "PAY-008",
    bookingId: "BK-1040",
    customer: "Aisha Rahman",
    amount: 500.0,
    type: "DEPOSIT",
    method: "BANK_TRANSFER",
    date: "2026-07-17",
  },
];

const invoices = [
  {
    id: "INV-2026-0091",
    bookingId: "BK-1042",
    subtotal: 1136.36,
    gst: 113.64,
    total: 1250.0,
    status: "PAID",
    dueDate: "2026-07-25",
  },
  {
    id: "INV-2026-0092",
    bookingId: "BK-1043",
    subtotal: 772.73,
    gst: 77.27,
    total: 850.0,
    status: "OVERDUE",
    dueDate: "2026-07-15",
  },
  {
    id: "INV-2026-0093",
    bookingId: "BK-1044",
    subtotal: 1909.09,
    gst: 190.91,
    total: 2100.0,
    status: "SENT",
    dueDate: "2026-08-05",
  },
  {
    id: "INV-2026-0094",
    bookingId: "BK-1045",
    subtotal: 409.09,
    gst: 40.91,
    total: 450.0,
    status: "DRAFT",
    dueDate: "2026-08-10",
  },
  {
    id: "INV-2026-0095",
    bookingId: "BK-1046",
    subtotal: 681.82,
    gst: 68.18,
    total: 750.0,
    status: "OVERDUE",
    dueDate: "2026-07-10",
  },
];

const outstanding = [
  {
    bookingId: "BK-1043",
    customer: "Sarah Mitchell",
    vehicle: "Toyota Camry (ABC-123)",
    balance: 800.0,
    dueDate: "2026-07-15",
  },
  {
    bookingId: "BK-1046",
    customer: "Lily Tran",
    vehicle: "Honda CR-V (XYZ-789)",
    balance: 750.0,
    dueDate: "2026-07-10",
  },
  {
    bookingId: "BK-1047",
    customer: "Ryan Kim",
    vehicle: "Hyundai i30 (DEF-456)",
    balance: 350.0,
    dueDate: "2026-07-28",
  },
  {
    bookingId: "BK-1048",
    customer: "Nina Okafor",
    vehicle: "Ford Ranger (GHI-321)",
    balance: 1200.0,
    dueDate: "2026-08-01",
  },
];

function paymentTypeBadge(type: string) {
  const map: Record<string, string> = {
    DEPOSIT: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    RENTAL_FEE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    DAMAGE_FEE: "bg-red-500/15 text-red-400 border-red-500/30",
    LATE_FEE: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  };
  const label: Record<string, string> = {
    DEPOSIT: "Deposit",
    RENTAL_FEE: "Rental Fee",
    DAMAGE_FEE: "Damage Fee",
    LATE_FEE: "Late Fee",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${map[type] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {label[type] ?? type}
    </span>
  );
}

function methodBadge(method: string) {
  const map: Record<string, string> = {
    CARD: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    CASH: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    BANK_TRANSFER: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  };
  const label: Record<string, string> = {
    CARD: "Card",
    CASH: "Cash",
    BANK_TRANSFER: "Bank Transfer",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${map[method] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {label[method] ?? method}
    </span>
  );
}

function invoiceStatusBadge(status: string) {
  const map: Record<string, string> = {
    PAID: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    OVERDUE: "bg-red-500/15 text-red-400 border-red-500/30",
    SENT: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    DRAFT: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {status}
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

const today = "2026-07-28";

export default function PaymentsPage() {
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const outstandingBalance = outstanding.reduce((s, o) => s + o.balance, 0);
  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage payments and invoicing
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Collected This Month
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fmtCurrency(totalCollected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Balance
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-400">
              {fmtCurrency(outstandingBalance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Invoices
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">All Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {p.bookingId}
                      </TableCell>
                      <TableCell className="font-medium">{p.customer}</TableCell>
                      <TableCell className="text-right font-mono">
                        {fmtCurrency(p.amount)}
                      </TableCell>
                      <TableCell>{paymentTypeBadge(p.type)}</TableCell>
                      <TableCell>{methodBadge(p.method)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {fmtDate(p.date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Receipt className="h-4 w-4 mr-1" />
                          View Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Booking #</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">GST</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => {
                    const isOverdue = inv.dueDate < today && inv.status !== "PAID";
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-xs">
                          {inv.id}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {inv.bookingId}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {fmtCurrency(inv.subtotal)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {fmtCurrency(inv.gst)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {fmtCurrency(inv.total)}
                        </TableCell>
                        <TableCell>{invoiceStatusBadge(inv.status)}</TableCell>
                        <TableCell
                          className={`text-sm ${isOverdue ? "text-red-400 font-medium" : "text-muted-foreground"}`}
                        >
                          {fmtDate(inv.dueDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
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
        </TabsContent>

        <TabsContent value="outstanding" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstanding
                    .slice()
                    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                    .map((o) => {
                      const isOverdue = o.dueDate < today;
                      return (
                        <TableRow key={o.bookingId}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {o.bookingId}
                          </TableCell>
                          <TableCell className="font-medium">{o.customer}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {o.vehicle}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-red-400">
                            {fmtCurrency(o.balance)}
                          </TableCell>
                          <TableCell
                            className={`text-sm ${isOverdue ? "text-red-400 font-medium" : "text-muted-foreground"}`}
                          >
                            {isOverdue && (
                              <AlertCircle className="h-3 w-3 inline mr-1" />
                            )}
                            {fmtDate(o.dueDate)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
