import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shuffleArray } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Non autorise" }, { status: 401 });
  }

  const { examId, customDuration } = await request.json();

  // Verifier qu'il n'y a pas deja une session en cours pour cet examen
  const existingSession = await prisma.examSession.findFirst({
    where: {
      userId: session.user.id,
      examId,
      status: "IN_PROGRESS",
    },
  });

  if (existingSession) {
    return Response.json(existingSession);
  }

  // Verifier l'examen
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { where: { active: true }, select: { id: true } } },
  });

  if (!exam || !exam.published) {
    return Response.json({ error: "Examen non disponible" }, { status: 404 });
  }

  if (exam.questions.length === 0) {
    return Response.json({ error: "Aucune question dans cet examen" }, { status: 400 });
  }

  // Selectionner et ordonner les questions
  let questionIds = exam.questions.map((q: { id: string }) => q.id);

  if (exam.randomOrder) {
    const seed = `${session.user.id}-${examId}-${Date.now()}`;
    questionIds = shuffleArray(questionIds, seed);
  }

  // Limiter au nombre de questions configure
  const nbQuestions = Math.min(exam.numberOfQuestions, questionIds.length);
  questionIds = questionIds.slice(0, nbQuestions);

  // Duree : custom si fournie, sinon celle de l'examen
  const duration = customDuration && customDuration > 0 ? customDuration : exam.duration;
  const now = new Date();
  const endsAt = new Date(now.getTime() + duration * 60 * 1000);

  const examSession = await prisma.examSession.create({
    data: {
      userId: session.user.id,
      examId,
      questionOrder: questionIds,
      startedAt: now,
      endsAt,
      status: "IN_PROGRESS",
    },
  });

  await prisma.sessionAnswer.createMany({
    data: questionIds.map((questionId: string) => ({
      sessionId: examSession.id,
      questionId,
    })),
  });

  return Response.json(examSession, { status: 201 });
}
