import { ReportsCharts } from "@/components/reports/reports-charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { getReportStats, requireUser } from "@/lib/queries";

export default async function ReportsPage() {
  const user = await requireUser();
  const stats = await getReportStats(user.id);

  const cards = [
    { label: "Total des tâches", value: stats.totals.total },
    { label: "Terminées", value: stats.totals.done },
    { label: "En cours", value: stats.totals.inProgress },
    { label: "En retard", value: stats.totals.overdue },
    { label: "Taux d'achèvement", value: `${stats.totals.completionRate}%` },
  ];

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Rapports
        </h1>
        <p className="text-sm text-muted-foreground">
          Analysez la performance de vos projets et de votre équipe.
        </p>
      </div>

      {stats.totals.total === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Pas encore de données</EmptyTitle>
            <EmptyDescription>
              Créez des tâches pour voir apparaître vos statistiques.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {cards.map((card) => (
              <Card key={card.label}>
                <CardHeader>
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="font-heading text-3xl tabular-nums">
                    {card.value}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <ReportsCharts
            byStatus={stats.byStatus}
            byPriority={stats.byPriority}
            completions={stats.completions}
          />

          <Card>
            <CardHeader>
              <CardTitle>Progression par projet</CardTitle>
              <CardDescription>
                Avancement de chaque projet actif.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {stats.projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun projet à afficher.
                </p>
              ) : (
                stats.projects.map((project) => (
                  <div key={project.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{project.name}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {project.doneCount} / {project.taskCount}
                      </span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
