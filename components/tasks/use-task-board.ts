"use client";

import { move } from "@dnd-kit/helpers";
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { reorderBoard } from "@/app/dashboard/tasks/actions";
import type { TaskStatus } from "@/generated/prisma/client";
import type { TaskWithRelations } from "@/lib/queries";
import { TASK_STATUS_ORDER } from "@/lib/task-format";

export type Columns = Record<TaskStatus, string[]>;

export function groupByStatus(tasks: TaskWithRelations[]): Columns {
  const columns = {} as Columns;
  for (const status of TASK_STATUS_ORDER) {
    columns[status] = [];
  }
  const sorted = [...tasks].sort((a, b) => a.position - b.position);
  for (const task of sorted) {
    columns[task.status].push(task.id);
  }
  return columns;
}

export function useTaskBoard(tasks: TaskWithRelations[]) {
  const router = useRouter();
  const [columns, setColumns] = useState<Columns>(() => groupByStatus(tasks));
  const columnsRef = useRef(columns);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const next = groupByStatus(tasks);
    setColumns(next);
    columnsRef.current = next;
  }, [tasks]);

  const tasksById = useMemo(() => {
    const map = new Map<string, TaskWithRelations>();
    for (const task of tasks) {
      map.set(task.id, task);
    }
    return map;
  }, [tasks]);

  function handleDragOver(event: DragOverEvent) {
    setColumns((current) => {
      const next = move(current, event);
      columnsRef.current = next;
      return next;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) {
      const reset = groupByStatus(tasks);
      setColumns(reset);
      columnsRef.current = reset;
      return;
    }

    const snapshot = columnsRef.current;
    const payload = {
      columns: TASK_STATUS_ORDER.map((status) => ({
        status,
        orderedIds: snapshot[status] ?? [],
      })),
    };

    startTransition(async () => {
      const result = await reorderBoard(payload);
      if (!result.ok) {
        toast.error(result.error);
        const reset = groupByStatus(tasks);
        setColumns(reset);
        columnsRef.current = reset;
        return;
      }
      router.refresh();
    });
  }

  return { columns, tasksById, handleDragOver, handleDragEnd, isPending };
}
