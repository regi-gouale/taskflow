import { IconArrowLeft, IconHome2 } from "@tabler/icons-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,color-mix(in_oklch,var(--primary),transparent_88%)_0%,transparent_45%),radial-gradient(circle_at_85%_80%,color-mix(in_oklch,var(--accent),transparent_90%)_0%,transparent_40%)]"
      />
      <Card className="relative z-10 w-full max-w-lg border border-border/70 bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Erreur 404
          </p>
          <CardTitle className="text-2xl sm:text-3xl">
            Cette page est introuvable
          </CardTitle>
          <CardDescription className="mx-auto max-w-md text-balance">
            Le lien est peut-être expiré ou l&apos;adresse contient une erreur.
            Revenez vers votre espace de travail pour continuer.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <div className="rounded-full border border-border/80 bg-muted/60 p-4 text-primary">
            <IconHome2 className="size-8" aria-hidden />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard">
              <IconHome2 />
              Aller au tableau de bord
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">
              <IconArrowLeft />
              Revenir a l&apos;accueil
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
