"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Session {
  id: string;
  status: string;
  score: number | null;
  correctCount: number | null;
  totalQuestions: number | null;
  startedAt: string;
  submittedAt: string | null;
  user: { firstName: string; lastName: string; email: string };
  exam: { title: string; passingScore: number };
}

export default function ExamResultsPage() {
  const { id: examId } = useParams<{ id: string }>();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [examTitle, setExamTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);

  function loadSessions() {
    setLoading(true);
    Promise.all([
      fetch(`/api/exams/${examId}`).then((r) => r.json()),
      fetch(`/api/admin/exams/${examId}/sessions`).then((r) => r.json()),
    ])
      .then(([examData, sessionsData]) => {
        setExamTitle(examData.title);
        setSessions(sessionsData);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  async function handleReset(sessionId: string, candidateName: string) {
    if (!confirm(`Voulez-vous vraiment relancer l'examen pour ${candidateName} ? Sa session actuelle sera supprimee.`)) {
      return;
    }

    setResettingId(sessionId);
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/reset`, { method: "POST" });
      if (res.ok) {
        loadSessions();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la reinitialisation");
      }
    } finally {
      setResettingId(null);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Chargement...</p></div>;

  return (
    <div>
      <button onClick={() => router.push("/admin/exams")} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resultats - {examTitle}</h1>
        <Button variant="outline" onClick={() => {
          window.open(`/api/admin/export?examId=${examId}`, "_blank");
        }}>
          <Download className="w-4 h-4 mr-1" /> Exporter Excel
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Candidat</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Score</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Bonnes reponses</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-sm font-medium">{s.user.firstName} {s.user.lastName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.user.email}</td>
                <td className="px-4 py-3 text-sm font-medium">{s.score !== null ? `${Math.round(s.score)}%` : "-"}</td>
                <td className="px-4 py-3 text-sm">{s.correctCount ?? "-"} / {s.totalQuestions ?? "-"}</td>
                <td className="px-4 py-3">
                  <Badge variant={s.status === "COMPLETED" ? "success" : s.status === "TIMED_OUT" ? "danger" : "warning"}>
                    {s.status === "COMPLETED" ? "Termine" : s.status === "TIMED_OUT" ? "Expire" : "En cours"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(s.startedAt).toLocaleDateString("fr")}</td>
                <td className="px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReset(s.id, `${s.user.firstName} ${s.user.lastName}`)}
                    loading={resettingId === s.id}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" /> Relancer
                  </Button>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">Aucun passage enregistre</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
