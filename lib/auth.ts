import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    async sendResetPassword({ user, url }) {
      // TODO: brancher un véritable fournisseur d'email (Resend, Postmark, …).
      // En attendant, le lien de réinitialisation est journalisé côté serveur.
      console.log(
        `[auth] Lien de réinitialisation pour ${user.email} : ${url}`
      );
    },
  },
  plugins: [nextCookies()],
});
