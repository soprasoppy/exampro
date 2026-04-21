import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  const examSession = await prisma.examSession.findUnique({
    where: { id },
    include: {
      exam: {
        select: { title: true, duration: true, passingScore: true },
      },
      answers: {
        select: { questionId: true, answer: true },
      },
    },
  });

  if (!examSession) {
    return Response.json({ error: "Session non trouvee" }, { status: 404 });
  }

  // Verifier que c'est bien la session de l'utilisateur (ou admin)
  if (examSession.userId !== session.user.id && session.user.role !== "ADMIN") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  // Charger les questions dans l'ordre fige
  const questionOrder = examSession.questionOrder as string[];
  const questions = await prisma.question.findMany({
    where: { id: { in: questionOrder } },
    select: {
      id: true,
      type: true,
      text: true,
      choices: true,
      points: true,
      // Ne pas envoyer la bonne reponse pendant l'examen
      ...(examSession.status !== "IN_PROGRESS" ? { correctAnswer: true, explanation: true } : {}),
    },
  });

  // Trier dans l'ordre fige
  const orderedQuestions = questionOrder
    .map((qId: string) => questions.find((q: { id: string }) => q.id === qId))
    .filter(Boolean);

  return Response.json({
    ...examSession,
    questions: orderedQuestions,
  });
}
