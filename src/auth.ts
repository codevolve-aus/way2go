import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      // Only runs on sign-in (account is present)
      if (account && user?.email) {
        const adminEmail = process.env.ADMIN_EMAIL;

        let dbUser = await db.userApproval.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          dbUser = await db.userApproval.create({
            data: {
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
              status: user.email === adminEmail ? "APPROVED" : "PENDING",
              role: user.email === adminEmail ? "ADMIN" : "AGENT",
            },
          });
        } else if (user.email === adminEmail && dbUser.status !== "APPROVED") {
          // Admin is always approved, even if previously set otherwise
          dbUser = await db.userApproval.update({
            where: { email: user.email },
            data: { status: "APPROVED", role: "ADMIN" },
          });
        }

        token.userId = dbUser.id;
        token.status = dbUser.status;
        token.role = dbUser.role;
      }
      return token;
    },
  },
});
