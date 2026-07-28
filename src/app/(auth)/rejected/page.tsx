import { signOut } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export const metadata = { title: "Access Denied" };

export default function RejectedPage() {
  return (
    <Card className="w-full max-w-sm text-center">
      <CardHeader className="space-y-3">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <ShieldX className="h-7 w-7" />
          </div>
        </div>
        <CardTitle>Access Denied</CardTitle>
        <CardDescription>
          Your access request has been declined. Please contact the system
          administrator if you believe this is an error.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/sign-in" });
          }}
        >
          <Button type="submit" variant="outline" className="w-full">
            Back to Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
