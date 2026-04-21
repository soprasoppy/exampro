import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  // Toggle status
  if (body._action === "toggle-status") {
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) return Response.json({ error: "Question introuvable" }, { status: 404 });

    const updated = await prisma.question.update({
      where: { id },
      data: { active: !question.active },
    });
    return Response.json(updated);
  }

  const updated = await prisma.question.update({
    where: { id },
    data: {
      type: body.type,
      text: body.text,
      choices: body.choices || null,
      correctAnswer: body.correctAnswer,
      explanation: body.explanation || null,
      category: body.category || null,
      difficulty: body.difficulty || "medium",
      tags: body.tags || [],
      points: body.points || 1,
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.question.delete({ where: { id } });
  return Response.json({ success: true });
}
