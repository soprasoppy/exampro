"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Stats {
  totalUsers: number;
  completedSessions: number;
  avgScore: number;
  recentSessions: {
    id: string;
    status: string;
    score: number | null;
    startedAt: string;
    user: { firstName: string; lastName: string; email: string };
    exam: { title: string };
  }[];
  examSummaries: {
    id: string;
    title: string;
    sessionCount: number;
    avgScore: number;
    passRate: number;
  }[];
}

export default function ResultsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Chargement...</p></div>;

  const filtered = stats.recentSessions.filter((s) =>
    `${s.user.firstName} ${s.user.lastName} ${s.exam.title}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tous les resultats</h1>
        <Button variant="outline" onClick={() => window.open("/api/admin/export", "_blank")}>
          Exporter tout en Excel
        </Button>
      </div>

      {/* Stats par examen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.examSummaries.map((exam) => (
          <div key={exam.id} className="bg-white rounded-xl border p-4">
            <h3 className="font-medium text-gray-900 mb-2">{exam.title}</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-blue-600">{exam.sessionCount}</p>
                <p className="text-xs text-gray-500">Passages</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{exam.avgScore}%</p>
                <p className="text-xs text-gray-500">Moyenne</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-600">{exam.passRate}%</p>
                <p className="text-xs text-gray-500">Reussite</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <Input placeholder="Rechercher par candidat ou examen..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Candidat</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Examen</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Score</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-sm">{s.user.firstName} {s.user.lastName}</td>
                <td className="px-4 py-3 text-sm">{s.exam.title}</td>
                <td className="px-4 py-3 text-sm font-medium">{s.score !== null ? `${Math.round(s.score)}%` : "-"}</td>
                <td className="px-4 py-3"><Badge variant={s.status === "COMPLETED" ? "success" : "warning"}>{s.status === "COMPLETED" ? "Termine" : "En cours"}</Badge></td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(s.startedAt).toLocaleDateString("fr")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
