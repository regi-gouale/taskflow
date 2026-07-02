"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type ReportsChartsProps = {
  byStatus: { status: string; label: string; count: number }[];
  byPriority: { priority: string; label: string; count: number }[];
  completions: { date: string; label: string; count: number }[];
};

const statusConfig = {
  count: { label: "Tâches", color: "var(--chart-1)" },
} satisfies ChartConfig;

const priorityConfig = {
  count: { label: "Tâches", color: "var(--chart-2)" },
} satisfies ChartConfig;

const completionsConfig = {
  count: { label: "Terminées", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ReportsCharts({
  byStatus,
  byPriority,
  completions,
}: ReportsChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tâches par statut</CardTitle>
          <CardDescription>Répartition actuelle des tâches.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={statusConfig}
            className="h-56 w-full"
            data-testid="chart-status"
          >
            <BarChart accessibilityLayer data={byStatus}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={6} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tâches par priorité</CardTitle>
          <CardDescription>Charge par niveau de priorité.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={priorityConfig}
            className="h-56 w-full"
            data-testid="chart-priority"
          >
            <BarChart accessibilityLayer data={byPriority}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={6} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Tâches terminées</CardTitle>
          <CardDescription>Sur les 14 derniers jours.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={completionsConfig}
            className="h-56 w-full"
            data-testid="chart-completions"
          >
            <AreaChart accessibilityLayer data={completions}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="count"
                type="monotone"
                fill="var(--color-count)"
                fillOpacity={0.2}
                stroke="var(--color-count)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
