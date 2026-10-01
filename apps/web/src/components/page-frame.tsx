import { RightPanel } from "./right-panel";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="flex flex-col gap-1">
      <h1>{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </header>
  );
}

/** Estrutura comum das páginas: cabeçalho + conteúdo, com painel lateral opcional. */
export function PageFrame({ header, aside = true, children }: { header: React.ReactNode; aside?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {header}
        {children}
      </div>
      {aside && <RightPanel />}
    </div>
  );
}
