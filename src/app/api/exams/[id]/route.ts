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
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      _count: { select: { questions: true, sessions: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  if (!exam) {
    return Response.json({ error: "Examen non trouve" }, { status: 404 });
  }

  return Response.json(exam);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const exam = await prisma.exam.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      certification: body.certification,
      category: body.category,
      level: body.level,
      duration: body.duration,
      numberOfQuestions: body.numberOfQuestions,
      randomOrder: body.randomOrder,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      published: body.published,
      status: body.status,
      passingScore: body.passingScore,
    },
  });

  return Response.json(exam);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.exam.delete({ where: { id } });
  return Response.json({ success: true });
}
