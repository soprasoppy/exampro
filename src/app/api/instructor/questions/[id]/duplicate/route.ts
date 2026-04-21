import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id } = await params;
  const original = await prisma.question.findUnique({ where: { id } });

  if (!original) {
    return Response.json({ error: "Question introuvable" }, { status: 404 });
  }

  const duplicate = await prisma.question.create({
    data: {
      examId: original.examId,
      type: original.type,
      text: `[Copie] ${original.text}`,
      choices: original.choices as object[] | null,
      correctAnswer: original.correctAnswer,
      explanation: original.explanation,
      category: original.category,
      difficulty: original.difficulty,
      tags: original.tags,
      active: true,
      points: original.points,
      orderIndex: original.orderIndex + 1,
    },
  });

  return Response.json(duplicate, { status: 201 });
}
