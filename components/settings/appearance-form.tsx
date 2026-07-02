"use client";

import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Clair", icon: IconSun },
  { value: "dark", label: "Sombre", icon: IconMoon },
  { value: "system", label: "Système", icon: IconDeviceDesktop },
] as const;

export function AppearanceForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current = mounted ? (theme ?? "system") : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apparence</CardTitle>
        <CardDescription>Choisissez le thème de l'interface.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3" data-testid="theme-options">
          {OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              data-testid={`theme-${option.value}`}
              aria-pressed={current === option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "h-auto flex-col gap-2 py-4",
                current === option.value && "border-primary ring-1 ring-primary"
              )}
            >
              <option.icon className="size-5" />
              {option.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
