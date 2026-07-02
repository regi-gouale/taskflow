"use client";

import {
  IconCalendarEvent,
  IconDotsVertical,
  IconGripVertical,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteTask, toggleTaskDone } from "@/app/dashboard/tasks/actions";
import { TaskDialog } from "@/components/tasks/task-dialog";
import type { MemberOption, ProjectOption } from "@/components/tasks/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskWithRelations } from "@/lib/queries";
import {
  formatDueDate,
  initials,
  isOverdue,
  TASK_PRIORITY_META,
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
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const done = task.status === "DONE";
  const overdue = isOverdue(task.dueDate, task.status);
  const priority = TASK_PRIORITY_META[task.priority];

  function handleToggle(next: boolean) {
    startTransition(async () => {
      const result = await toggleTaskDone({ id: task.id, done: next });
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
      const result = await deleteTask(task.id);
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
        "group/task flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-xs transition-shadow",
        "hover:shadow-sm",
        isDragging && "opacity-60",
        isPending && "pointer-events-none opacity-70"
      )}
    >
      <div className="flex items-start gap-2">
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

      <div className="flex items-center justify-between gap-2 pl-6">
        <div className="flex items-center gap-2">
          <span onPointerDown={stopPointer}>
            <Checkbox
              data-testid="task-done-toggle"
              checked={done}
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
    </div>
  );
}
