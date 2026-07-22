import type { Metadata } from "next";
import { Figtree, Geist_Mono, Roboto_Slab } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const description =
  "TaskFlow est l'espace de travail collaboratif pour organiser vos tâches, suivre l'avancement de vos projets et piloter votre équipe en un coup d'œil.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "TaskFlow — Gestion de tâches et de projets",
    template: "%s · TaskFlow",
  },
  description,
  applicationName: "TaskFlow",
  keywords: [
    "gestion de tâches",
    "gestion de projets",
    "productivité",
    "collaboration",
    "tableau de bord",
    "TaskFlow",
  ],
  authors: [{ name: "TaskFlow" }],
  creator: "TaskFlow",
  appleWebApp: {
    capable: true,
    title: "TaskFlow",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "TaskFlow",
    title: "TaskFlow — Gestion de tâches et de projets",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskFlow — Gestion de tâches et de projets",
    description,
  },
};

const robotoSlabHeading = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-heading",
});

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        figtree.variable,
        robotoSlabHeading.variable
      )}
    >
      <head>
        <script
          defer
          src="https://analytics.gouale.com/script.js"
          data-website-id="ace17e0a-dd31-4b8e-b2b2-67c9df5e79e1"
          data-domains="taskflow.gouale.com"
        />
        <script
          defer
          src="https://analytics.gouale.com/recorder.js"
          data-website-id="ace17e0a-dd31-4b8e-b2b2-67c9df5e79e1"
        />
      </head>
      <body>
        <NuqsAdapter>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </NuqsAdapter>
        <Toaster />
      </body>
    </html>
  );
}
