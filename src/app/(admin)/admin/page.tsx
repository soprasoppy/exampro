"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, CheckCircle, Clock, TrendingUp, Loader2 } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalExams: number;
  totalSessions: number;
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
    questionCount: number;
    sessionCount: number;
    avgScore: number;
    passRate: number;
  }[];
}

const kpiConfig = [
  { key: "totalUsers", label: "Candidats", icon: Users, color: "text-brand-green", bg: "bg-brand-light-mint" },
  { key: "totalExams", label: "Examens", icon: FileText, color: "text-brand-orange", bg: "bg-brand-cream" },
  { key: "completed", label: "Examens passes", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "inProgress", label: "En cours", icon: Clock, color: "text-brand-orange", bg: "bg-orange-50" },
  { key: "avgScore", label: "Score moyen", icon: TrendingUp, color: "text-brand-green", bg: "bg-brand-mint/20" },
] as const;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  const kpiValues: Record<string, string | number> = {
    totalUsers: stats.totalUsers,
    totalExams: stats.totalExams,
    completed: stats.completedSessions,
    inProgress: stats.totalSessions - stats.completedSessions,
    avgScore: `${stats.avgScore}%`,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {kpiConfig.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.key} className="hover:shadow-md">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${kpi.color}`}>{kpiValues[kpi.key]}</p>
                    <p className="text-xs text-gray-500">{kpi.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Examens */}
        <Card>
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-900">Examens</h2>
          </div>
          <div className="divide-y">
            {stats.examSummaries.map((exam) => (
              <div key={exam.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{exam.title}</p>
                  <p className="text-xs text-gray-500">{exam.questionCount} questions | {exam.sessionCount} passages</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{exam.avgScore}%</p>
                  <p className="text-xs text-gray-500">Reussite: {exam.passRate}%</p>
                </div>
              </div>
            ))}
            {stats.examSummaries.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-gray-400">Aucun examen cree</p>
            )}
          </div>
        </Card>

        {/* Sessions recentes */}
        <Card>
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-900">Sessions recentes</h2>
          </div>
          <div className="divide-y">
            {stats.recentSessions.map((s) => (
              <div key={s.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.user.firstName} {s.user.lastName}</p>
                  <p className="text-xs text-gray-500">{s.exam.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  {s.score !== null && <span className="text-sm font-bold text-gray-900">{Math.round(s.score)}%</span>}
                  <Badge variant={s.status === "COMPLETED" ? "success" : "warning"}>
                    {s.status === "COMPLETED" ? "Termine" : "En cours"}
                  </Badge>
                </div>
              </div>
            ))}
            {stats.recentSessions.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-gray-400">Aucune session</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
