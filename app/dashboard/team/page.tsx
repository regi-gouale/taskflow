import { MemberCard } from "@/components/team/member-card";
import { MemberDialog } from "@/components/team/member-dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getMembers, requireUser } from "@/lib/queries";

export default async function TeamPage() {
  const user = await requireUser();
  const members = await getMembers(user.id);

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Équipe
          </h1>
          <p className="text-sm text-muted-foreground">
            Gérez les membres de votre équipe et leurs tâches.
          </p>
        </div>
        <MemberDialog />
      </div>

      {members.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Aucun membre</EmptyTitle>
            <EmptyDescription>
              Ajoutez des membres pour leur assigner des tâches.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </>
  );
}
