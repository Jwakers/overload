export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
      {children}
    </main>
  );
}
