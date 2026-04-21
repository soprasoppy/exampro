import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const [totalUsers, totalExams, totalSessions, completedSessions] = await Promise.all([
    prisma.user.count({ where: { role: "CANDIDATE" } }),
    prisma.exam.count(),
    prisma.examSession.count(),
    prisma.examSession.count({ where: { status: "COMPLETED" } }),
  ]);

  const avgScore = await prisma.examSession.aggregate({
    where: { status: "COMPLETED", score: { not: null } },
    _avg: { score: true },
  });

  const recentSessions = await prisma.examSession.findMany({
    take: 10,
    orderBy: { startedAt: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      exam: { select: { title: true } },
    },
  });

  const examStats = await prisma.exam.findMany({
    include: {
      _count: { select: { questions: true, sessions: true } },
      sessions: {
        where: { status: "COMPLETED" },
        select: { score: true },
      },
    },
  });

  const examSummaries = examStats.map((exam: typeof examStats[number]) => {
    const scores = exam.sessions.map((s: { score: number | null }) => s.score ?? 0);
    const avgExamScore = scores.length > 0
      ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      : 0;
    const passRate = scores.length > 0
      ? (scores.filter((s: number) => s >= exam.passingScore).length / scores.length) * 100
      : 0;

    return {
      id: exam.id,
      title: exam.title,
      questionCount: exam._count.questions,
      sessionCount: exam._count.sessions,
      avgScore: Math.round(avgExamScore * 10) / 10,
      passRate: Math.round(passRate * 10) / 10,
    };
  });

  return Response.json({
    totalUsers,
    totalExams,
    totalSessions,
    completedSessions,
    avgScore: Math.round((avgScore._avg.score ?? 0) * 10) / 10,
    recentSessions,
    examSummaries,
  });
}
