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
