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

  const { id: examId } = await params;

  const sessions = await prisma.examSession.findMany({
    where: { examId },
    orderBy: { startedAt: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      exam: { select: { title: true, passingScore: true } },
    },
  });

  return Response.json(sessions);
}
