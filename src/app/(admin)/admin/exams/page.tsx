"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { getCertification } from "@/lib/certifications";
import { Plus, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface Exam {
  id: string;
  title: string;
  certification: string | null;
  category: string;
  level: string;
  duration: number;
  numberOfQuestions: number;
  published: boolean;
  status: string;
  _count: { questions: number; sessions: number };
}

export default function ExamsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exams").then((r) => r.json()).then(setExams).finally(() => setLoading(false));
  }, []);

  async function deleteExam(id: string) {
    if (!confirm(t("delete") + " ?")) return;
    await fetch(`/api/exams/${id}`, { method: "DELETE" });
    setExams(exams.filter((e) => e.id !== id));
  }

  async function togglePublish(exam: Exam) {
    await fetch(`/api/exams/${exam.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...exam, published: !exam.published }),
    });
    setExams(exams.map((e) => e.id === exam.id ? { ...e, published: !e.published } : e));
  }

  async function toggleStatus(exam: Exam) {
    const newStatus = exam.status === "READY" ? "PENDING" : "READY";
    await fetch(`/api/exams/${exam.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...exam, status: newStatus }),
    });
    setExams(exams.map((e) => e.id === exam.id ? { ...e, status: newStatus } : e));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("exams")}</h1>
        <Button onClick={() => router.push("/admin/exams/new")}>
          <Plus className="w-4 h-4" /> {t("newExam")}
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Certification</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("title")}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("duration")}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("questions")}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("status")}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => {
              const cert = getCertification(exam.certification);
              return (
                <tr key={exam.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {cert ? (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cert.color}`}>
                        {cert.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{exam.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDuration(exam.duration)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{exam._count.questions} / {exam.numberOfQuestions}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Badge variant={exam.status === "READY" ? "success" : "warning"}>
                        {exam.status === "READY" ? "Pret" : "En attente"}
                      </Badge>
                      {exam.published && (
                        <Badge variant="info">{t("published")}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/exams/${exam.id}`)}>{t("edit")}</Button>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/exams/${exam.id}/questions`)}>{t("questions")}</Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleStatus(exam)}>
                        {exam.status === "READY" ? "En attente" : "Valider"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => togglePublish(exam)}>
                        {exam.published ? t("unpublish") : t("publish")}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/exams/${exam.id}/results`)}>{t("results")}</Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteExam(exam.id)} className="text-red-600">{t("delete")}</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {exams.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">{t("noExamCreated")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
