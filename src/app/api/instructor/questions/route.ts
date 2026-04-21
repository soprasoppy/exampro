import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("examId");
  const type = searchParams.get("type");
  const difficulty = searchParams.get("difficulty");
  const tag = searchParams.get("tag");
  const status = searchParams.get("status"); // "active" | "inactive"
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (examId) where.examId = examId;
  if (type) where.type = type;
  if (difficulty) where.difficulty = difficulty;
  if (tag) where.tags = { has: tag };
  if (status === "active") where.active = true;
  if (status === "inactive") where.active = false;
  if (search) where.text = { contains: search, mode: "insensitive" };

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        exam: { select: { title: true, certification: true } },
        _count: { select: { answers: true } },
        answers: {
          where: { isCorrect: { not: null } },
          select: { isCorrect: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.question.count({ where }),
  ]);

  // Calculate success rate for each question
  const questionsWithRate = questions.map((q) => {
    const totalAnswers = q.answers.length;
    const correctAnswers = q.answers.filter((a) => a.isCorrect).length;
    const successRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : null;
    const { answers: _, ...rest } = q;
    return { ...rest, successRate, totalAnswers };
  });

  return Response.json({
    questions: questionsWithRate,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const body = await request.json();

  const question = await prisma.question.create({
    data: {
      examId: body.examId,
      type: body.type,
      text: body.text,
      choices: body.choices || null,
      correctAnswer: body.correctAnswer,
      explanation: body.explanation || null,
      category: body.category || null,
      difficulty: body.difficulty || "medium",
      tags: body.tags || [],
      active: true,
      points: body.points || 1,
      orderIndex: body.orderIndex || 0,
    },
  });

  return Response.json(question, { status: 201 });
}
