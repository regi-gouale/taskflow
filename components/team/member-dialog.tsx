"use client";

import { IconUserPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { apiRequest } from "@/lib/api-client";

type MemberInput = {
  id: string;
  name: string;
  email: string;
  role: string | null;
};

type FormState = {
  name: string;
  email: string;
  role: string;
};

type MemberDialogProps = {
  member?: MemberInput | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function buildInitialForm(member: MemberInput | null | undefined): FormState {
  return {
    name: member?.name ?? "",
    email: member?.email ?? "",
    role: member?.role ?? "",
  };
}

export function MemberDialog({
  member,
  open: controlledOpen,
  onOpenChange,
}: MemberDialogProps) {
  const router = useRouter();
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [form, setForm] = useState<FormState>(() => buildInitialForm(member));
  const [dirty, setDirty] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(member);

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(member));
      setDirty(false);
    }
  }, [open, member]);

  useEffect(() => {
    if (!open || !dirty) {
      return;
    }
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [open, dirty]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Le nom est requis.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim() || null,
    };

    startTransition(async () => {
      const result = member
        ? await apiRequest(`/api/v1/members/${member.id}`, {
            method: "PATCH",
            body: payload,
          })
        : await apiRequest("/api/v1/members", {
            method: "POST",
            body: payload,
          });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? "Membre mis à jour." : "Membre ajouté.");
      setDirty(false);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled ? (
        <DialogTrigger asChild>
          <Button data-testid="new-member-button">
            <IconUserPlus />
            Ajouter un membre
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent data-testid="member-dialog" className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Modifier le membre" : "Ajouter un membre"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Mettez à jour les informations du membre."
                : "Ajoutez un membre à votre équipe."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="member-name">Nom</FieldLabel>
              <Input
                id="member-name"
                data-testid="member-name-input"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Ex. Léa Martin"
                autoComplete="off"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="member-email">E-mail</FieldLabel>
              <Input
                id="member-email"
                data-testid="member-email-input"
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                placeholder="lea@exemple.com"
                autoComplete="off"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="member-role">Rôle</FieldLabel>
              <Input
                id="member-role"
                data-testid="member-role-input"
                value={form.role}
                onChange={(event) => update("role", event.target.value)}
                placeholder="Ex. Designer produit"
                autoComplete="off"
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="submit"
              data-testid="member-submit"
              disabled={isPending}
            >
              {isPending ? <Spinner /> : null}
              {isEdit ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
