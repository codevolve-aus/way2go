import { auth, signOut } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export const metadata = { title: "Awaiting Approval" };

export default async function PendingPage() {
  const session = await auth();

  return (
    <Card className="w-full max-w-sm text-center">
      <CardHeader className="space-y-3">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/15 text-yellow-500">
            <Clock className="h-7 w-7" />
          </div>
        </div>
        <CardTitle>Awaiting Approval</CardTitle>
        <CardDescription>
          Your account ({session?.user?.email}) has been registered and is
          pending administrator approval. You will be able to access the system
          once your account is approved.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Please contact the system administrator if you need urgent access.
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/sign-in" });
          }}
        >
          <Button type="submit" variant="outline" className="w-full">
            Sign Out
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
