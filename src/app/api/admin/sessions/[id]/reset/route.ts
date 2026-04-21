import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id: sessionId } = await params;

  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    select: { id: true, userId: true, examId: true, status: true },
  });

  if (!examSession) {
    return Response.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Supprimer les reponses puis la session
  await prisma.sessionAnswer.deleteMany({ where: { sessionId } });
  await prisma.examSession.delete({ where: { id: sessionId } });

  return Response.json({ success: true });
}
