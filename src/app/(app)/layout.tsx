import Footer from "@/components/footer";
import Header from "@/components/header";
import Navbar from "@/components/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-vaul-drawer-wrapper="true">
      <Header />
      <div className="relative min-h-screen grid grid-rows-[1fr_auto_auto]">
        <div>{children}</div>
        <Footer />
        <div className="sticky bottom-0">
          <Navbar />
        </div>
      </div>
    </div>
  );
}
