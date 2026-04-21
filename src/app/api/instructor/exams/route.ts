import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const exams = await prisma.exam.findMany({
    include: {
      _count: { select: { questions: true, sessions: true, comments: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(exams);
}
