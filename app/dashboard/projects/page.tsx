import { ProjectCard } from "@/components/projects/project-card";
import { ProjectDialog } from "@/components/projects/project-dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getProjectsWithProgress, requireUser } from "@/lib/queries";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await getProjectsWithProgress(user.id);

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Projets
          </h1>
          <p className="text-sm text-muted-foreground">
            Regroupez et suivez l'avancement de vos projets.
          </p>
        </div>
        <ProjectDialog />
      </div>

      {projects.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Aucun projet</EmptyTitle>
            <EmptyDescription>
              Créez votre premier projet pour organiser vos tâches.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}
