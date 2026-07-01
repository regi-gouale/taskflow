import type { ComponentType } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function ComingSoon({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Empty className="flex-1 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Bientôt disponible</EmptyTitle>
          <EmptyDescription>
            Cette section est en cours de construction. Revenez prochainement.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </>
  );
}
