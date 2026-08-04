import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Building2,
  MapPin,
  Users,
  ShieldCheck,
} from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { UsersTab } from "./users-tab";
import { PushNotificationsToggle } from "./push-notifications-toggle";

export const metadata = { title: "Settings" };

// fetch only when the page renders — not cached, always fresh
async function getUsers() {
  try {
    return await db.userApproval.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

const notifications = [
  { id: "booking_confirmed", label: "Booking Confirmed" },
  { id: "contract_ready", label: "Contract Ready" },
  { id: "return_reminder", label: "Return Reminder" },
  { id: "payment_received", label: "Payment Received" },
  { id: "maintenance_due", label: "Maintenance Due" },
];


export default async function SettingsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const users = isAdmin ? await getUsers() : [];
  const pendingCount = users.filter((u) => u.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your company, locations, staff, users and notifications
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
          {isAdmin && (
            <TabsTrigger value="users" className="relative">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Users
              {pendingCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-black">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company Details</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Company settings persistence is coming soon.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue="WAYZO PTY LTD" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="abn">ABN</Label>
                  <Input id="abn" defaultValue="99 700 912 698" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+61 2 0000 0000" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="admin@example.com" />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" placeholder="123 Example Street" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Sydney" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="NSW" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input id="postcode" placeholder="2000" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button disabled>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Branch Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-6 text-center">
                Branch location management is coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Staff Members</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage user access via the <strong>Users</strong> tab.
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-6 text-center">
                Staff role management is coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Push Notifications</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Mobile/desktop reminders sent directly to this device.
              </p>
            </CardHeader>
            <CardContent>
              <PushNotificationsToggle />
            </CardContent>
          </Card>

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
        {/* Users Tab */}
        {isAdmin && (
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Access Management</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Approve or reject users who have signed in with Google.
                  </p>
                </div>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                    {pendingCount} pending
                  </span>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <UsersTab users={users} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
