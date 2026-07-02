"use client";

import { IconPlus } from "@tabler/icons-react";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo, useState } from "react";
import { TaskDialog } from "@/components/tasks/task-dialog";
import type { MemberOption, ProjectOption } from "@/components/tasks/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TaskWithRelations } from "@/lib/queries";
import {
  initials,
  TASK_PRIORITY_META,
  TASK_STATUS_META,
} from "@/lib/task-format";
import { cn } from "@/lib/utils";

type CalendarViewProps = {
  tasks: TaskWithRelations[];
  projects: ProjectOption[];
  members: MemberOption[];
};

function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function CalendarView({ tasks, projects, members }: CalendarViewProps) {
  const [selected, setSelected] = useState<Date>(() => new Date());
  const [createOpen, setCreateOpen] = useState(false);

  const taskDays = useMemo(() => {
    const set = new Set<string>();
    for (const task of tasks) {
      if (task.dueDate) {
        set.add(dateKey(new Date(task.dueDate)));
      }
    }
    return set;
  }, [tasks]);

  const dayTasks = tasks.filter(
    (task) => task.dueDate && isSameDay(new Date(task.dueDate), selected)
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
      <Card>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => date && setSelected(date)}
            locale={fr}
            showOutsideDays
            modifiers={{ hasTasks: (date) => taskDays.has(dateKey(date)) }}
            modifiersClassNames={{
              hasTasks: "font-semibold text-primary",
            }}
            data-testid="calendar"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="capitalize">
            {format(selected, "EEEE d MMMM yyyy", { locale: fr })}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {dayTasks.length === 0
              ? "Aucune tâche prévue ce jour."
              : `${dayTasks.length} tâche${dayTasks.length > 1 ? "s" : ""} prévue${dayTasks.length > 1 ? "s" : ""}.`}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2" data-testid="day-tasks">
          {dayTasks.map((task) => {
            const priority = TASK_PRIORITY_META[task.priority];
            const status = TASK_STATUS_META[task.status];
            return (
              <div
                key={task.id}
                data-testid="calendar-task"
                data-task-id={task.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    status.dotClass
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {task.project?.name ?? "Sans projet"}
                  </p>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  <span
                    className={cn("text-xs font-medium", priority.textClass)}
                  >
                    {priority.label}
                  </span>
                </Badge>
                {task.assignee ? (
                  <Avatar size="sm">
                    <AvatarFallback className="text-[10px] font-medium">
                      {initials(task.assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
              </div>
            );
          })}

          <Button
            variant="outline"
            className="mt-1 w-full"
            data-testid="calendar-add-task"
            onClick={() => setCreateOpen(true)}
          >
            <IconPlus />
            Ajouter une tâche ce jour
          </Button>
        </CardContent>
      </Card>

      <TaskDialog
        projects={projects}
        members={members}
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultDueDate={selected.toISOString()}
      />
    </div>
  );
}
