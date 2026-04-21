import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const examId = request.nextUrl.searchParams.get("examId");
  const where = examId
    ? { examId, status: "COMPLETED" as const }
    : { status: "COMPLETED" as const };

  const sessions = await prisma.examSession.findMany({
    where,
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      exam: { select: { title: true, passingScore: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  const data = sessions.map((s: typeof sessions[number]) => ({
    Candidat: `${s.user.firstName} ${s.user.lastName}`,
    Email: s.user.email,
    Examen: s.exam.title,
    Score: `${Math.round((s.score ?? 0) * 10) / 10}%`,
    "Questions correctes": `${s.correctCount ?? 0}/${s.totalQuestions ?? 0}`,
    Resultat: (s.score ?? 0) >= s.exam.passingScore ? "Reussi" : "Echoue",
    "Date de passage": s.startedAt.toISOString().split("T")[0],
    "Soumis le": s.submittedAt?.toISOString().split("T")[0] ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resultats");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=resultats_${new Date().toISOString().split("T")[0]}.xlsx`,
    },
  });
}
