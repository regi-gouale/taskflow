"use client";

import { IconRefresh, IconAlertTriangle, IconHome2 } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,color-mix(in_oklch,var(--destructive),transparent_87%)_0%,transparent_42%),radial-gradient(circle_at_80%_82%,color-mix(in_oklch,var(--primary),transparent_90%)_0%,transparent_40%)]"
      />
      <Card className="relative z-10 w-full max-w-lg border border-border/70 bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Erreur applicative
          </p>
          <CardTitle className="text-2xl sm:text-3xl">
            Une erreur est survenue
          </CardTitle>
          <CardDescription className="mx-auto max-w-md text-balance">
            Nous n&apos;avons pas pu charger cette page correctement. Vous
            pouvez reessayer immediatement ou revenir au tableau de bord.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="rounded-full border border-border/80 bg-destructive/10 p-4 text-destructive">
              <IconAlertTriangle className="size-8" aria-hidden />
            </div>
          </div>
          {error.digest ? (
            <p className="text-center text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="w-full sm:w-auto">
            <IconRefresh />
            Reessayer
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/dashboard">
              <IconHome2 />
              Aller au tableau de bord
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
