"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, HeartPulse, LayoutGrid, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const items: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Hoje", icon: LayoutGrid },
  { href: "/saude", label: "Saúde", icon: HeartPulse },
  { href: "/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav aria-label="Principal" className="fixed inset-x-3 bottom-3 z-40 pb-[env(safe-area-inset-bottom)] lg:static lg:inset-auto lg:pb-0">
      <ul className="flex justify-around gap-1 rounded-3xl border bg-card p-1.5 backdrop-blur-xl lg:sticky lg:top-5 lg:h-fit lg:flex-col lg:justify-start lg:py-4">
        <li className="hidden px-3 pb-2 text-lg font-semibold tracking-tight text-primary lg:block" aria-hidden="true" translate="no">F</li>
        {items.map(({ href, label, icon: Icon }) => (
          <li key={href} className="flex-1 lg:flex-none">
            <Link
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              title={label}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:size-11 lg:justify-center lg:p-0",
                isActive(href) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              <Icon aria-hidden="true" className="size-5" />
              <span className="lg:sr-only">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
