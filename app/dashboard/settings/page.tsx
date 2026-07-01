import { IconSettings } from "@tabler/icons-react";
import { ComingSoon } from "@/components/coming-soon";

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Paramètres"
      description="Personnalisez votre espace de travail et vos préférences."
      icon={IconSettings}
    />
  );
}
