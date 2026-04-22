import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET : recuperer les inscriptions de l'utilisateur connecte
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifie" }, { status: 401 });
  }

  const enrollments = await prisma.examEnrollment.findMany({
    where: { userId: session.user.id },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          certification: true,
          category: true,
          level: true,
          duration: true,
          numberOfQuestions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(enrollments);
}

// POST : demander une inscription a un examen
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { examId } = await request.json();

  if (!examId) {
    return Response.json({ error: "examId requis" }, { status: 400 });
  }

  // Verifier que l'examen existe et est publie
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || !exam.published) {
    return Response.json({ error: "Examen introuvable" }, { status: 404 });
  }

  // Verifier si deja inscrit
  const existing = await prisma.examEnrollment.findUnique({
    where: { userId_examId: { userId: session.user.id, examId } },
  });

  if (existing) {
    return Response.json({ error: "Demande deja envoyee", status: existing.status }, { status: 409 });
  }

  const enrollment = await prisma.examEnrollment.create({
    data: {
      userId: session.user.id,
      examId,
    },
  });

  return Response.json(enrollment, { status: 201 });
}
