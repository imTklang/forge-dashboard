import { PageFrame, PageHeader } from "@/components/page-frame";
import { ProjectsView } from "@/components/projects-view";

export const metadata = { title: "Projetos · Forge" };

export default function ProjectsPage() {
  return (
    <PageFrame header={<PageHeader title="Projetos" description="Atividade no GitHub e tarefas abertas." />} aside={false}>
      <ProjectsView />
    </PageFrame>
  );
}
