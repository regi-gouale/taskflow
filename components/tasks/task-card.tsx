"use client";

import {
  IconCalendarEvent,
  IconDotsVertical,
  IconGripVertical,
  IconPencil,
  IconProgress,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { TaskDialog } from "@/components/tasks/task-dialog";
import type { MemberOption, ProjectOption } from "@/components/tasks/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";
import type { TaskWithRelations } from "@/lib/queries";
import {
  formatDueDate,
  initials,
  isOverdue,
  TASK_PRIORITY_META,
  TASK_STATUS_META,
} from "@/lib/task-format";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: TaskWithRelations;
  projects: ProjectOption[];
  members: MemberOption[];
  isDragging?: boolean;
};

function stopPointer(event: React.PointerEvent) {
  event.stopPropagation();
}

export function TaskCard({
  task,
  projects,
  members,
  isDragging,
}: TaskCardProps) {
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isCommentPending, startCommentTransition] = useTransition();

  const done = task.status === "DONE";
  const overdue = isOverdue(task.dueDate, task.status);
  const priority = TASK_PRIORITY_META[task.priority];
  const status = TASK_STATUS_META[task.status];
  const comments = task.comments;

  const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  function handleOpenDetails() {
    setDetailsOpen(true);
  }

  function handleOpenEditFromDetails() {
    setDetailsOpen(false);
    setEditOpen(true);
  }

  function handleAddComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!comment.trim()) {
      toast.error("Le commentaire est requis.");
      return;
    }

    startCommentTransition(async () => {
      const result = await apiRequest("/api/v1/tasks/comments", {
        method: "POST",
        body: {
          taskId: task.id,
          content: comment,
        },
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Commentaire ajouté.");
      setComment("");
      router.refresh();
    });
  }

  function handleToggle(next: boolean) {
    startTransition(async () => {
      const result = await apiRequest("/api/v1/tasks/toggle", {
        method: "POST",
        body: { id: task.id, done: next },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    if (
      !window.confirm(
        `Supprimer la tâche « ${task.title} » ? Cette action est irréversible.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await apiRequest(`/api/v1/tasks/${task.id}`, {
        method: "DELETE",
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Tâche supprimée.");
      router.refresh();
    });
  }

  return (
    <div
      data-testid="task-card"
      data-task-id={task.id}
      data-status={task.status}
      className={cn(
        "group/task relative flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-xs transition-shadow",
        "cursor-pointer hover:shadow-sm",
        isDragging && "opacity-60",
        isPending && "pointer-events-none opacity-70"
      )}
    >
      <Button
        type="button"
        variant="ghost"
        className="absolute inset-0 z-0 h-auto w-auto rounded-xl p-0"
        onClick={handleOpenDetails}
        aria-label={`Ouvrir les détails de la tâche ${task.title}`}
      />

      <div className="relative z-10 flex items-start gap-2">
        <IconGripVertical
          aria-hidden
          className="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground/50 group-hover/task:text-muted-foreground"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm leading-snug font-medium",
              done && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </p>
          {task.project ? (
            <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor: task.project.color ?? "var(--primary)",
                }}
              />
              {task.project.name}
            </span>
          ) : null}
        </div>
        <div onPointerDown={stopPointer}>
          <DropdownMenu>
            <DropdownMenuTrigger
              data-testid="task-menu"
              onClick={(event) => event.stopPropagation()}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <IconDotsVertical className="size-4" />
              <span className="sr-only">Actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                data-testid="task-edit"
                onSelect={() => setEditOpen(true)}
              >
                <IconPencil />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                data-testid="task-delete"
                variant="destructive"
                onSelect={handleDelete}
              >
                <IconTrash />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between gap-2 pl-6">
        <div className="flex items-center gap-2">
          <span onPointerDown={stopPointer}>
            <Checkbox
              data-testid="task-done-toggle"
              checked={done}
              onClick={(event) => event.stopPropagation()}
              onCheckedChange={(value) => handleToggle(value === true)}
              aria-label="Marquer comme terminé"
            />
          </span>
          <span className={cn("text-xs font-medium", priority.textClass)}>
            {priority.label}
          </span>
          {task.dueDate ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs text-muted-foreground",
                overdue && "font-medium text-red-600 dark:text-red-400"
              )}
            >
              <IconCalendarEvent className="size-3.5" />
              {formatDueDate(task.dueDate)}
            </span>
          ) : null}
          {overdue ? (
            <Badge
              variant="outline"
              className="border-red-500/40 text-red-600 dark:text-red-400"
            >
              En retard
            </Badge>
          ) : null}
        </div>
        {task.assignee ? (
          <Avatar size="sm">
            <AvatarFallback className="text-[10px] font-medium">
              {initials(task.assignee.name)}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>

      <TaskDialog
        projects={projects}
        members={members}
        task={task}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent
          data-testid="task-details-dialog"
          className="sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>{task.title}</DialogTitle>
            <DialogDescription>
              Consultez les informations de cette tâche puis ouvrez le mode
              édition pour modifier ses champs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <span className={cn("size-2 rounded-full", status.dotClass)} />
                {status.label}
              </Badge>
              <Badge
                variant="outline"
                className={cn("gap-1.5", priority.textClass)}
              >
                <span
                  className={cn("size-2 rounded-full", priority.dotClass)}
                />
                {priority.label}
              </Badge>
              {overdue ? (
                <Badge
                  variant="outline"
                  className="border-red-500/40 text-red-600 dark:text-red-400"
                >
                  En retard
                </Badge>
              ) : null}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconCalendarEvent className="size-4" />
                <span>
                  Échéance:{" "}
                  {task.dueDate ? formatDueDate(task.dueDate) : "Aucune"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconProgress className="size-4" />
                <span>Projet: {task.project?.name ?? "Aucun"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconUser className="size-4" />
                <span>Assigné à: {task.assignee?.name ?? "Personne"}</span>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Description
              </p>
              <p className="text-sm text-foreground/90">
                {task.description?.trim()
                  ? task.description
                  : "Aucune description."}
              </p>
            </div>

            <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Commentaires
              </p>

              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun commentaire pour le moment.
                </p>
              ) : (
                <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                  {comments.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-md border bg-background p-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-foreground/90">
                          {item.author.name ?? item.author.email}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {dateTimeFormatter.format(new Date(item.createdAt))}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-foreground/90">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddComment} className="space-y-2">
                <Textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Ajouter un commentaire..."
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isCommentPending}>
                    {isCommentPending ? "Ajout..." : "Ajouter le commentaire"}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              data-testid="task-details-edit"
              onClick={handleOpenEditFromDetails}
            >
              <IconPencil />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
