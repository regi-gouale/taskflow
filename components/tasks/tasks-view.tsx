"use client";

import { IconLayoutKanban, IconList, IconSearch } from "@tabler/icons-react";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskBoard, TaskList } from "@/components/tasks/task-dnd";
import type { MemberOption, ProjectOption } from "@/components/tasks/types";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskWithRelations } from "@/lib/queries";
import { TASK_PRIORITY_META, TASK_PRIORITY_ORDER } from "@/lib/task-format";
import { cn } from "@/lib/utils";

const ALL = "all";

type TasksViewProps = {
  tasks: TaskWithRelations[];
  projects: ProjectOption[];
  members: MemberOption[];
};

export function TasksView({ tasks, projects, members }: TasksViewProps) {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(["board", "list"] as const).withDefault("board")
  );
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [project, setProject] = useQueryState(
    "project",
    parseAsString.withDefault(ALL)
  );
  const [priority, setPriority] = useQueryState(
    "priority",
    parseAsString.withDefault(ALL)
  );
  const [assignee, setAssignee] = useQueryState(
    "assignee",
    parseAsString.withDefault(ALL)
  );

  const query = search.trim().toLowerCase();
  const filtering =
    query !== "" || project !== ALL || priority !== ALL || assignee !== ALL;

  const filtered = tasks.filter((task) => {
    if (query && !task.title.toLowerCase().includes(query)) {
      return false;
    }
    if (project !== ALL && task.projectId !== project) {
      return false;
    }
    if (priority !== ALL && task.priority !== priority) {
      return false;
    }
    if (assignee !== ALL && task.assigneeId !== assignee) {
      return false;
    }
    return true;
  });

  const visible = filtering ? filtered : tasks;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border p-0.5">
            <Button
              type="button"
              size="sm"
              variant={view === "board" ? "secondary" : "ghost"}
              data-testid="view-board"
              onClick={() => setView("board")}
            >
              <IconLayoutKanban />
              Tableau
            </Button>
            <Button
              type="button"
              size="sm"
              variant={view === "list" ? "secondary" : "ghost"}
              data-testid="view-list"
              onClick={() => setView("list")}
            >
              <IconList />
              Liste
            </Button>
          </div>

          <InputGroup className="w-full sm:w-56">
            <InputGroupAddon>
              <IconSearch />
            </InputGroupAddon>
            <InputGroupInput
              data-testid="task-search"
              placeholder="Rechercher une tâche…"
              value={search}
              onChange={(event) => setSearch(event.target.value || null)}
            />
          </InputGroup>

          <Select
            value={project}
            onValueChange={(value) => setProject(value === ALL ? null : value)}
          >
            <SelectTrigger
              size="sm"
              data-testid="filter-project"
              className="w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les projets</SelectItem>
              {projects.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priority}
            onValueChange={(value) => setPriority(value === ALL ? null : value)}
          >
            <SelectTrigger
              size="sm"
              data-testid="filter-priority"
              className="w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes priorités</SelectItem>
              {TASK_PRIORITY_ORDER.map((value) => (
                <SelectItem key={value} value={value}>
                  {TASK_PRIORITY_META[value].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={assignee}
            onValueChange={(value) => setAssignee(value === ALL ? null : value)}
          >
            <SelectTrigger
              size="sm"
              data-testid="filter-assignee"
              className="w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les membres</SelectItem>
              {members.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TaskDialog projects={projects} members={members} />
      </div>

      {filtering ? (
        <p
          className={cn(
            "rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground"
          )}
          data-testid="filter-note"
        >
          Réorganisation par glisser-déposer en pause pendant le filtrage.
        </p>
      ) : null}

      {visible.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Aucune tâche</EmptyTitle>
            <EmptyDescription>
              {filtering
                ? "Aucune tâche ne correspond à vos filtres."
                : "Créez votre première tâche pour commencer."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : view === "board" ? (
        <TaskBoard
          tasks={visible}
          projects={projects}
          members={members}
          readOnly={filtering}
        />
      ) : (
        <TaskList
          tasks={visible}
          projects={projects}
          members={members}
          readOnly={filtering}
        />
      )}
    </div>
  );
}
