import { Nav } from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1400px] gap-4 p-3 pb-28 lg:p-5 lg:pb-5">
      <Nav />
      <main id="main" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
