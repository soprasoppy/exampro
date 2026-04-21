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

  const { id: sessionId } = await params;

  const comments = await prisma.examComment.findMany({
    where: { sessionId },
    include: {
      user: { select: { firstName: true, lastName: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(comments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id: sessionId } = await params;
  const { type, content } = await request.json();

  if (!type || !content?.trim()) {
    return Response.json({ error: "Type et contenu requis" }, { status: 400 });
  }

  // Get the examId from the session
  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    select: { examId: true },
  });

  if (!examSession) {
    return Response.json({ error: "Session introuvable" }, { status: 404 });
  }

  const comment = await prisma.examComment.create({
    data: {
      examId: examSession.examId,
      sessionId,
      userId: session.user.id,
      type,
      content: content.trim(),
    },
    include: {
      user: { select: { firstName: true, lastName: true, role: true } },
    },
  });

  return Response.json(comment, { status: 201 });
}
