import { z } from "zod";
import {
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from "@/generated/prisma/client";

export const taskStatusSchema = z.enum(TaskStatus);
export const taskPrioritySchema = z.enum(TaskPriority);
export const projectStatusSchema = z.enum(ProjectStatus);

const optionalId = z
  .string()
  .trim()
  .nullish()
  .transform((value) => value || null);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => value || null);

const optionalDate = z.coerce
  .date()
  .nullish()
  .transform((value) => value ?? null);

export const taskCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Le titre est requis.")
    .max(200, "Le titre est trop long."),
  description: optionalText(2000),
  status: taskStatusSchema.default(TaskStatus.TODO),
  priority: taskPrioritySchema.default(TaskPriority.MEDIUM),
  dueDate: optionalDate,
  projectId: optionalId,
  assigneeId: optionalId,
});

export const taskUpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Le titre est requis.").max(200).optional(),
  description: optionalText(2000).optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  dueDate: optionalDate.optional(),
  projectId: optionalId.optional(),
  assigneeId: optionalId.optional(),
});

export const taskToggleSchema = z.object({
  id: z.string().min(1),
  done: z.boolean(),
});

export const taskBoardReorderSchema = z.object({
  columns: z.array(
    z.object({
      status: taskStatusSchema,
      orderedIds: z.array(z.string().min(1)),
    })
  ),
});

export const projectCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom est requis.")
    .max(120, "Le nom est trop long."),
  description: optionalText(2000),
  color: optionalText(32),
  status: projectStatusSchema.default(ProjectStatus.ACTIVE),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const memberCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom est requis.")
    .max(120, "Le nom est trop long."),
  email: z.string().trim().email("E-mail invalide."),
  role: optionalText(120),
  image: optionalText(2_000_000),
});

export const memberUpdateSchema = memberCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom est requis.")
    .max(100, "Le nom est trop long."),
  image: optionalText(2_000_000),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis."),
  newPassword: z
    .string()
    .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères."),
});

export type TaskCreateInput = z.input<typeof taskCreateSchema>;
export type TaskUpdateInput = z.input<typeof taskUpdateSchema>;
export type ProjectCreateInput = z.input<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.input<typeof projectUpdateSchema>;
export type MemberCreateInput = z.input<typeof memberCreateSchema>;
export type MemberUpdateInput = z.input<typeof memberUpdateSchema>;
