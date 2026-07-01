"use client";

import { IconLock, IconLogin2, IconMail } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    setIsLoading(true);
    const { error } = await signIn.email({
      email,
      password,
      callbackURL: "/",
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message ?? "Impossible de se connecter.");
      return;
    }

    toast.success("Connexion réussie.");
    router.push("/");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Se connecter</CardTitle>
        <CardDescription>
          Saisissez vos identifiants pour accéder à votre compte.
        </CardDescription>
      </CardHeader>
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
                  data-testid="email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  required
                />
              </InputGroup>
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Mot de passe oublié&nbsp;?
                </Link>
              </div>
              <InputGroup>
                <InputGroupAddon>
                  <IconLock />
                </InputGroupAddon>
                <InputGroupInput
                  id="password"
                  data-testid="password-input"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </InputGroup>
            </Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : <IconLogin2 />}
              Se connecter
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardContent className="text-center text-sm text-muted-foreground">
        Pas encore de compte&nbsp;?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Créer un compte
        </Link>
      </CardContent>
    </Card>
  );
}
