"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, FileQuestion, Target, Shuffle, Timer, RotateCcw, Trophy, MessageSquare, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { getCertification } from "@/lib/certifications";
import { useI18n } from "@/lib/i18n/context";

interface Exam {
  id: string;
  title: string;
  description: string;
  certification: string | null;
  category: string;
  level: string;
  duration: number;
  numberOfQuestions: number;
  passingScore: number;
  randomOrder: boolean;
  _count: { questions: number };
}

interface ExamComment {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  user: { firstName: string; lastName: string; role: string };
}

interface PastSession {
  id: string;
  score: number | null;
  status: string;
  submittedAt: string | null;
  startedAt: string;
}

const DURATION_OPTIONS = [
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1h" },
  { value: 90, label: "1h30" },
  { value: 120, label: "2h" },
  { value: 0, label: "Duree par defaut" },
];

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const [exam, setExam] = useState<Exam | null>(null);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [comments, setComments] = useState<ExamComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`/api/exams/${id}`).then((r) => r.json()),
      fetch(`/api/sessions/history?examId=${id}`).then((r) => r.json()).catch(() => []),
      fetch(`/api/exams/${id}/comments`).then((r) => r.json()).catch(() => []),
    ]).then(([examData, sessions, commentsData]) => {
      setExam(examData);
      setPastSessions(Array.isArray(sessions) ? sessions : []);
      setComments(Array.isArray(commentsData) ? commentsData : []);
    }).finally(() => setLoading(false));
  }, [id]);

  async function startExam() {
    setStarting(true);
    const body: Record<string, unknown> = { examId: id };
    if (selectedDuration > 0) body.customDuration = selectedDuration;

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const session = await res.json();
      router.push(`/dashboard/exam/${id}/session?sessionId=${session.id}`);
    } else {
      const data = await res.json();
      alert(data.error || "Erreur lors du demarrage");
      setStarting(false);
    }
  }

  if (loading || !exam) {
    return <div className="flex items-center justify-center h-64"><p className="text-brand-green/50">Chargement...</p></div>;
  }

  const cert = getCertification(exam.certification);
  const hasInProgress = pastSessions.some((s) => s.status === "IN_PROGRESS");
  const completedSessions = pastSessions.filter((s) => s.status === "COMPLETED");
  const bestScore = completedSessions.length > 0
    ? Math.max(...completedSessions.map((s) => s.score ?? 0))
    : null;

  return (
    <div className="max-w-2xl mx-auto lg:pl-0 pl-12">
      <button onClick={() => router.back()} className="text-sm text-brand-green/60 hover:text-brand-green mb-4 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              {cert && (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2 ${cert.color}`}>
                  {cert.name}
                </span>
              )}
              <CardTitle className="text-xl">{exam.title}</CardTitle>
            </div>
            {bestScore !== null && (
              <div className="text-right shrink-0">
                <p className="text-xs text-brand-green/50">Meilleur score</p>
                <p className={`text-lg font-bold ${bestScore >= exam.passingScore ? "text-emerald-600" : "text-red-500"}`}>
                  {Math.round(bestScore)}%
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {exam.description && <p className="text-brand-green/70">{exam.description}</p>}

          <div className="flex flex-wrap gap-2">
            {exam.category && <Badge>{exam.category}</Badge>}
            {exam.level && <Badge variant="info">{exam.level}</Badge>}
          </div>

          {/* Exam info */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-brand-green/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-light-mint flex items-center justify-center">
                <Clock className="w-4 h-4 text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-brand-green/50">{t("duration")}</p>
                <p className="font-semibold text-brand-green">{formatDuration(exam.duration)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-cream flex items-center justify-center">
                <FileQuestion className="w-4 h-4 text-brand-orange" />
              </div>
              <div>
                <p className="text-xs text-brand-green/50">{t("questions")}</p>
                <p className="font-semibold text-brand-green">{exam.numberOfQuestions}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-light-mint flex items-center justify-center">
                <Target className="w-4 h-4 text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-brand-green/50">{t("passingScore")}</p>
                <p className="font-semibold text-brand-green">{exam.passingScore}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-cream flex items-center justify-center">
                <Shuffle className="w-4 h-4 text-brand-orange" />
              </div>
              <div>
                <p className="text-xs text-brand-green/50">Mode</p>
                <p className="font-semibold text-brand-green">{exam.randomOrder ? "Aleatoire" : "Ordre fixe"}</p>
              </div>
            </div>
          </div>

          {/* Duration selector */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-brand-green mb-2">
              <Timer className="w-4 h-4 text-brand-orange" />
              Choisir la duree de composition
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedDuration(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedDuration === opt.value
                      ? "bg-brand-orange text-white shadow-sm"
                      : "bg-brand-cream text-brand-green hover:bg-brand-green/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {selectedDuration > 0 && (
              <p className="text-xs text-brand-orange mt-2">
                Duree personnalisee : {formatDuration(selectedDuration)} (au lieu de {formatDuration(exam.duration)})
              </p>
            )}
          </div>

          {/* Instructor comments */}
          {comments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-brand-green mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-orange" />
                Remarques de l&apos;instructeur ({comments.length})
              </h3>
              <div className="space-y-2">
                {comments.map((c) => {
                  const typeConfig = {
                    COMMENT: { icon: MessageSquare, color: "border-l-blue-400 bg-blue-50/50", iconColor: "text-blue-500" },
                    REMARK: { icon: AlertTriangle, color: "border-l-amber-400 bg-amber-50/50", iconColor: "text-amber-500" },
                    SUGGESTION: { icon: Lightbulb, color: "border-l-emerald-400 bg-emerald-50/50", iconColor: "text-emerald-500" },
                  }[c.type] || { icon: MessageSquare, color: "border-l-gray-400 bg-gray-50/50", iconColor: "text-gray-500" };
                  const Icon = typeConfig.icon;
                  return (
                    <div key={c.id} className={`border-l-4 rounded-r-xl p-3 ${typeConfig.color}`}>
                      <div className="flex items-start gap-2.5">
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${typeConfig.iconColor}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-brand-green whitespace-pre-wrap">{c.content}</p>
                          <p className="text-[10px] text-brand-green/40 mt-1.5">
                            {c.user.firstName} {c.user.lastName} - {new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="bg-brand-light-mint border border-brand-mint/30 rounded-xl p-4">
            <p className="text-sm text-brand-green font-medium mb-1">Mode simulation :</p>
            <ul className="text-sm text-brand-green/70 space-y-1 list-disc list-inside">
              <li>Vous pouvez refaire cet examen autant de fois que vous le souhaitez</li>
              <li>Choisissez votre duree de composition ci-dessus</li>
              <li>Vos reponses sont sauvegardees automatiquement</li>
              <li>Consultez vos resultats apres chaque tentative</li>
            </ul>
          </div>

          {/* Start button */}
          <Button onClick={startExam} loading={starting} size="lg" className="w-full bg-brand-orange hover:bg-[#C96A24]">
            {hasInProgress ? (
              <><RotateCcw className="w-4 h-4" /> Reprendre l&apos;examen en cours</>
            ) : completedSessions.length > 0 ? (
              <><RotateCcw className="w-4 h-4" /> Refaire l&apos;examen</>
            ) : (
              <><Timer className="w-4 h-4" /> {t("startExam")}</>
            )}
          </Button>

          {/* Past sessions */}
          {completedSessions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-brand-green mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-brand-orange" />
                Historique des tentatives ({completedSessions.length})
              </h3>
              <div className="space-y-2">
                {completedSessions.map((s, i) => (
                  <div
                    key={s.id}
                    onClick={() => router.push(`/dashboard/results/${s.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl border border-brand-green/10 hover:bg-brand-cream/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-brand-green/40 w-6">#{completedSessions.length - i}</span>
                      <div>
                        <p className="text-sm text-brand-green/60">
                          {s.submittedAt && new Date(s.submittedAt).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={s.score !== null && s.score >= exam.passingScore ? "success" : "danger"}>
                      {s.score !== null ? `${Math.round(s.score)}%` : "-"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
