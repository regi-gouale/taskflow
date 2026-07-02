"use client";

import { IconCamera, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { initials } from "@/lib/task-format";

async function fileToDataUrl(file: File, max = 256): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas non supporté par le navigateur.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

type ProfileFormProps = {
  initialName: string;
  initialImage: string | null;
  email: string;
};

export function ProfileForm({
  initialName,
  initialImage,
  email,
}: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState<string | null>(initialImage);
  const [isPending, startTransition] = useTransition();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez choisir une image.");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setImage(dataUrl);
    } catch {
      toast.error("Impossible de traiter cette image.");
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Le nom est requis.");
      return;
    }
    startTransition(async () => {
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: image ?? "",
      });
      if (error) {
        toast.error(error.message ?? "Impossible de mettre à jour le profil.");
        return;
      }
      toast.success("Profil mis à jour.");
      router.refresh();
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Gérez vos informations personnelles et votre photo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {image ? <AvatarImage src={image} alt={name} /> : null}
              <AvatarFallback className="text-lg font-medium">
                {initials(name || email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                data-testid="avatar-input"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="avatar-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <IconCamera />
                Changer la photo
              </Button>
              {image ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-testid="avatar-remove"
                  onClick={() => setImage(null)}
                >
                  <IconTrash />
                  Retirer
                </Button>
              ) : null}
            </div>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="profile-name">Nom</FieldLabel>
              <Input
                id="profile-name"
                data-testid="profile-name-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-email">Adresse e-mail</FieldLabel>
              <Input
                id="profile-email"
                value={email}
                disabled
                readOnly
                autoComplete="email"
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            data-testid="profile-submit"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : null}
            Enregistrer
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
