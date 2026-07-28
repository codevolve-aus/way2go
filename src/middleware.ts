import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    // Skip Next.js internals, static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
