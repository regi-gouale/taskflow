"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error(
        "Le nouveau mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }
    startTransition(async () => {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        toast.error(error.message ?? "Impossible de changer le mot de passe.");
        return;
      }
      toast.success("Mot de passe mis à jour.");
      setCurrentPassword("");
      setNewPassword("");
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>
            Modifiez le mot de passe de votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="current-password">
                Mot de passe actuel
              </FieldLabel>
              <Input
                id="current-password"
                data-testid="current-password-input"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-password">
                Nouveau mot de passe
              </FieldLabel>
              <Input
                id="new-password"
                data-testid="new-password-input"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            data-testid="password-submit"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : null}
            Changer le mot de passe
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
