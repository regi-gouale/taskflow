import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-1 text-center mx-auto">
          <Image
            src="/icon-taskflow.svg"
            alt="TaskFlow"
            width={64}
            height={64}
          />
          <div className="flex">
            <span className="font-heading text-xl font-medium tracking-tight">
              Task
            </span>
            <span className="font-heading text-xl font-medium tracking-tight text-primary">
              Flow
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
