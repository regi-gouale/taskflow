import { AppearanceForm } from "@/components/settings/appearance-form";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/queries";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Paramètres
        </h1>
        <p className="text-sm text-muted-foreground">
          Gérez votre profil, votre sécurité et vos préférences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="gap-4">
        <TabsList data-testid="settings-tabs">
          <TabsTrigger value="profile" data-testid="tab-profile">
            Profil
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="appearance" data-testid="tab-appearance">
            Apparence
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm
            initialName={user.name ?? ""}
            initialImage={user.image ?? null}
            email={user.email}
          />
        </TabsContent>
        <TabsContent value="security">
          <PasswordForm />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceForm />
        </TabsContent>
      </Tabs>
    </>
  );
}
