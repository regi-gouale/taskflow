"use client";

import { IconCalendar, IconPlus } from "@tabler/icons-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { MemberOption, ProjectOption } from "@/components/tasks/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/client";
import { apiRequest } from "@/lib/api-client";
import type { TaskWithRelations } from "@/lib/queries";
import {
  TASK_PRIORITY_META,
  TASK_PRIORITY_ORDER,
  TASK_STATUS_META,
  TASK_STATUS_ORDER,
} from "@/lib/task-format";
import { cn } from "@/lib/utils";

const NONE = "__none__";

type FormState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string;
  dueDate: Date | undefined;
};

type TaskDialogProps = {
  projects: ProjectOption[];
  members: MemberOption[];
  task?: TaskWithRelations | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultStatus?: TaskStatus;
  defaultDueDate?: string | null;
};

function buildInitialForm(
  task: TaskWithRelations | null | undefined,
  defaultStatus: TaskStatus | undefined,
  defaultDueDate: string | null | undefined
): FormState {
  if (task) {
    return {
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      projectId: task.projectId ?? NONE,
      assigneeId: task.assigneeId ?? NONE,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    };
  }
  return {
    title: "",
    description: "",
    status: defaultStatus ?? "TODO",
    priority: "MEDIUM",
    projectId: NONE,
    assigneeId: NONE,
    dueDate: defaultDueDate ? new Date(defaultDueDate) : undefined,
  };
}

export function TaskDialog({
  projects,
  members,
  task,
  trigger,
  open: controlledOpen,
  onOpenChange,
  defaultStatus,
  defaultDueDate,
}: TaskDialogProps) {
  const router = useRouter();
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [form, setForm] = useState<FormState>(() =>
    buildInitialForm(task, defaultStatus, defaultDueDate)
  );
  const [dirty, setDirty] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(task);

  // Reset form whenever the dialog opens.
  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(task, defaultStatus, defaultDueDate));
      setDirty(false);
    }
  }, [open, task, defaultStatus, defaultDueDate]);

  // Native browser alert when leaving with unsaved changes.
  useEffect(() => {
    if (!open || !dirty) {
      return;
    }
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [open, dirty]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error("Le titre est requis.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate ? form.dueDate.toISOString() : null,
      projectId: form.projectId === NONE ? null : form.projectId,
      assigneeId: form.assigneeId === NONE ? null : form.assigneeId,
    };

    startTransition(async () => {
      const result =
        task != null
          ? await apiRequest(`/api/v1/tasks/${task.id}`, {
              method: "PATCH",
              body: payload,
            })
          : await apiRequest("/api/v1/tasks", {
              method: "POST",
              body: payload,
            });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? "Tâche mise à jour." : "Tâche créée.");
      setDirty(false);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled ? (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button data-testid="new-task-button">
              <IconPlus />
              Nouvelle tâche
            </Button>
          )}
        </DialogTrigger>
      ) : null}
      <DialogContent data-testid="task-dialog" className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Modifier la tâche" : "Nouvelle tâche"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Mettez à jour les détails de la tâche."
                : "Ajoutez une tâche à votre espace de travail."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="task-title">Titre</FieldLabel>
              <Input
                id="task-title"
                data-testid="task-title-input"
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="Ex. Préparer la revue de sprint"
                autoComplete="off"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="task-description">Description</FieldLabel>
              <Textarea
                id="task-description"
                data-testid="task-description-input"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Détails, contexte, critères d'acceptation…"
                rows={3}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="task-status">Statut</FieldLabel>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    update("status", value as TaskStatus)
                  }
                >
                  <SelectTrigger
                    id="task-status"
                    data-testid="task-status-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUS_ORDER.map((status) => (
                      <SelectItem key={status} value={status}>
                        {TASK_STATUS_META[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="task-priority">Priorité</FieldLabel>
                <Select
                  value={form.priority}
                  onValueChange={(value) =>
                    update("priority", value as TaskPriority)
                  }
                >
                  <SelectTrigger
                    id="task-priority"
                    data-testid="task-priority-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITY_ORDER.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {TASK_PRIORITY_META[priority].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="task-project">Projet</FieldLabel>
                <Select
                  value={form.projectId}
                  onValueChange={(value) => update("projectId", value)}
                >
                  <SelectTrigger
                    id="task-project"
                    data-testid="task-project-select"
                  >
                    <SelectValue placeholder="Aucun projet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Aucun projet</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="task-assignee">Assigné à</FieldLabel>
                <Select
                  value={form.assigneeId}
                  onValueChange={(value) => update("assigneeId", value)}
                >
                  <SelectTrigger
                    id="task-assignee"
                    data-testid="task-assignee-select"
                  >
                    <SelectValue placeholder="Personne" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Personne</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="task-due">Échéance</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    id="task-due"
                    data-testid="task-due-trigger"
                    className={cn(
                      "justify-start font-normal",
                      !form.dueDate && "text-muted-foreground"
                    )}
                  >
                    <IconCalendar />
                    {form.dueDate
                      ? format(form.dueDate, "d MMMM yyyy", { locale: fr })
                      : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={fr}
                    selected={form.dueDate}
                    onSelect={(date) => update("dueDate", date)}
                    autoFocus
                  />
                  {form.dueDate ? (
                    <div className="border-t p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => update("dueDate", undefined)}
                      >
                        Effacer la date
                      </Button>
                    </div>
                  ) : null}
                </PopoverContent>
              </Popover>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="submit"
              data-testid="task-submit"
              disabled={isPending}
            >
              {isPending ? <Spinner /> : null}
              {isEdit ? "Enregistrer" : "Créer la tâche"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
