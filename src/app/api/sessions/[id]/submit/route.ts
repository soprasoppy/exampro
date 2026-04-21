import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
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
      answers: true,
      exam: { include: { questions: true } },
    },
  });

  if (!examSession || examSession.userId !== session.user.id) {
    return Response.json({ error: "Session non trouvee" }, { status: 404 });
  }

  if (examSession.status !== "IN_PROGRESS") {
    return Response.json({ error: "L'examen est deja termine" }, { status: 400 });
  }

  // Corriger les reponses
  let correctCount = 0;
  let totalPoints = 0;
  let earnedPoints = 0;

  const questionOrder = examSession.questionOrder as string[];

  for (const qId of questionOrder) {
    const question = examSession.exam.questions.find((q: { id: string }) => q.id === qId);
    if (!question) continue;

    totalPoints += question.points;
    const answer = examSession.answers.find((a: { questionId: string }) => a.questionId === qId);

    if (answer?.answer) {
      const isCorrect = checkAnswer(answer.answer, question.correctAnswer, question.type);
      if (isCorrect) {
        correctCount++;
        earnedPoints += question.points;
      }

      await prisma.sessionAnswer.update({
        where: { id: answer.id },
        data: { isCorrect },
      });
    }
  }

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  const result = await prisma.examSession.update({
    where: { id },
    data: {
      status: "COMPLETED",
      submittedAt: new Date(),
      score,
      totalPoints,
      correctCount,
      totalQuestions: questionOrder.length,
    },
  });

  return Response.json(result);
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
