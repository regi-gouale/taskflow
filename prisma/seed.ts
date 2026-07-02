import "dotenv/config";
import {
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TEST_EMAIL = "test@taskflow.dev";
const TEST_PASSWORD = "Password123!";
const TEST_NAME = "Alex Martin";

const DAY_MS = 24 * 60 * 60 * 1000;
const now = new Date();
const offset = (days: number) => new Date(now.getTime() + days * DAY_MS);

async function ensureTestUser() {
  const existing = await prisma.user.findUnique({
    where: { email: TEST_EMAIL },
  });
  if (existing) {
    return existing;
  }

  try {
    // The nextCookies plugin may throw outside a request context, but the
    // user + account rows are already persisted before cookies are set.
    await auth.api.signUpEmail({
      body: { email: TEST_EMAIL, password: TEST_PASSWORD, name: TEST_NAME },
    });
  } catch {
    // Ignore cookie side-effects; verified below.
  }

  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (!user) {
    throw new Error("Impossible de créer l'utilisateur de test.");
  }
  return user;
}

async function main() {
  const user = await ensureTestUser();
  const userId = user.id;

  // Reset deterministic data for this user only.
  await prisma.task.deleteMany({ where: { userId } });
  await prisma.project.deleteMany({ where: { userId } });
  await prisma.member.deleteMany({ where: { userId } });

  const members = [
    {
      id: "seed-member-lea",
      name: "Léa Martin",
      email: "lea@taskflow.dev",
      role: "Designer produit",
    },
    {
      id: "seed-member-karim",
      name: "Karim Benali",
      email: "karim@taskflow.dev",
      role: "Développeur mobile",
    },
    {
      id: "seed-member-sofia",
      name: "Sofia Rossi",
      email: "sofia@taskflow.dev",
      role: "Rédactrice technique",
    },
    {
      id: "seed-member-tom",
      name: "Tom Dubois",
      email: "tom@taskflow.dev",
      role: "Ingénieur back-end",
    },
    {
      id: "seed-member-emma",
      name: "Emma Leroy",
      email: "emma@taskflow.dev",
      role: "Cheffe de projet",
    },
  ];
  await prisma.member.createMany({
    data: members.map((member) => ({ ...member, userId })),
  });

  const projects = [
    {
      id: "seed-project-refonte",
      name: "Refonte du site",
      description:
        "Nouvelle identité visuelle et refonte complète du site vitrine.",
      color: "#2E6CF0",
      status: ProjectStatus.ACTIVE,
    },
    {
      id: "seed-project-mobile",
      name: "App mobile v2",
      description: "Deuxième version de l'application mobile iOS et Android.",
      color: "#13B89A",
      status: ProjectStatus.ACTIVE,
    },
    {
      id: "seed-project-campagne",
      name: "Campagne Q3",
      description: "Campagne marketing du troisième trimestre.",
      color: "#F0A500",
      status: ProjectStatus.ACTIVE,
    },
    {
      id: "seed-project-api",
      name: "Migration API",
      description: "Migration de l'API legacy vers la nouvelle architecture.",
      color: "#8B5CF6",
      status: ProjectStatus.ON_HOLD,
    },
  ];
  await prisma.project.createMany({
    data: projects.map((project) => ({ ...project, userId })),
  });

  const tasks = [
    // À faire
    {
      id: "seed-task-1",
      title: "Finaliser la maquette du tableau de bord",
      description: "Terminer les écrans du tableau de bord dans Figma.",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: offset(3),
      completedAt: null,
      projectId: "seed-project-refonte",
      assigneeId: "seed-member-lea",
      position: 0,
    },
    {
      id: "seed-task-2",
      title: "Rédiger la documentation de l'API",
      description: "Documenter les nouveaux points d'entrée REST.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: offset(5),
      completedAt: null,
      projectId: "seed-project-api",
      assigneeId: "seed-member-sofia",
      position: 1,
    },
    {
      id: "seed-task-3",
      title: "Préparer le brief créatif",
      description: "Cadrer le message et les visuels de la campagne.",
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: offset(7),
      completedAt: null,
      projectId: "seed-project-campagne",
      assigneeId: "seed-member-emma",
      position: 2,
    },
    {
      id: "seed-task-12",
      title: "Corriger le bug de synchronisation",
      description: "Les données ne se synchronisent pas en arrière-plan.",
      status: TaskStatus.TODO,
      priority: TaskPriority.URGENT,
      dueDate: offset(-1),
      completedAt: null,
      projectId: "seed-project-mobile",
      assigneeId: "seed-member-tom",
      position: 3,
    },
    {
      id: "seed-task-14",
      title: "Planifier la rétrospective d'équipe",
      description: null,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: offset(6),
      completedAt: null,
      projectId: null,
      assigneeId: null,
      position: 4,
    },
    // En cours
    {
      id: "seed-task-4",
      title: "Intégrer l'authentification par e-mail",
      description: "Connexion et inscription par e-mail et mot de passe.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      dueDate: offset(1),
      completedAt: null,
      projectId: "seed-project-mobile",
      assigneeId: "seed-member-karim",
      position: 0,
    },
    {
      id: "seed-task-5",
      title: "Optimiser les requêtes de la base",
      description: "Réduire le temps de réponse des requêtes lentes.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: offset(2),
      completedAt: null,
      projectId: "seed-project-api",
      assigneeId: "seed-member-tom",
      position: 1,
    },
    {
      id: "seed-task-13",
      title: "Répondre aux retours clients",
      description: "Traiter les tickets support prioritaires.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: offset(-2),
      completedAt: null,
      projectId: null,
      assigneeId: "seed-member-emma",
      position: 2,
    },
    // En revue
    {
      id: "seed-task-6",
      title: "Revue du parcours d'inscription",
      description: "Relire le nouveau tunnel d'inscription.",
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      dueDate: offset(2),
      completedAt: null,
      projectId: "seed-project-mobile",
      assigneeId: "seed-member-karim",
      position: 0,
    },
    {
      id: "seed-task-7",
      title: "Valider les visuels de la campagne",
      description: "Approuver les déclinaisons graphiques.",
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      dueDate: offset(4),
      completedAt: null,
      projectId: "seed-project-campagne",
      assigneeId: "seed-member-emma",
      position: 1,
    },
    // Terminé
    {
      id: "seed-task-8",
      title: "Configurer le pipeline CI",
      description: "Mettre en place l'intégration continue.",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: null,
      completedAt: offset(-2),
      projectId: "seed-project-api",
      assigneeId: "seed-member-tom",
      position: 0,
    },
    {
      id: "seed-task-9",
      title: "Créer la charte graphique",
      description: "Définir couleurs, typographies et composants.",
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: null,
      completedAt: offset(-5),
      projectId: "seed-project-refonte",
      assigneeId: "seed-member-lea",
      position: 1,
    },
    {
      id: "seed-task-10",
      title: "Mettre en place l'analytics",
      description: "Suivi des événements clés dans l'app.",
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      dueDate: null,
      completedAt: offset(-1),
      projectId: "seed-project-mobile",
      assigneeId: "seed-member-karim",
      position: 2,
    },
    {
      id: "seed-task-11",
      title: "Rédiger les mentions légales",
      description: null,
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      dueDate: null,
      completedAt: offset(-8),
      projectId: "seed-project-refonte",
      assigneeId: "seed-member-sofia",
      position: 3,
    },
  ];
  await prisma.task.createMany({
    data: tasks.map((task) => ({ ...task, userId })),
  });

  console.log(
    `Seed terminé pour ${TEST_EMAIL} — ${members.length} membres, ${projects.length} projets, ${tasks.length} tâches.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
