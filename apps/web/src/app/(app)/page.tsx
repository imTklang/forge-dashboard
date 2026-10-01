import { GreetingHeader } from "@/components/greeting";
import { MotivationCard } from "@/components/motivation-card";
import { PageFrame } from "@/components/page-frame";
import { Suggestions } from "@/components/suggestions";
import { TaskList } from "@/components/task-list";
import { TodayStats } from "@/components/today-stats";

export default function TodayPage() {
  return (
    <PageFrame header={<GreetingHeader />}>
      <TodayStats />
      <TaskList />
      <div className="grid gap-4 md:grid-cols-2">
        <MotivationCard />
        <Suggestions />
      </div>
    </PageFrame>
  );
}
