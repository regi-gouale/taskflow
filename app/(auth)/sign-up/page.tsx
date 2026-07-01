"use client";

import {
  IconLock,
  IconMail,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name"));
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    const { error } = await signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message ?? "Impossible de créer le compte.");
      return;
    }

    toast.success("Compte créé avec succès.");
    router.push("/");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Renseignez vos informations pour commencer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nom</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <IconUser />
                </InputGroupAddon>
                <InputGroupInput
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jeanne Dupont"
                  required
                />
              </InputGroup>
            </Field>
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
                  data-testid="email-input"
                  placeholder="vous@exemple.com"
                  required
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <IconLock />
                </InputGroupAddon>
                <InputGroupInput
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </InputGroup>
              <FieldDescription>Au moins 8 caractères.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirmer le mot de passe
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <IconLock />
                </InputGroupAddon>
                <InputGroupInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  data-testid="confirm-password-input"
                  required
                />
              </InputGroup>
            </Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : <IconUserPlus />}
              Créer le compte
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardContent className="text-center text-sm text-muted-foreground">
        Vous avez déjà un compte&nbsp;?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </CardContent>
    </Card>
  );
}
