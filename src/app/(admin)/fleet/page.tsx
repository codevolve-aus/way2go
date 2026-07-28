import { Metadata } from "next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FleetTable } from "./fleet-table";

export const metadata: Metadata = { title: "Fleet" };

export default function FleetPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Fleet</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and monitor all vehicles in your fleet.
          </p>
        </div>
        <Button variant="outline">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Interactive filter bar + table (client component) */}
      <FleetTable />
    </div>
  );
}
