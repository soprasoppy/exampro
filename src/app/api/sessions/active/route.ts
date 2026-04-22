import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifie" }, { status: 401 });
  }

  const activeSession = await prisma.examSession.findFirst({
    where: {
      userId: session.user.id,
      status: "IN_PROGRESS",
    },
    select: {
      id: true,
      examId: true,
    },
    orderBy: { startedAt: "desc" },
  });

  if (!activeSession) {
    return Response.json({ sessionId: null });
  }

  return Response.json({ sessionId: activeSession.id, examId: activeSession.examId });
}
