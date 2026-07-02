"use client";

import {
  IconArrowRight,
  IconDotsVertical,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteProject } from "@/app/dashboard/projects/actions";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import type { ProjectWithProgress } from "@/lib/queries";
import { PROJECT_STATUS_META } from "@/lib/task-format";
import { cn } from "@/lib/utils";

export function ProjectCard({ project }: { project: ProjectWithProgress }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const statusMeta = PROJECT_STATUS_META[project.status];
  const color = project.color ?? "var(--primary)";

  function handleDelete() {
    if (
      !window.confirm(
        `Supprimer le projet « ${project.name} » ? Les tâches associées ne seront pas supprimées.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteProject(project.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Projet supprimé.");
      router.refresh();
    });
  }

  return (
    <Card
      data-testid="project-card"
      data-project-id={project.id}
      className={cn("overflow-hidden", isPending && "opacity-70")}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
      <CardHeader className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-heading text-base font-semibold">
              {project.name}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              {project.description ?? "Sans description"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              data-testid="project-menu"
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <IconDotsVertical className="size-4" />
              <span className="sr-only">Actions du projet</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                data-testid="project-edit"
                onSelect={() => setEditOpen(true)}
              >
                <IconPencil />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                data-testid="project-delete"
                variant="destructive"
                onSelect={handleDelete}
              >
                <IconTrash />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1.5">
            <span
              className={cn("size-1.5 rounded-full", statusMeta.dotClass)}
            />
            {statusMeta.label}
          </Badge>
          <span className="text-sm text-muted-foreground tabular-nums">
            {project.progress}%
          </span>
        </div>
        <Progress value={project.progress} />
        <p className="text-xs text-muted-foreground">
          {project.doneCount} / {project.taskCount} tâches terminées
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/dashboard/tasks?project=${project.id}`}>
            Voir les tâches
            <IconArrowRight />
          </Link>
        </Button>
      </CardFooter>

      <ProjectDialog
        project={{
          id: project.id,
          name: project.name,
          description: project.description,
          color: project.color,
          status: project.status,
        }}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </Card>
  );
}
