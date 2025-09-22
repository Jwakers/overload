import Footer from "@/components/footer";
import Header from "@/components/header";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <div className="relative min-h-screen grid grid-rows-[1fr_auto_auto] safe-area-inset">
        <div data-vaul-drawer-wrapper="true">{children}</div>
        <div className="sticky bottom-0">
          <Navbar />
        </div>
        <Footer />
      </div>
      <Toaster position="top-right" className="pointer-events-auto" />
    </div>
  );
}
