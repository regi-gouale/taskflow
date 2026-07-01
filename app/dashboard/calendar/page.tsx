import { IconCalendarWeek } from "@tabler/icons-react";
import { ComingSoon } from "@/components/coming-soon";

export default function CalendarPage() {
  return (
    <ComingSoon
      title="Calendrier"
      description="Visualisez vos échéances et planifiez votre semaine."
      icon={IconCalendarWeek}
    />
  );
}
