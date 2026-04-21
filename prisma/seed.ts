import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Creer l'administrateur
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@exampro.com" },
    update: {},
    create: {
      email: "admin@exampro.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "AJC",
      role: "ADMIN",
      active: true,
    },
  });
  console.log("Admin cree:", admin.email);

  // Creer un candidat de test
  const candidatePassword = await hash("test123", 12);
  const candidate = await prisma.user.upsert({
    where: { email: "candidat@test.com" },
    update: {},
    create: {
      email: "candidat@test.com",
      password: candidatePassword,
      firstName: "Jean",
      lastName: "Dupont",
      role: "CANDIDATE",
      active: true,
    },
  });
  console.log("Candidat cree:", candidate.email);

  // Creer un instructeur de test
  const instructorPassword = await hash("instructor123", 12);
  const instructor = await prisma.user.upsert({
    where: { email: "instructeur@exampro.com" },
    update: {},
    create: {
      email: "instructeur@exampro.com",
      password: instructorPassword,
      firstName: "Marie",
      lastName: "Formatrice",
      role: "INSTRUCTOR",
      active: true,
    },
  });
  console.log("Instructeur cree:", instructor.email);

  // Creer un examen de demonstration
  const exam = await prisma.exam.create({
    data: {
      title: "PMP Practice Exam #1",
      description: "Examen pratique de preparation a la certification PMP",
      certification: "PMP",
      category: "Knowledge Areas",
      level: "Intermediaire",
      duration: 15,
      numberOfQuestions: 5,
      randomOrder: true,
      published: true,
      status: "READY",
      passingScore: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdById: admin.id,
    },
  });

  // Ajouter des questions
  const questions = [
    {
      type: "SINGLE_CHOICE" as const,
      text: "Quelle est la capitale du Cameroun ?",
      choices: [
        { label: "A", text: "Douala" },
        { label: "B", text: "Yaounde" },
        { label: "C", text: "Bamenda" },
        { label: "D", text: "Garoua" },
      ],
      correctAnswer: "B",
      explanation: "Yaounde est la capitale politique du Cameroun",
      difficulty: "easy",
    },
    {
      type: "SINGLE_CHOICE" as const,
      text: "Combien de regions compte le Cameroun ?",
      choices: [
        { label: "A", text: "8" },
        { label: "B", text: "10" },
        { label: "C", text: "12" },
        { label: "D", text: "15" },
      ],
      correctAnswer: "B",
      explanation: "Le Cameroun compte 10 regions",
      difficulty: "easy",
    },
    {
      type: "TRUE_FALSE" as const,
      text: "Le HTML est un langage de programmation.",
      choices: [
        { label: "A", text: "Vrai" },
        { label: "B", text: "Faux" },
      ],
      correctAnswer: "B",
      explanation: "HTML est un langage de balisage, pas de programmation",
      difficulty: "medium",
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      text: "Quels sont des systemes de gestion de bases de donnees ?",
      choices: [
        { label: "A", text: "PostgreSQL" },
        { label: "B", text: "React" },
        { label: "C", text: "MySQL" },
        { label: "D", text: "Tailwind" },
      ],
      correctAnswer: "A,C",
      explanation: "PostgreSQL et MySQL sont des SGBD",
      difficulty: "medium",
    },
    {
      type: "SHORT_ANSWER" as const,
      text: "Quel mot-cle JavaScript permet de declarer une constante ?",
      correctAnswer: "const",
      explanation: "Le mot-cle const est utilise pour declarer une constante en JavaScript",
      difficulty: "easy",
    },
  ];

  for (let i = 0; i < questions.length; i++) {
    await prisma.question.create({
      data: {
        examId: exam.id,
        type: questions[i].type,
        text: questions[i].text,
        choices: "choices" in questions[i] ? (questions[i] as { choices: object[] }).choices as object[] : undefined,
        correctAnswer: questions[i].correctAnswer,
        explanation: questions[i].explanation,
        difficulty: questions[i].difficulty,
        orderIndex: i,
        points: 1,
      },
    });
  }

  console.log(`Examen cree: "${exam.title}" avec ${questions.length} questions`);
  console.log("\n--- Identifiants ---");
  console.log("Admin: admin@exampro.com / admin123");
  console.log("Candidat: candidat@test.com / test123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
