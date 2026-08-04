import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { PWARegister } from "@/components/pwa-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: { default: "WayZo", template: "%s | WayZo" },
  description:
    "WayZo Rentals — reliable car, SUV and van hire across Sydney. Browse our fleet and send a booking enquiry today.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WayZo",
  },
  icons: {
    apple: [{ url: "/icons/icon.svg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="h-full antialiased">
        <TooltipProvider delay={200}>{children}</TooltipProvider>
        <Toaster richColors position="top-right" />
        <PWARegister />
      </body>
    </html>
  );
}
