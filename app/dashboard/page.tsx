import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconChecks,
  IconClock,
  IconListCheck,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
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
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Tâches actives",
    value: "24",
    trend: "+12%",
    hint: "vs. semaine dernière",
    icon: IconListCheck,
    positive: true,
  },
  {
    label: "Terminées (7 j)",
    value: "18",
    trend: "+8",
    hint: "aujourd'hui",
    icon: IconChecks,
    positive: true,
  },
  {
    label: "En retard",
    value: "3",
    trend: "À traiter",
    hint: "en priorité",
    icon: IconAlertTriangle,
    positive: false,
  },
  {
    label: "Productivité",
    value: "87%",
    trend: "+5 pts",
    hint: "ce mois-ci",
    icon: IconTrendingUp,
    positive: true,
  },
] satisfies {
  label: string;
  value: string;
  trend: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  positive: boolean;
}[];

type Status = "À faire" | "En cours" | "En revue" | "Terminé" | "En retard";
type Priority = "Basse" | "Moyenne" | "Haute" | "Urgente";

const statusDot: Record<Status, string> = {
  "À faire": "bg-muted-foreground/40",
  "En cours": "bg-blue-500",
  "En revue": "bg-amber-500",
  Terminé: "bg-emerald-500",
  "En retard": "bg-red-500",
};

const priorityStyle: Record<Priority, string> = {
  Basse: "text-muted-foreground",
  Moyenne: "text-blue-600 dark:text-blue-400",
  Haute: "text-amber-600 dark:text-amber-400",
  Urgente: "text-red-600 dark:text-red-400",
};

const tasks: {
  title: string;
  project: string;
  assignee: string;
  status: Status;
  priority: Priority;
  due: string;
}[] = [
  {
    title: "Finaliser la maquette du tableau de bord",
    project: "Refonte du site",
    assignee: "Léa Martin",
    status: "En cours",
    priority: "Haute",
    due: "Aujourd'hui",
  },
  {
    title: "Intégrer l'authentification par e-mail",
    project: "App mobile v2",
    assignee: "Karim Benali",
    status: "En revue",
    priority: "Urgente",
    due: "Demain",
  },
  {
    title: "Rédiger la documentation de l'API",
    project: "Migration API",
    assignee: "Sofia Rossi",
    status: "À faire",
    priority: "Moyenne",
    due: "Dans 3 jours",
  },
  {
    title: "Corriger le bug de synchronisation",
    project: "App mobile v2",
    assignee: "Tom Dubois",
    status: "En retard",
    priority: "Urgente",
    due: "Hier",
  },
  {
    title: "Préparer les visuels de la campagne",
    project: "Campagne Q3",
    assignee: "Emma Leroy",
    status: "Terminé",
    priority: "Basse",
    due: "Terminé",
  },
];

const projects: {
  name: string;
  progress: number;
  done: number;
  total: number;
}[] = [
  { name: "Refonte du site", progress: 72, done: 18, total: 25 },
  { name: "App mobile v2", progress: 45, done: 9, total: 20 },
  { name: "Campagne Q3", progress: 90, done: 27, total: 30 },
  { name: "Migration API", progress: 30, done: 6, total: 20 },
];

function initials(name: string) {
  const [first = "", second = ""] = name.split(/\s+/);
  return (first[0] ?? "") + (second[0] ?? "");
}

export default function DashboardPage() {
  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-sm text-muted-foreground">
            Voici l'état de vos projets et tâches aujourd'hui.
          </p>
        </div>
        <Button>
          <IconPlus />
          Nouvelle tâche
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="font-heading text-3xl tabular-nums">
                {stat.value}
              </CardTitle>
              <CardAction>
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <stat.icon className="size-5" />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 text-sm">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-medium",
                    stat.positive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  <IconArrowUpRight className="size-3.5" />
                  {stat.trend}
                </span>
                <span className="text-muted-foreground">{stat.hint}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tâches récentes</CardTitle>
            <CardDescription>
              Les dernières tâches assignées à votre équipe.
            </CardDescription>
            <CardAction>
              <Button variant="outline" size="sm">
                Tout voir
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="border-t">
                  <TableHead className="pl-6">Tâche</TableHead>
                  <TableHead className="hidden md:table-cell">Projet</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden pr-6 text-right sm:table-cell">
                    Échéance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.title}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarFallback className="text-[10px] font-medium">
                            {initials(task.assignee)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{task.title}</p>
                          <p className="truncate text-xs text-muted-foreground md:hidden">
                            {task.project}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {task.project}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          priorityStyle[task.priority]
                        )}
                      >
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1.5">
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            statusDot[task.status]
                          )}
                        />
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden pr-6 text-right text-muted-foreground sm:table-cell">
                      {task.due}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projets en cours</CardTitle>
            <CardDescription>Progression par projet.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {projects.map((project) => (
              <div key={project.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {project.progress}%
                  </span>
                </div>
                <Progress value={project.progress} />
                <p className="text-xs text-muted-foreground">
                  {project.done} / {project.total} tâches terminées
                </p>
              </div>
            ))}
            <Button variant="outline" className="mt-1 w-full">
              <IconClock />
              Voir tous les projets
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
