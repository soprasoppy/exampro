import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;
  const { questionId, answer } = await request.json();

  // Verifier la session
  const examSession = await prisma.examSession.findUnique({
    where: { id },
  });

  if (!examSession || examSession.userId !== session.user.id) {
    return Response.json({ error: "Session non trouvee" }, { status: 404 });
  }

  if (examSession.status !== "IN_PROGRESS") {
    return Response.json({ error: "L'examen est deja termine" }, { status: 400 });
  }

  // Verifier que le temps n'est pas ecoule
  if (new Date() > examSession.endsAt) {
    // Auto-soumettre
    await submitSession(examSession.id);
    return Response.json({ error: "Le temps est ecoule, examen soumis automatiquement" }, { status: 400 });
  }

  // Sauvegarder la reponse
  const savedAnswer = await prisma.sessionAnswer.upsert({
    where: {
      sessionId_questionId: { sessionId: id, questionId },
    },
    update: { answer, savedAt: new Date() },
    create: { sessionId: id, questionId, answer },
  });

  return Response.json(savedAnswer);
}

async function submitSession(sessionId: string) {
  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: {
      answers: true,
      exam: { include: { questions: true } },
    },
  });

  if (!examSession) return;

  let correctCount = 0;
  let totalPoints = 0;
  let earnedPoints = 0;

  const questionOrder = examSession.questionOrder as string[];

  for (const qId of questionOrder) {
    const question = examSession.exam.questions.find((q: { id: string }) => q.id === qId);
    if (!question) continue;

    totalPoints += question.points;
    const sessionAnswer = examSession.answers.find((a: { questionId: string }) => a.questionId === qId);

    if (sessionAnswer?.answer) {
      const isCorrect = checkAnswer(sessionAnswer.answer, question.correctAnswer, question.type);
      if (isCorrect) {
        correctCount++;
        earnedPoints += question.points;
      }

      await prisma.sessionAnswer.update({
        where: { id: sessionAnswer.id },
        data: { isCorrect },
      });
    }
  }

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  await prisma.examSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      submittedAt: new Date(),
      score,
      totalPoints,
      correctCount,
      totalQuestions: questionOrder.length,
    },
  });
}

function checkAnswer(given: string, correct: string, type: string): boolean {
  const g = given.trim().toUpperCase();
  const c = correct.trim().toUpperCase();

  if (type === "MULTIPLE_CHOICE") {
    const givenSet = new Set(g.split(",").map((s) => s.trim()));
    const correctSet = new Set(c.split(",").map((s) => s.trim()));
    if (givenSet.size !== correctSet.size) return false;
    for (const item of givenSet) {
      if (!correctSet.has(item)) return false;
    }
    return true;
  }

  return g === c;
}
