import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg mb-4">
        WZ
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">Page Not Found</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Button className="mt-6" render={<Link href="/" />}>
        Back to Home
      </Button>
    </div>
  )
}
