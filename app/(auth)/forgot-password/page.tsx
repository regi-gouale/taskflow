"use client";

import { IconArrowLeft, IconMail, IconSend } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));

    setIsLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message ?? "Une erreur est survenue.");
      return;
    }

    setSubmitted(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          {submitted
            ? "Si un compte existe pour cette adresse, un lien de réinitialisation vient d'être envoyé."
            : "Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation."}
        </CardDescription>
      </CardHeader>
      {!submitted && (
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Adresse e-mail</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <IconMail />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    required
                  />
                </InputGroup>
              </Field>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : <IconSend />}
                Envoyer le lien
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      )}
      <CardContent className="text-center text-sm text-muted-foreground">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
        >
          <IconArrowLeft className="size-4" />
          Retour à la connexion
        </Link>
      </CardContent>
    </Card>
  );
}
