"use client";

import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { TaskCard } from "@/components/tasks/task-card";
import type { MemberOption, ProjectOption } from "@/components/tasks/types";
import {
  type Columns,
  groupByStatus,
  useTaskBoard,
} from "@/components/tasks/use-task-board";
import type { TaskStatus } from "@/generated/prisma/client";
import type { TaskWithRelations } from "@/lib/queries";
import { TASK_STATUS_META, TASK_STATUS_ORDER } from "@/lib/task-format";
import { cn } from "@/lib/utils";

type ViewProps = {
  tasks: TaskWithRelations[];
  projects: ProjectOption[];
  members: MemberOption[];
  readOnly?: boolean;
};

type ColumnBodyProps = {
  taskIds: string[];
  tasksById: Map<string, TaskWithRelations>;
  status: TaskStatus;
  projects: ProjectOption[];
  members: MemberOption[];
};

function SortableTaskItem({
  id,
  index,
  status,
  task,
  projects,
  members,
}: {
  id: string;
  index: number;
  status: TaskStatus;
  task: TaskWithRelations;
  projects: ProjectOption[];
  members: MemberOption[];
}) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    group: status,
    type: "task",
    accept: "task",
  });

  return (
    <div ref={ref}>
      <TaskCard
        task={task}
        projects={projects}
        members={members}
        isDragging={isDragging}
      />
    </div>
  );
}

function EmptyHint() {
  return (
    <p className="rounded-lg border border-dashed px-2 py-6 text-center text-xs text-muted-foreground">
      Déposez une tâche ici
    </p>
  );
}

function ColumnHeader({
  status,
  count,
}: {
  status: TaskStatus;
  count: number;
}) {
  const meta = TASK_STATUS_META[status];
  return (
    <header className="flex items-center justify-between px-1">
      <span className="inline-flex items-center gap-2 text-sm font-medium">
        <span className={cn("size-2 rounded-full", meta.dotClass)} />
        {meta.label}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {count}
      </span>
    </header>
  );
}

function DroppableColumnBody({
  taskIds,
  tasksById,
  status,
  projects,
  members,
  className,
}: ColumnBodyProps & { className?: string }) {
  const { ref, isDropTarget } = useDroppable({
    id: status,
    type: "column",
    accept: "task",
  });

  return (
    <div
      ref={ref}
      className={cn(
        "flex min-h-24 flex-col gap-2 rounded-lg",
        isDropTarget && "outline-2 outline-offset-2 outline-primary/40",
        className
      )}
    >
      {taskIds.length === 0 ? (
        <EmptyHint />
      ) : (
        taskIds.map((id, index) => {
          const task = tasksById.get(id);
          if (!task) {
            return null;
          }
          return (
            <SortableTaskItem
              key={id}
              id={id}
              index={index}
              status={status}
              task={task}
              projects={projects}
              members={members}
            />
          );
        })
      )}
    </div>
  );
}

function StaticColumnBody({
  taskIds,
  tasks,
  projects,
  members,
  className,
}: {
  taskIds: string[];
  tasks: TaskWithRelations[];
  projects: ProjectOption[];
  members: MemberOption[];
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-24 flex-col gap-2", className)}>
      {taskIds.length === 0 ? (
        <EmptyHint />
      ) : (
        taskIds.map((id) => {
          const task = tasks.find((item) => item.id === id);
          if (!task) {
            return null;
          }
          return (
            <TaskCard
              key={id}
              task={task}
              projects={projects}
              members={members}
            />
          );
        })
      )}
    </div>
  );
}

export function TaskBoard({ tasks, projects, members, readOnly }: ViewProps) {
  const { columns, tasksById, handleDragOver, handleDragEnd } =
    useTaskBoard(tasks);
  const staticColumns: Columns = groupByStatus(tasks);

  const grid = "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4";

  if (readOnly) {
    return (
      <div className={grid} data-testid="task-board">
        {TASK_STATUS_ORDER.map((status) => (
          <div
            key={status}
            data-testid={`column-${status}`}
            data-status={status}
            className="flex flex-col gap-3 rounded-xl bg-muted/40 p-3"
          >
            <ColumnHeader
              status={status}
              count={staticColumns[status].length}
            />
            <StaticColumnBody
              taskIds={staticColumns[status]}
              tasks={tasks}
              projects={projects}
              members={members}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropProvider onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className={grid} data-testid="task-board">
        {TASK_STATUS_ORDER.map((status) => (
          <div
            key={status}
            data-testid={`column-${status}`}
            data-status={status}
            className="flex flex-col gap-3 rounded-xl bg-muted/40 p-3"
          >
            <ColumnHeader
              status={status}
              count={columns[status]?.length ?? 0}
            />
            <DroppableColumnBody
              status={status}
              taskIds={columns[status] ?? []}
              tasksById={tasksById}
              projects={projects}
              members={members}
            />
          </div>
        ))}
      </div>
    </DragDropProvider>
  );
}

export function TaskList({ tasks, projects, members, readOnly }: ViewProps) {
  const { columns, tasksById, handleDragOver, handleDragEnd } =
    useTaskBoard(tasks);
  const staticColumns: Columns = groupByStatus(tasks);

  if (readOnly) {
    return (
      <div className="flex flex-col gap-6" data-testid="task-list">
        {TASK_STATUS_ORDER.map((status) => (
          <section
            key={status}
            data-testid={`section-${status}`}
            data-status={status}
            className="flex flex-col gap-3"
          >
            <ColumnHeader
              status={status}
              count={staticColumns[status].length}
            />
            <StaticColumnBody
              taskIds={staticColumns[status]}
              tasks={tasks}
              projects={projects}
              members={members}
            />
          </section>
        ))}
      </div>
    );
  }

  return (
    <DragDropProvider onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6" data-testid="task-list">
        {TASK_STATUS_ORDER.map((status) => (
          <section
            key={status}
            data-testid={`section-${status}`}
            data-status={status}
            className="flex flex-col gap-3"
          >
            <ColumnHeader
              status={status}
              count={columns[status]?.length ?? 0}
            />
            <DroppableColumnBody
              status={status}
              taskIds={columns[status] ?? []}
              tasksById={tasksById}
              projects={projects}
              members={members}
            />
          </section>
        ))}
      </div>
    </DragDropProvider>
  );
}
