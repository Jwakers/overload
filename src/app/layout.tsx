import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Header from "@/components/header";
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
            <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
              <Header />
              <div>{children}</div>
              <footer className="bg-card border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="text-center text-muted-foreground">
                    <p>
                      &copy; {new Date().getFullYear()} Overload. All rights
                      reserved.
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
