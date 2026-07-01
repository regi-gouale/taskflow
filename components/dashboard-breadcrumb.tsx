"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LABELS: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/dashboard/tasks": "Mes tâches",
  "/dashboard/projects": "Projets",
  "/dashboard/calendar": "Calendrier",
  "/dashboard/reports": "Rapports",
  "/dashboard/team": "Équipe",
  "/dashboard/settings": "Paramètres",
  "/dashboard/help": "Aide",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const label = LABELS[pathname] ?? "Tableau de bord";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden text-muted-foreground md:block">
          TaskFlow
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
