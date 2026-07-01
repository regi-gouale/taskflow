import "dotenv/config";
import { UseSend } from "usesend-js";

let client: UseSend | null = null;

/**
 * Instancie le client useSend à la demande afin d'éviter de lever une erreur
 * au chargement du module (ex. pendant le build) si la clé n'est pas encore
 * disponible. Le SDK lit `USESEND_API_KEY` automatiquement, mais on la passe
 * explicitement pour produire un message d'erreur plus clair.
 */
function getUseSend(): UseSend {
  if (!client) {
    const apiKey = process.env.USESEND_API_KEY;

    if (!apiKey) {
      throw new Error(
        "USESEND_API_KEY est absent des variables d'environnement."
      );
    }

    client = new UseSend(apiKey);
  }

  return client;
}

const DEFAULT_FROM = "TaskFlow <noreply@gouale.com>";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Envoie un e-mail transactionnel via useSend. L'adresse d'expédition provient
 * de `EMAIL_FROM` (le domaine doit être vérifié dans le tableau de bord useSend).
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const { data, error } = await getUseSend().emails.send({
    from: process.env.EMAIL_FROM ?? DEFAULT_FROM,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message ?? "L'envoi de l'e-mail a échoué.");
  }

  return data;
}

/**
 * Enveloppe le contenu dans une mise en page e-mail sobre aux couleurs de
 * TaskFlow. Les styles sont en ligne car de nombreux clients e-mail ignorent
 * les feuilles de style externes.
 */
function renderLayout({
  heading,
  body,
}: {
  heading: string;
  body: string;
}): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;background-color:#f4f5f7;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2430;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background-color:#ffffff;border-radius:12px;border:1px solid #e6e8ec;overflow:hidden;">
      <tr>
        <td style="padding:32px 32px 8px;">
          <span style="font-size:20px;font-weight:600;letter-spacing:-0.02em;">Task<span style="color:#2E6CF0;">Flow</span></span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 32px 0;">
          <h1 style="margin:0;font-size:20px;line-height:1.3;font-weight:600;">${heading}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px 32px;font-size:15px;line-height:1.6;color:#3c4652;">${body}</td>
      </tr>
    </table>
    <p style="max-width:480px;margin:16px auto 0;text-align:center;font-size:12px;color:#8a909c;">
      TaskFlow · Cet e-mail vous a été envoyé automatiquement, merci de ne pas y répondre.
    </p>
  </body>
</html>`;
}

/**
 * Envoie l'e-mail de réinitialisation de mot de passe contenant le lien sécurisé.
 */
export async function sendPasswordResetEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  const heading = "Réinitialisation de votre mot de passe";
  const html = renderLayout({
    heading,
    body: `
      <p style="margin:0 0 20px;">
        Vous avez demandé à réinitialiser le mot de passe de votre compte TaskFlow.
        Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${url}" style="display:inline-block;background-color:#2E6CF0;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:8px;">
          Réinitialiser le mot de passe
        </a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
        Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur&nbsp;:
      </p>
      <p style="margin:0 0 20px;font-size:13px;word-break:break-all;">
        <a href="${url}" style="color:#2E6CF0;">${url}</a>
      </p>
      <p style="margin:0;font-size:13px;color:#6b7280;">
        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.
      </p>
    `,
  });

  const text = `Réinitialisation de votre mot de passe TaskFlow

Vous avez demandé à réinitialiser le mot de passe de votre compte TaskFlow.
Ouvrez le lien suivant pour en choisir un nouveau :

${url}

Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.`;

  return sendEmail({
    to,
    subject: heading,
    html,
    text,
  });
}
