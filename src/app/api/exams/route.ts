import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Non autorise" }, { status: 401 });
  }

  const where = session.user.role === "ADMIN"
    ? {}
    : { published: true, status: "READY" as const };

  const exams = await prisma.exam.findMany({
    where,
    include: {
      _count: { select: { questions: true, sessions: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Pour les candidats, ajouter le statut de session
  if (session.user.role === "CANDIDATE") {
    const sessions = await prisma.examSession.findMany({
      where: { userId: session.user.id },
      select: { examId: true, status: true, score: true },
      orderBy: { startedAt: "desc" },
    });

    const examsWithStatus = exams.map((exam: typeof exams[number]) => {
      // Prendre la session en cours s'il y en a une, sinon la derniere completee
      const inProgress = sessions.find((s: { examId: string; status: string }) => s.examId === exam.id && s.status === "IN_PROGRESS");
      const lastCompleted = sessions.find((s: { examId: string; status: string }) => s.examId === exam.id && s.status === "COMPLETED");
      const allCompleted = sessions.filter((s: { examId: string; status: string }) => s.examId === exam.id && s.status === "COMPLETED");
      const bestScore = allCompleted.length > 0 ? Math.max(...allCompleted.map((s: { score: number | null }) => s.score ?? 0)) : null;
      return {
        ...exam,
        userSession: inProgress || lastCompleted || null,
        attempts: allCompleted.length,
        bestScore,
      };
    });

    return Response.json(examsWithStatus);
  }

  return Response.json(exams);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const body = await request.json();
  const exam = await prisma.exam.create({
    data: {
      title: body.title,
      description: body.description,
      certification: body.certification || null,
      category: body.category,
      level: body.level,
      duration: body.duration,
      numberOfQuestions: body.numberOfQuestions,
      randomOrder: body.randomOrder ?? false,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      published: body.published ?? false,
      status: body.status ?? "PENDING",
      passingScore: body.passingScore ?? 50,
      createdById: session.user.id,
    },
  });

  return Response.json(exam, { status: 201 });
}
