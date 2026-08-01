import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { db } from "@/lib/db";

// Public pages pull live fleet/location data from the DB — revalidate
// hourly so admin changes show up without a redeploy.
export const revalidate = 3600;

async function getPrimaryPhone() {
  try {
    const location = await db.location.findFirst({
      where: { isActive: true, phone: { not: null } },
      orderBy: { createdAt: "asc" },
    });
    return location?.phone ?? null;
  } catch {
    return null;
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const phone = await getPrimaryPhone();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader phone={phone} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
