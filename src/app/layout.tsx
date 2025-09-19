import type { Metadata, Viewport } from "next";
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

const APP_NAME = "Overload";
const APP_DEFAULT_TITLE = "Overload";
const APP_TITLE_TEMPLATE = "%s - Overload";
const APP_DESCRIPTION = "Your fitness journey starts here";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  initialScale: 1,
  viewportFit: "cover",
  width: "device-width",
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
            <div className="relative min-h-screen grid grid-rows-[1fr_auto_auto] safe-area-inset">
              <div data-vaul-drawer-wrapper="true">{children}</div>
              <div className="sticky bottom-0">
                <Navbar />
              </div>
              <Footer />
            </div>
            <Toaster position="top-right" className="pointer-events-auto" />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
