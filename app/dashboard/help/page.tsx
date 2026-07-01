import { IconHelpCircle } from "@tabler/icons-react";
import { ComingSoon } from "@/components/coming-soon";

export default function HelpPage() {
  return (
    <ComingSoon
      title="Aide"
      description="Consultez la documentation et contactez le support."
      icon={IconHelpCircle}
    />
  );
}
