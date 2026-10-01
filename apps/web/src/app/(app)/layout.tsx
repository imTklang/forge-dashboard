import { Nav } from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-350 gap-4 p-3 pb-28 lg:h-dvh lg:p-5 lg:pb-5">
      <Nav />
      <main id="main" className="min-w-0 flex-1 lg:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
