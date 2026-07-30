import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-compatible config — no Prisma, no Node.js-only imports.
// Used by middleware to protect routes without a DB call.
export const authConfig: NextAuthConfig = {
  providers: [Google],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: (token.userId ?? token.sub ?? "") as string,
          status: (token.status ?? "PENDING") as string,
          role: (token.role ?? "AGENT") as string,
        },
      };
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      // Only the admin back office requires authentication — the public
      // marketing site is open to everyone.
      if (!path.startsWith("/admin")) return true;

      if (!isLoggedIn) {
        return Response.redirect(new URL("/sign-in", nextUrl));
      }

      const status = auth.user.status;

      if (status === "REJECTED") {
        return Response.redirect(new URL("/rejected", nextUrl));
      }

      if (status !== "APPROVED") {
        return Response.redirect(new URL("/pending", nextUrl));
      }

      return true;
    },
  },
};
