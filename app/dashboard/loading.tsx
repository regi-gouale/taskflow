import { Spinner } from "@/components/ui/spinner";

export default function DashboardLoading() {
  return (
    <div
      className="flex flex-1 items-center justify-center py-24"
      data-testid="loading"
    >
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}
