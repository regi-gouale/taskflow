import { IconListCheck } from "@tabler/icons-react";
import { ComingSoon } from "@/components/coming-soon";

export default function TasksPage() {
  return (
    <ComingSoon
      title="Mes tâches"
      description="Retrouvez et organisez toutes vos tâches en un seul endroit."
      icon={IconListCheck}
    />
  );
}
