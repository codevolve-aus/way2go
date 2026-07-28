import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  UserMinus,
  Mail,
  Bell,
  Building2,
  MapPin,
  Users,
} from "lucide-react";

export const metadata = { title: "Settings" };

const company = {
  name: "Way2Go Car Rentals Pty Ltd",
  abn: "51 234 567 890",
  phone: "+61 2 9876 5432",
  email: "admin@way2go.com.au",
  address: "Level 3, 100 George Street",
  city: "Sydney",
  state: "NSW",
  postcode: "2000",
};

const locations = [
  {
    id: 1,
    name: "Sydney CBD",
    address: "100 George Street, Sydney NSW 2000",
    phone: "+61 2 9876 5432",
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Parramatta",
    address: "45 Church Street, Parramatta NSW 2150",
    phone: "+61 2 9891 2345",
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Mascot Airport",
    address: "Terminal 1, Sydney Airport NSW 2020",
    phone: "+61 2 9700 8899",
    status: "ACTIVE",
  },
  {
    id: 4,
    name: "Chatswood",
    address: "72 Victoria Avenue, Chatswood NSW 2067",
    phone: "+61 2 9412 3456",
    status: "INACTIVE",
  },
];

const staff = [
  {
    id: 1,
    name: "Zara Thompson",
    email: "zara.thompson@way2go.com.au",
    role: "ADMIN",
    status: "ACTIVE",
    lastActive: "2026-07-28",
  },
  {
    id: 2,
    name: "Ben Okonkwo",
    email: "ben.okonkwo@way2go.com.au",
    role: "MANAGER",
    status: "ACTIVE",
    lastActive: "2026-07-27",
  },
  {
    id: 3,
    name: "Priya Sharma",
    email: "priya.sharma@way2go.com.au",
    role: "STAFF",
    status: "ACTIVE",
    lastActive: "2026-07-28",
  },
  {
    id: 4,
    name: "Connor Hughes",
    email: "connor.hughes@way2go.com.au",
    role: "STAFF",
    status: "ACTIVE",
    lastActive: "2026-07-25",
  },
  {
    id: 5,
    name: "Grace Kim",
    email: "grace.kim@way2go.com.au",
    role: "STAFF",
    status: "INACTIVE",
    lastActive: "2026-06-10",
  },
];

const notifications = [
  { id: "booking_confirmed", label: "Booking Confirmed", enabled: true },
  { id: "contract_ready", label: "Contract Ready", enabled: true },
  { id: "return_reminder", label: "Return Reminder", enabled: true },
  { id: "payment_received", label: "Payment Received", enabled: true },
  { id: "maintenance_due", label: "Maintenance Due", enabled: false },
];

function roleBadge(role: string) {
  const styles: Record<string, string> = {
    ADMIN: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    MANAGER: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    STAFF: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[role] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
}

function locationStatusBadge(status: string) {
  return status === "ACTIVE" ? (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-zinc-500/15 text-zinc-400 border-zinc-500/30">
      Inactive
    </span>
  );
}

function staffStatusBadge(status: string) {
  return status === "ACTIVE" ? (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-zinc-500/15 text-zinc-400 border-zinc-500/30">
      Inactive
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

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your company, locations, staff and notifications
        </p>
      </div>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">
            <Building2 className="h-4 w-4 mr-2" />
            Company
          </TabsTrigger>
          <TabsTrigger value="locations">
            <MapPin className="h-4 w-4 mr-2" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="staff">
            <Users className="h-4 w-4 mr-2" />
            Staff
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    defaultValue={company.name}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="abn">ABN</Label>
                  <Input id="abn" defaultValue={company.abn} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue={company.phone} />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={company.email} />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" defaultValue={company.address} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" defaultValue={company.city} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" defaultValue={company.state} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input id="postcode" defaultValue={company.postcode} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Branch Locations</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Location
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="pl-6 font-medium">
                        {loc.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {loc.address}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {loc.phone}
                      </TableCell>
                      <TableCell>{locationStatusBadge(loc.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Staff Members</CardTitle>
              <Button size="sm">
                <Mail className="h-4 w-4 mr-1" />
                Invite Staff
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="pl-6 font-medium">{s.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.email}
                      </TableCell>
                      <TableCell>{roleBadge(s.role)}</TableCell>
                      <TableCell>{staffStatusBadge(s.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fmtDate(s.lastActive)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm">
                          <UserMinus className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Notifications</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Choose which events trigger email notifications to your team.
              </p>
            </CardHeader>
            <CardContent className="space-y-0">
              {notifications.map((n, idx) => (
                <div key={n.id}>
                  {idx > 0 && <Separator />}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Send an email when a{" "}
                        {n.label.toLowerCase().replace(/\s/g, " ")} event occurs
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        defaultChecked={n.enabled}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-9 rounded-full border border-border bg-muted transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
                    </label>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="pt-4 flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
