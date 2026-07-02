"use client";

import {
  IconDotsVertical,
  IconMail,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteMember } from "@/app/dashboard/team/actions";
import { MemberDialog } from "@/components/team/member-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MemberWithCount } from "@/lib/queries";
import { initials } from "@/lib/task-format";
import { cn } from "@/lib/utils";

export function MemberCard({ member }: { member: MemberWithCount }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !window.confirm(
        `Retirer ${member.name} de l'équipe ? Ses tâches ne seront pas supprimées.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteMember(member.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Membre retiré.");
      router.refresh();
    });
  }

  return (
    <Card
      data-testid="member-card"
      data-member-id={member.id}
      className={cn(isPending && "opacity-70")}
    >
      <CardContent className="flex items-start gap-3">
        <Avatar className="size-11">
          {member.image ? (
            <AvatarImage src={member.image} alt={member.name} />
          ) : null}
          <AvatarFallback className="font-medium">
            {initials(member.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium">{member.name}</p>
              {member.role ? (
                <p className="truncate text-sm text-muted-foreground">
                  {member.role}
                </p>
              ) : null}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                data-testid="member-menu"
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <IconDotsVertical className="size-4" />
                <span className="sr-only">Actions du membre</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  data-testid="member-edit"
                  onSelect={() => setEditOpen(true)}
                >
                  <IconPencil />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-testid="member-delete"
                  variant="destructive"
                  onSelect={handleDelete}
                >
                  <IconTrash />
                  Retirer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <a
            href={`mailto:${member.email}`}
            className="mt-1 inline-flex max-w-full items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <IconMail className="size-3.5 shrink-0" />
            <span className="truncate">{member.email}</span>
          </a>
          <div className="mt-3">
            <Link
              href={`/dashboard/tasks?assignee=${member.id}`}
              className="text-xs font-medium text-primary hover:underline"
            >
              {member._count.tasks} tâche
              {member._count.tasks > 1 ? "s" : ""} assignée
              {member._count.tasks > 1 ? "s" : ""}
            </Link>
          </div>
        </div>
      </CardContent>

      <MemberDialog
        member={{
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
        }}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </Card>
  );
}
