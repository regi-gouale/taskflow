import { IconUsers } from "@tabler/icons-react";
import { ComingSoon } from "@/components/coming-soon";

export default function TeamPage() {
  return (
    <ComingSoon
      title="Équipe"
      description="Gérez les membres de votre équipe et leurs responsabilités."
      icon={IconUsers}
    />
  );
}
