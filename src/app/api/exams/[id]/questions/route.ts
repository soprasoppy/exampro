import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id } = await params;
  const questions = await prisma.question.findMany({
    where: { examId: id },
    orderBy: { orderIndex: "asc" },
  });

  return Response.json(questions);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const lastQuestion = await prisma.question.findFirst({
    where: { examId: id },
    orderBy: { orderIndex: "desc" },
  });

  const question = await prisma.question.create({
    data: {
      examId: id,
      code: body.code,
      type: body.type,
      text: body.text,
      choices: body.choices,
      correctAnswer: body.correctAnswer,
      explanation: body.explanation,
      category: body.category,
      difficulty: body.difficulty || "medium",
      points: body.points || 1,
      orderIndex: (lastQuestion?.orderIndex ?? -1) + 1,
    },
  });

  return Response.json(question, { status: 201 });
}
