import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// PATCH : approuver ou rejeter une inscription (instructeur/admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return Response.json({ error: "Statut invalide" }, { status: 400 });
  }

  const enrollment = await prisma.examEnrollment.update({
    where: { id },
    data: { status },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      exam: { select: { title: true } },
    },
  });

  return Response.json(enrollment);
}
