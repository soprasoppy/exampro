import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Non autorise" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("examId");

  if (!examId) {
    return Response.json({ error: "examId requis" }, { status: 400 });
  }

  const sessions = await prisma.examSession.findMany({
    where: {
      userId: session.user.id,
      examId,
    },
    select: {
      id: true,
      status: true,
      score: true,
      submittedAt: true,
      startedAt: true,
    },
    orderBy: { startedAt: "desc" },
  });

  return Response.json(sessions);
}
