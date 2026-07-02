import { revalidatePath } from "next/cache";

export function revalidateTaskViews() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/reports");
}

export function revalidateProjectViews() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/reports");
}

export function revalidateMemberViews() {
  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/projects");
}
