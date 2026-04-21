import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id: examId } = await params;

  const comments = await prisma.examComment.findMany({
    where: { examId },
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

  const { id: examId } = await params;
  const { type, content } = await request.json();

  if (!type || !content?.trim()) {
    return Response.json({ error: "Type et contenu requis" }, { status: 400 });
  }

  const comment = await prisma.examComment.create({
    data: {
      examId,
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
