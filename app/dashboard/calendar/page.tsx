import { CalendarView } from "@/components/calendar/calendar-view";
import {
  getCalendarTasks,
  getMembers,
  getProjectsWithProgress,
  requireUser,
} from "@/lib/queries";

export default async function CalendarPage() {
  const user = await requireUser();
  const [tasks, projects, members] = await Promise.all([
    getCalendarTasks(user.id),
    getProjectsWithProgress(user.id),
    getMembers(user.id),
  ]);

  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
    color: project.color,
  }));
  const memberOptions = members.map((member) => ({
    id: member.id,
    name: member.name,
  }));

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Calendrier
        </h1>
        <p className="text-sm text-muted-foreground">
          Visualisez vos échéances et planifiez votre semaine.
        </p>
      </div>

      <CalendarView
        tasks={tasks}
        projects={projectOptions}
        members={memberOptions}
      />
    </>
  );
}
