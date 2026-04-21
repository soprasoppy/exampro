import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Non autorise" }, { status: 401 });
  }

  const completedSessions = await prisma.examSession.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
      score: { not: null },
    },
    select: {
      id: true,
      score: true,
      submittedAt: true,
      exam: {
        select: {
          title: true,
          certification: true,
          passingScore: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return Response.json(completedSessions);
}
