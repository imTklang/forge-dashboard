"use client";

import { useEffect, useState } from "react";
import { CircleAlert, GitCommitHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client";

type Project = { slug: string; name: string; repo: string | null; openTasks: number; idleDays: number | null; lastCommit: { message: string } | null; commitsWeek: number; openIssues: number };

function IdleBadge({ days }: { days: number }) {
  const variant = days >= 30 ? "destructive" : days >= 7 ? "warning" : "success";
  return <Badge variant={variant}>{days === 0 ? "Hoje" : `${days} ${days === 1 ? "dia" : "dias"} parado`}</Badge>;
}

export function ProjectsView() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  useEffect(() => {
    api<Project[]>("/projects").then(setProjects).catch(() => setProjects([]));
  }, []);

  if (!projects) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((p) => (
        <li key={p.slug}>
          <Card className="h-full">
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="truncate">{p.name}</h2>
                {p.idleDays !== null && <IdleBadge days={p.idleDays} />}
              </div>
              {p.repo ? (
                <>
                  <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                    <GitCommitHorizontal aria-hidden="true" className="size-4 shrink-0" />
                    <span className="truncate">{p.lastCommit?.message ?? "Aguardando sincronização"}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
                    <span className="tabular-nums">{p.openIssues} issues · {p.commitsWeek} commits na semana</span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Sem repositório vinculado.</p>
              )}
              {p.openTasks > 0 && <p className="text-xs text-muted-foreground tabular-nums">{p.openTasks} {p.openTasks === 1 ? "tarefa aberta" : "tarefas abertas"}</p>}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
