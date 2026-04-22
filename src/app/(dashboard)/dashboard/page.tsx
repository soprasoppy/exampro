"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { BookOpen, CheckCircle, TrendingUp, Loader2, ArrowRight, Clock, FileQuestion } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { getCertification } from "@/lib/certifications";

interface Exam {
  id: string;
  title: string;
  description: string;
  certification: string | null;
  category: string;
  level: string;
  duration: number;
  numberOfQuestions: number;
  startDate: string;
  endDate: string;
  _count: { questions: number };
  userSession?: { status: string; score: number } | null;
  attempts?: number;
  bestScore?: number | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      router.push("/admin");
      return;
    }
    // Charger les examens et les inscriptions
    Promise.all([
      fetch("/api/exams").then((r) => r.json()),
      fetch("/api/enrollments").then((r) => r.ok ? r.json() : []),
    ])
      .then(([allExams, enrollments]) => {
        const enrollmentList = Array.isArray(enrollments) ? enrollments : [];
        // Filtrer: ne montrer que les examens approuves
        const approvedExamIds = new Set(
          enrollmentList
            .filter((e: { status: string }) => e.status === "APPROVED")
            .map((e: { examId: string }) => e.examId)
        );
        const filteredExams = (Array.isArray(allExams) ? allExams : []).filter((exam: Exam) => approvedExamIds.has(exam.id));
        setExams(filteredExams);
      })
      .finally(() => setLoading(false));
  }, [session, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  // En mode simulation, tous les examens restent disponibles
  const available = exams;
  const completed = exams.filter((e) => (e.attempts ?? 0) > 0);

  return (
    <div className="lg:pl-0 pl-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {t("welcome")} {session?.user?.name}
      </h1>
      <p className="text-sm text-gray-500 mb-6">{t("dashboardSubtitle")}</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { value: available.length, label: t("availableExams"), icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
          { value: completed.length, label: t("completedExams"), icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          {
            value: completed.length > 0
              ? `${Math.round(completed.reduce((a, e) => a + (e.userSession?.score ?? 0), 0) / completed.length)}%`
              : "-",
            label: t("avgScore"),
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="hover:shadow-md">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-xs text-gray-500">{kpi.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Available exams */}
      {available.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("availableExams")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {available.map((exam) => {
              const cert = getCertification(exam.certification);
              return (
              <Card key={exam.id} className="hover:shadow-md group overflow-hidden">
                {cert && <div className={`h-1.5 ${cert.color.split(" ")[0]}`} />}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {cert && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mb-2 ${cert.color}`}>
                          {cert.name}
                        </span>
                      )}
                      <CardTitle className="text-base">{exam.title}</CardTitle>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {exam.userSession?.status === "IN_PROGRESS" && (
                        <Badge variant="warning">{t("inProgress")}</Badge>
                      )}
                      {(exam.attempts ?? 0) > 0 && (
                        <span className="text-[10px] text-brand-green/50">{exam.attempts} tentative(s)</span>
                      )}
                      {exam.bestScore !== null && exam.bestScore !== undefined && (
                        <span className="text-xs font-bold text-emerald-600">{Math.round(exam.bestScore)}%</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {exam.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{exam.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {exam.category && <Badge>{exam.category}</Badge>}
                    {exam.level && <Badge variant="info">{exam.level}</Badge>}
                    <Badge variant="default">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatDuration(exam.duration)}
                    </Badge>
                    <Badge variant="default">
                      <FileQuestion className="w-3 h-3 inline mr-1" />
                      {exam.numberOfQuestions} questions
                    </Badge>
                  </div>
                  <Button
                    onClick={() => router.push(`/dashboard/exam/${exam.id}`)}
                    className="w-full group-hover:shadow-sm"
                    variant={exam.userSession?.status === "IN_PROGRESS" ? "secondary" : "primary"}
                  >
                    {exam.userSession?.status === "IN_PROGRESS" ? t("resume") : (exam.attempts ?? 0) > 0 ? "Refaire" : t("viewExam")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </section>
      )}

      {available.length === 0 && completed.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t("noExamAvailable")}</p>
          <p className="text-sm text-gray-400 mt-1">{t("noExamAvailableDesc")}</p>
        </div>
      )}

      {/* Completed exams */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("completedExams")}</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("exams")}</th>
                    <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("score")}</th>
                    <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {completed.map((exam) => (
                    <tr key={exam.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{exam.title}</td>
                      <td className="px-4 py-3 text-sm font-bold">
                        {Math.round(exam.userSession?.score ?? 0)}%
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={(exam.userSession?.score ?? 0) >= 50 ? "success" : "danger"}>
                          {(exam.userSession?.score ?? 0) >= 50 ? t("passed") : t("failed")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
