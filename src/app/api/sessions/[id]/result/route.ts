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

  const { id } = await params;

  const examSession = await prisma.examSession.findUnique({
    where: { id },
    include: {
      exam: { select: { id: true, title: true, passingScore: true, duration: true } },
      answers: {
        include: {
          question: {
            select: {
              id: true,
              text: true,
              type: true,
              choices: true,
              correctAnswer: true,
              explanation: true,
              points: true,
            },
          },
        },
      },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  if (!examSession) {
    return Response.json({ error: "Session non trouvee" }, { status: 404 });
  }

  // Candidats ne voient que leurs propres resultats, instructeurs et admins voient tout
  if (examSession.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  if (examSession.status === "IN_PROGRESS") {
    return Response.json({ error: "L'examen est encore en cours" }, { status: 400 });
  }

  return Response.json(examSession);
}
