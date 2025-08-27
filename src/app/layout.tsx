import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { cx } from "class-variance-authority";
import ConvexClientProvider from "./convex-client-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Overload",
  description: "Your fitness journey starts here",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cx(geistSans.variable, geistMono.variable, "antialiased")}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <div className="relative min-h-screen grid grid-rows-[1fr_auto_auto]">
              <div data-vaul-drawer-wrapper="true">{children}</div>
              <div className="sticky bottom-0">
                <Navbar />
              </div>
              <Footer />
            </div>
            <Toaster className="pointer-events-auto" />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
