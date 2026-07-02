import { TasksView } from "@/components/tasks/tasks-view";
import {
  getMembers,
  getProjectsWithProgress,
  getTasks,
  requireUser,
} from "@/lib/queries";

export default async function TasksPage() {
  const user = await requireUser();
  const [tasks, projects, members] = await Promise.all([
    getTasks(user.id),
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
          Mes tâches
        </h1>
        <p className="text-sm text-muted-foreground">
          Organisez vos tâches par glisser-déposer, en tableau ou en liste.
        </p>
      </div>

      <TasksView
        tasks={tasks}
        projects={projectOptions}
        members={memberOptions}
      />
    </>
  );
}
