"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getCertification } from "@/lib/certifications";
import {
  Loader2, FileText, HelpCircle, Users, TrendingUp,
  AlertTriangle, Clock, ArrowRight,
} from "lucide-react";

interface DashboardData {
  totalExams: number;
  totalQuestions: number;
  totalSessions: number;
  completedSessions: number;
  avgScore: number;
  activeExams: {
    id: string;
    title: string;
    certification: string | null;
    createdAt: string;
    _count: { sessions: number; questions: number };
  }[];
  recentActivity: {
    id: string;
    score: number;
    submittedAt: string;
    user: { firstName: string; lastName: string };
    exam: { title: string };
  }[];
  weakQuestions: {
    id: string;
    text: string;
    type: string;
    difficulty: string | null;
    exam: { title: string; certification: string | null };
    total: number;
    correct: number;
    rate: number;
  }[];
}

export default function InstructorDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/instructor/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Welcome card */}
      <Card className="mb-6 bg-gradient-to-r from-brand-green to-[#2D6A4F] border-0">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Bienvenue, {session?.user?.name}
              </h1>
              <p className="text-brand-mint/80 text-sm mt-1">Instructeur - Tableau de bord</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={() => router.push("/instructor/questions")} className="bg-white/10 text-white hover:bg-white/20 border-0">
                <HelpCircle className="w-4 h-4" /> Banque de questions
              </Button>
              <Button variant="secondary" size="sm" onClick={() => router.push("/instructor/exams")} className="bg-brand-orange text-white hover:bg-[#C96A24] border-0">
                <FileText className="w-4 h-4" /> Voir les examens
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Examens", value: data.totalExams, icon: FileText, color: "text-brand-green", bg: "bg-brand-light-mint" },
          { label: "Questions", value: data.totalQuestions, icon: HelpCircle, color: "text-brand-orange", bg: "bg-brand-cream" },
          { label: "Passages", value: data.completedSessions, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Score moyen", value: `${data.avgScore}%`, icon: TrendingUp, color: "text-brand-green", bg: "bg-brand-mint/20" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="hover:shadow-md">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-xs text-brand-green/50">{kpi.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active exams */}
        <div className="lg:col-span-1">
          <Card>
            <div className="px-5 py-4 border-b border-brand-green/10 flex items-center justify-between">
              <h2 className="font-semibold text-brand-green">Examens actifs</h2>
              <Badge variant="info">{data.activeExams.length}</Badge>
            </div>
            <div className="divide-y divide-brand-green/5">
              {data.activeExams.map((exam) => {
                const cert = getCertification(exam.certification);
                return (
                  <div key={exam.id} className="px-5 py-3 hover:bg-brand-cream/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      {cert && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cert.color}`}>{cert.name}</span>}
                      <span className="text-sm font-medium text-brand-green truncate">{exam.title}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-brand-green/50">
                      <span>{exam._count.questions} questions</span>
                      <span>{exam._count.sessions} passages</span>
                    </div>
                  </div>
                );
              })}
              {data.activeExams.length === 0 && (
                <p className="px-5 py-6 text-center text-sm text-brand-green/40">Aucun examen actif</p>
              )}
            </div>
          </Card>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-1">
          <Card>
            <div className="px-5 py-4 border-b border-brand-green/10">
              <h2 className="font-semibold text-brand-green">Activite recente</h2>
            </div>
            <div className="divide-y divide-brand-green/5">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="px-5 py-3 hover:bg-brand-cream/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-brand-green">
                        {activity.user.firstName} {activity.user.lastName}
                      </p>
                      <p className="text-xs text-brand-green/50">{activity.exam.title}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${activity.score >= 65 ? "text-emerald-600" : "text-red-500"}`}>
                        {Math.round(activity.score)}%
                      </p>
                      <p className="text-[10px] text-brand-green/40">
                        {activity.submittedAt && new Date(activity.submittedAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {data.recentActivity.length === 0 && (
                <p className="px-5 py-6 text-center text-sm text-brand-green/40">Aucune activite</p>
              )}
            </div>
          </Card>
        </div>

        {/* Weak questions */}
        <div className="lg:col-span-1">
          <Card>
            <div className="px-5 py-4 border-b border-brand-green/10 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-brand-orange" />
              <h2 className="font-semibold text-brand-green">Questions a reviser</h2>
            </div>
            <div className="divide-y divide-brand-green/5">
              {data.weakQuestions.map((q) => (
                <div key={q.id} className="px-5 py-3 hover:bg-red-50/30 transition-colors">
                  <p className="text-sm text-brand-green line-clamp-2 mb-1">{q.text}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="danger">{q.rate}% reussite</Badge>
                    <span className="text-[10px] text-brand-green/40">{q.total} tentatives</span>
                  </div>
                </div>
              ))}
              {data.weakQuestions.length === 0 && (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm text-emerald-600 font-medium">Aucune question faible</p>
                  <p className="text-xs text-brand-green/40 mt-1">Toutes les questions ont un taux de reussite acceptable</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
