export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="font-heading text-xl font-medium tracking-tight">
            TaskFlow
          </span>
          <span className="text-sm text-muted-foreground">
            Organisez votre travail, simplement.
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
