import {
  IconAlertTriangle,
  IconArrowRight,
  IconChecks,
  IconClock,
  IconListCheck,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getDashboardData,
  getMembers,
  getProjectsWithProgress,
  requireUser,
} from "@/lib/queries";
import {
  formatDueDate,
  initials,
  isOverdue,
  TASK_PRIORITY_META,
  TASK_STATUS_META,
} from "@/lib/task-format";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const [data, projects, members] = await Promise.all([
    getDashboardData(user.id),
    getProjectsWithProgress(user.id),
    getMembers(user.id),
  ]);

  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
    color: project.color,
  }));
  const memberOptions = members.map((member) => ({
    id: member.id,
    name: member.name,
  }));

  const stats = [
    {
      label: "Tâches actives",
      value: String(data.stats.active),
      hint: "en cours et à faire",
      icon: IconListCheck,
    },
    {
      label: "Terminées (7 j)",
      value: String(data.stats.completedWeek),
      hint: "sur la dernière semaine",
      icon: IconChecks,
    },
    {
      label: "En retard",
      value: String(data.stats.overdue),
      hint: "à traiter en priorité",
      icon: IconAlertTriangle,
    },
    {
      label: "Productivité",
      value: `${data.stats.productivity}%`,
      hint: "tâches terminées",
      icon: IconTrendingUp,
    },
  ] satisfies {
    label: string;
    value: string;
    hint: string;
    icon: ComponentType<{ className?: string }>;
  }[];

  const priorityMessage =
    data.stats.overdue > 0
      ? `${data.stats.overdue} tâche${data.stats.overdue > 1 ? "s" : ""} en retard nécessitent une action.`
      : data.stats.active > 0
        ? `${data.stats.active} tâche${data.stats.active > 1 ? "s" : ""} active${data.stats.active > 1 ? "s" : ""} à suivre aujourd'hui.`
        : "Aucune urgence en cours. Vous pouvez planifier les prochaines priorités.";

  return (
    <>
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-sm text-muted-foreground">
            Voici l&apos;état de vos projets et tâches aujourd&apos;hui.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/tasks">
              <IconListCheck />
              Ouvrir mes tâches
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/projects">Ouvrir les projets</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/reports">
              Voir les rapports
              <IconArrowRight />
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/[0.04]">
        <CardHeader>
          <CardTitle className="text-lg">À traiter maintenant</CardTitle>
          <CardDescription>{priorityMessage}</CardDescription>
          <CardAction>
            <TaskDialog
              projects={projectOptions}
              members={memberOptions}
              trigger={
                <Button size="sm" data-testid="dashboard-priority-new-task">
                  <IconPlus />
                  Nouvelle tâche
                </Button>
              }
            />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1.5">
            <span className="text-muted-foreground">En retard :</span>
            <span className="font-semibold tabular-nums">
              {data.stats.overdue}
            </span>
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <span className="text-muted-foreground">Actives :</span>
            <span className="font-semibold tabular-nums">
              {data.stats.active}
            </span>
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <span className="text-muted-foreground">Terminées (7 j) :</span>
            <span className="font-semibold tabular-nums">
              {data.stats.completedWeek}
            </span>
          </Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
              <CardAction>
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <stat.icon className="size-5" />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tâches récentes</CardTitle>
            <CardDescription>
              Les dernières tâches créées dans votre espace.
            </CardDescription>
            <CardAction>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/tasks">Tout voir</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            {data.recentTasks.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <p className="max-w-[45ch] text-sm text-muted-foreground">
                  Aucune tâche pour le moment. Commencez par créer une première
                  tâche, puis attribuez-la pour lancer le suivi.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <TaskDialog
                    projects={projectOptions}
                    members={memberOptions}
                    trigger={
                      <Button size="sm" data-testid="dashboard-empty-new-task">
                        <IconPlus />
                        Créer une tâche
                      </Button>
                    }
                  />
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/tasks">Ouvrir la vue tâches</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-t">
                    <TableHead className="pl-6">Tâche</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Projet
                    </TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden pr-6 text-right sm:table-cell">
                      Échéance
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentTasks.map((task) => {
                    const overdue = isOverdue(task.dueDate, task.status);
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback className="text-[10px] font-medium">
                                {task.assignee
                                  ? initials(task.assignee.name)
                                  : "—"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {task.title}
                              </p>
                              <p className="truncate text-xs text-muted-foreground md:hidden">
                                {task.project?.name ?? "Sans projet"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {task.project?.name ?? "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              TASK_PRIORITY_META[task.priority].textClass
                            )}
                          >
                            {TASK_PRIORITY_META[task.priority].label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1.5">
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                TASK_STATUS_META[task.status].dotClass
                              )}
                            />
                            {TASK_STATUS_META[task.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "hidden pr-6 text-right text-muted-foreground sm:table-cell",
                            overdue &&
                              "font-medium text-red-600 dark:text-red-400"
                          )}
                        >
                          {overdue ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Badge variant="destructive">En retard</Badge>
                              <span>{formatDueDate(task.dueDate)}</span>
                            </span>
                          ) : (
                            formatDueDate(task.dueDate)
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projets en cours</CardTitle>
            <CardDescription>Progression par projet.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {data.projects.length === 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  Aucun projet pour le moment. Créez des tâches d&apos;abord ou
                  ouvrez la section projets pour structurer votre plan.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/projects">Configurer les projets</Link>
                </Button>
              </div>
            ) : (
              data.projects.map((project) => (
                <div key={project.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {project.progress}%
                    </span>
                  </div>
                  <Progress
                    value={project.progress}
                    aria-label={`Progression du projet ${project.name}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {project.doneCount} / {project.taskCount} tâches terminées
                  </p>
                </div>
              ))
            )}
            <Button variant="outline" className="mt-1 w-full" asChild>
              <Link href="/dashboard/projects">
                <IconClock />
                Voir tous les projets
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
