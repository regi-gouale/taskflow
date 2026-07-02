"use client";

import { IconFolderPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectStatus } from "@/generated/prisma/client";
import { apiRequest } from "@/lib/api-client";
import { PROJECT_STATUS_META } from "@/lib/task-format";
import { cn } from "@/lib/utils";

const PROJECT_COLORS = [
  "#2E6CF0",
  "#13B89A",
  "#F0A500",
  "#8B5CF6",
  "#F43F5E",
  "#64748B",
];

const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "ARCHIVED",
];

type ProjectInput = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  status: ProjectStatus;
};

type FormState = {
  name: string;
  description: string;
  color: string;
  status: ProjectStatus;
};

type ProjectDialogProps = {
  project?: ProjectInput | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function buildInitialForm(project: ProjectInput | null | undefined): FormState {
  return {
    name: project?.name ?? "",
    description: project?.description ?? "",
    color: project?.color ?? PROJECT_COLORS[0],
    status: project?.status ?? "ACTIVE",
  };
}

export function ProjectDialog({
  project,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: ProjectDialogProps) {
  const router = useRouter();
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [form, setForm] = useState<FormState>(() => buildInitialForm(project));
  const [dirty, setDirty] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(project);

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(project));
      setDirty(false);
    }
  }, [open, project]);

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
    if (!form.name.trim()) {
      toast.error("Le nom est requis.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      color: form.color,
      status: form.status,
    };

    startTransition(async () => {
      const result = project
        ? await apiRequest(`/api/v1/projects/${project.id}`, {
            method: "PATCH",
            body: payload,
          })
        : await apiRequest("/api/v1/projects", {
            method: "POST",
            body: payload,
          });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? "Projet mis à jour." : "Projet créé.");
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
            <Button data-testid="new-project-button">
              <IconFolderPlus />
              Nouveau projet
            </Button>
          )}
        </DialogTrigger>
      ) : null}
      <DialogContent data-testid="project-dialog" className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Modifier le projet" : "Nouveau projet"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Mettez à jour les informations du projet."
                : "Créez un projet pour regrouper vos tâches."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="project-name">Nom</FieldLabel>
              <Input
                id="project-name"
                data-testid="project-name-input"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Ex. Refonte du site"
                autoComplete="off"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="project-description">Description</FieldLabel>
              <Textarea
                id="project-description"
                data-testid="project-description-input"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Objectif du projet…"
                rows={3}
              />
            </Field>

            <Field>
              <FieldLabel>Couleur</FieldLabel>
              <div
                className="flex flex-wrap gap-2"
                data-testid="project-colors"
              >
                {PROJECT_COLORS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Couleur ${value}`}
                    onClick={() => update("color", value)}
                    className={cn(
                      "size-7 rounded-full border-2 transition-transform",
                      form.color === value
                        ? "scale-110 border-foreground"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: value }}
                  />
                ))}
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="project-status">Statut</FieldLabel>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  update("status", value as ProjectStatus)
                }
              >
                <SelectTrigger
                  id="project-status"
                  data-testid="project-status-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUS_ORDER.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PROJECT_STATUS_META[value].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="submit"
              data-testid="project-submit"
              disabled={isPending}
            >
              {isPending ? <Spinner /> : null}
              {isEdit ? "Enregistrer" : "Créer le projet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
