import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  Building2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { UsersTab } from "./users-tab";
import { PushNotificationsToggle } from "./push-notifications-toggle";
import { CompanyTab } from "./company-tab";
import { LocationsTab } from "./locations-tab";
import { EmailNotificationsCard } from "./email-notifications-card";
import { getCompanyDetails } from "./company-actions";
import { getNotificationPrefs } from "@/lib/notifications-actions";

export const metadata = { title: "Settings" };

// fetch only when the page renders — not cached, always fresh
async function getUsers() {
  try {
    return await db.userApproval.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

async function getLocations() {
  try {
    return await db.location.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

export default async function SettingsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const [users, locations, companyDetails, notificationPrefs] = await Promise.all([
    isAdmin ? getUsers() : Promise.resolve([]),
    getLocations(),
    getCompanyDetails(),
    getNotificationPrefs(),
  ]);
  const pendingCount = users.filter((u) => u.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your company, locations, users and notifications
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
          <CompanyTab companyDetails={companyDetails} />
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="mt-6">
          <LocationsTab locations={locations} />
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

          <EmailNotificationsCard prefs={notificationPrefs} />
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
