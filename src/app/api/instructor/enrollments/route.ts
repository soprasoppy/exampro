import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET : recuperer toutes les demandes d'inscription (pour instructeur/admin)
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const enrollments = await prisma.examEnrollment.findMany({
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      exam: { select: { id: true, title: true, certification: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return Response.json(enrollments);
}
