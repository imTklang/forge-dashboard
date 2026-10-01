import { HealthView } from "@/components/health-view";
import { PageFrame, PageHeader } from "@/components/page-frame";

export const metadata = { title: "Saúde · Forge" };

export default function HealthPage() {
  return (
    <PageFrame header={<PageHeader title="Saúde" description="Recovery, HRV, sono e strain." />} aside={false}>
      <HealthView />
    </PageFrame>
  );
}
