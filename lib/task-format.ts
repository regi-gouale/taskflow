import type { TaskPriority, TaskStatus } from "@/generated/prisma/client";

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];

export const TASK_STATUS_META: Record<
  TaskStatus,
  { label: string; dotClass: string }
> = {
  TODO: { label: "À faire", dotClass: "bg-muted-foreground/40" },
  IN_PROGRESS: { label: "En cours", dotClass: "bg-blue-500" },
  IN_REVIEW: { label: "En revue", dotClass: "bg-amber-500" },
  DONE: { label: "Terminé", dotClass: "bg-emerald-500" },
};

export const TASK_PRIORITY_ORDER: TaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export const TASK_PRIORITY_META: Record<
  TaskPriority,
  { label: string; textClass: string; dotClass: string }
> = {
  LOW: {
    label: "Basse",
    textClass: "text-muted-foreground",
    dotClass: "bg-muted-foreground/40",
  },
  MEDIUM: {
    label: "Moyenne",
    textClass: "text-blue-600 dark:text-blue-400",
    dotClass: "bg-blue-500",
  },
  HIGH: {
    label: "Haute",
    textClass: "text-amber-600 dark:text-amber-400",
    dotClass: "bg-amber-500",
  },
  URGENT: {
    label: "Urgente",
    textClass: "text-red-600 dark:text-red-400",
    dotClass: "bg-red-500",
  },
};

export const PROJECT_STATUS_META: Record<
  string,
  { label: string; dotClass: string }
> = {
  ACTIVE: { label: "Actif", dotClass: "bg-emerald-500" },
  ON_HOLD: { label: "En pause", dotClass: "bg-amber-500" },
  COMPLETED: { label: "Terminé", dotClass: "bg-blue-500" },
  ARCHIVED: { label: "Archivé", dotClass: "bg-muted-foreground/40" },
};

export function initials(name: string) {
  const [first = "", second = ""] = name.trim().split(/\s+/);
  return ((first[0] ?? "") + (second[0] ?? "")).toUpperCase();
}

export function isOverdue(
  dueDate: Date | string | null,
  status: TaskStatus
): boolean {
  if (!dueDate || status === "DONE") {
    return false;
  }
  return new Date(dueDate).getTime() < Date.now();
}

export function formatDueDate(dueDate: Date | string | null): string {
  if (!dueDate) {
    return "—";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(dueDate));
}
