import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  // Examens actifs (publies et prets)
  const activeExams = await prisma.exam.findMany({
    where: { published: true, status: "READY" },
    select: {
      id: true,
      title: true,
      certification: true,
      createdAt: true,
      _count: { select: { sessions: true, questions: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Stats globales
  const [totalExams, totalQuestions, totalSessions, completedSessions] = await Promise.all([
    prisma.exam.count(),
    prisma.question.count(),
    prisma.examSession.count(),
    prisma.examSession.count({ where: { status: "COMPLETED" } }),
  ]);

  // Score moyen global
  const avgScore = await prisma.examSession.aggregate({
    where: { status: "COMPLETED", score: { not: null } },
    _avg: { score: true },
  });

  // Activite recente (dernieres tentatives)
  const recentActivity = await prisma.examSession.findMany({
    where: { status: "COMPLETED" },
    select: {
      id: true,
      score: true,
      submittedAt: true,
      user: { select: { firstName: true, lastName: true } },
      exam: { select: { title: true } },
    },
    orderBy: { submittedAt: "desc" },
    take: 8,
  });

  // Questions faibles (taux de reussite < 40%)
  const allQuestions = await prisma.question.findMany({
    where: { active: true },
    select: {
      id: true,
      text: true,
      type: true,
      difficulty: true,
      exam: { select: { title: true, certification: true } },
      answers: {
        where: { isCorrect: { not: null } },
        select: { isCorrect: true },
      },
    },
  });

  const weakQuestions = allQuestions
    .map((q) => {
      const total = q.answers.length;
      const correct = q.answers.filter((a) => a.isCorrect).length;
      const rate = total > 0 ? (correct / total) * 100 : -1;
      return { id: q.id, text: q.text, type: q.type, difficulty: q.difficulty, exam: q.exam, total, correct, rate: Math.round(rate) };
    })
    .filter((q) => q.total >= 3 && q.rate < 40)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 5);

  return Response.json({
    totalExams,
    totalQuestions,
    totalSessions,
    completedSessions,
    avgScore: Math.round((avgScore._avg.score ?? 0) * 10) / 10,
    activeExams,
    recentActivity,
    weakQuestions,
  });
}
