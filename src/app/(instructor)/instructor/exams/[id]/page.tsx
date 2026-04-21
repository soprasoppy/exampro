"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCertification } from "@/lib/certifications";
import { useI18n } from "@/lib/i18n/context";
import {
  ArrowLeft, Loader2, MessageSquare, AlertTriangle, Lightbulb,
  Send, Trash2, User, Eye, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  type: string;
  text: string;
  choices: { label: string; text: string }[] | null;
  correctAnswer: string;
  explanation: string | null;
  difficulty: string | null;
  points: number;
  orderIndex: number;
}

interface Comment {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  user: { firstName: string; lastName: string; role: string };
}

interface CandidateSession {
  id: string;
  score: number | null;
  correctCount: number | null;
  totalQuestions: number | null;
  submittedAt: string | null;
  user: { firstName: string; lastName: string; email: string };
  _count: { comments: number };
}

interface ExamDetail {
  id: string;
  title: string;
  description: string | null;
  certification: string | null;
  category: string | null;
  level: string | null;
  duration: number;
  numberOfQuestions: number;
  passingScore: number;
  status: string;
}

const COMMENT_TYPES = [
  { value: "COMMENT", label: "Commentaire", icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
  { value: "REMARK", label: "Remarque", icon: AlertTriangle, color: "text-orange-600 bg-orange-50" },
  { value: "SUGGESTION", label: "Suggestion", icon: Lightbulb, color: "text-green-600 bg-green-50" },
] as const;

export default function InstructorExamDetailPage() {
  const { id: examId } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [candidateSessions, setCandidateSessions] = useState<CandidateSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Comment form
  const [commentType, setCommentType] = useState("COMMENT");
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/exams/${examId}`).then((r) => r.json()),
      fetch(`/api/instructor/exams/${examId}/questions`).then((r) => r.json()),
      fetch(`/api/instructor/exams/${examId}/comments`).then((r) => r.json()),
      fetch(`/api/instructor/exams/${examId}/sessions`).then((r) => r.json()).catch(() => []),
    ])
      .then(([examData, questionsData, commentsData, sessionsData]) => {
        setExam(examData);
        setQuestions(questionsData);
        setComments(commentsData);
        setCandidateSessions(Array.isArray(sessionsData) ? sessionsData : []);
      })
      .finally(() => setLoading(false));
  }, [examId]);

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/instructor/exams/${examId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: commentType, content: commentContent }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments([newComment, ...comments]);
        setCommentContent("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !exam) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  const cert = getCertification(exam.certification);

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </button>

      {/* Exam info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              {cert && (
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mb-2 ${cert.color}`}>
                  {cert.name} - {cert.fullName}
                </span>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
              {exam.description && <p className="text-gray-600 mt-1">{exam.description}</p>}
            </div>
            <Badge variant={exam.status === "READY" ? "success" : "warning"}>
              {exam.status === "READY" ? "Pret" : "En attente"}
            </Badge>
          </div>
          <div className="flex gap-4 mt-4 text-sm text-gray-500">
            <span>{t("duration")} : {exam.duration} min</span>
            <span>{t("questions")} : {exam.numberOfQuestions}</span>
            <span>{t("passingScore")} : {exam.passingScore}%</span>
            {exam.level && <span>{t("level")} : {exam.level}</span>}
          </div>
        </CardContent>
      </Card>

      {/* Candidates who completed the exam */}
      {candidateSessions.length > 0 && (
        <Card className="mb-6">
          <div className="px-6 py-4 border-b border-brand-green/10 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-orange" />
            <h2 className="font-semibold text-brand-green">Passages des candidats ({candidateSessions.length})</h2>
          </div>
          <div className="divide-y divide-brand-green/5">
            {candidateSessions.map((s) => (
              <div
                key={s.id}
                className="px-6 py-3 flex items-center justify-between hover:bg-brand-cream/30 cursor-pointer transition-colors"
                onClick={() => router.push(`/instructor/sessions/${s.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-cream flex items-center justify-center">
                    <User className="w-4 h-4 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-green">{s.user.firstName} {s.user.lastName}</p>
                    <p className="text-xs text-brand-green/50">{s.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {s._count.comments > 0 && (
                    <span className="flex items-center gap-1 text-xs text-brand-green/50">
                      <MessageSquare className="w-3 h-3" /> {s._count.comments}
                    </span>
                  )}
                  <Badge variant={s.score !== null && s.score >= (exam.passingScore || 50) ? "success" : "danger"}>
                    {s.score !== null ? `${Math.round(s.score)}%` : "-"}
                  </Badge>
                  <span className="text-xs text-brand-green/40">
                    {s.submittedAt && new Date(s.submittedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/instructor/sessions/${s.id}`); }}>
                    <Eye className="w-4 h-4" /> Voir & commenter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-brand-green">{t("questions")} ({questions.length})</h2>

          {questions.map((q, i) => (
            <Card key={q.id}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="info">Q{i + 1}</Badge>
                  <Badge>
                    {q.type === "SINGLE_CHOICE" && t("singleChoice")}
                    {q.type === "MULTIPLE_CHOICE" && t("multipleChoice")}
                    {q.type === "TRUE_FALSE" && t("trueFalse")}
                    {q.type === "SHORT_ANSWER" && t("shortAnswer")}
                    {q.type === "OPEN_ENDED" && t("openEnded")}
                  </Badge>
                  {q.difficulty && (
                    <Badge variant={q.difficulty === "easy" ? "success" : q.difficulty === "hard" ? "danger" : "warning"}>
                      {q.difficulty}
                    </Badge>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">{q.points} {t("pts")}</span>
                </div>

                <p className="text-gray-900 mb-3">{q.text}</p>

                {q.choices && (
                  <div className="space-y-1.5 mb-3">
                    {(q.choices as { label: string; text: string }[]).map((c) => (
                      <div
                        key={c.label}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm border",
                          q.correctAnswer.includes(c.label)
                            ? "border-green-300 bg-green-50 text-green-800 font-medium"
                            : "border-gray-200 text-gray-600"
                        )}
                      >
                        <span className="font-medium mr-2">{c.label}.</span>
                        {c.text}
                      </div>
                    ))}
                  </div>
                )}

                {!q.choices && (
                  <div className="px-3 py-2 rounded-lg text-sm border border-green-300 bg-green-50 text-green-800 mb-3">
                    {t("correctAnswers")} : {q.correctAnswer}
                  </div>
                )}

                {q.explanation && (
                  <div className="px-3 py-2 rounded-lg text-xs bg-gray-50 text-gray-600 border">
                    <span className="font-medium">Explication :</span> {q.explanation}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {questions.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">{t("noData")}</p>
          )}
        </div>

        {/* Comments panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t("comments")} ({comments.length})</h2>

          {/* Comment form */}
          <Card>
            <CardContent className="pt-5">
              <form onSubmit={handleSubmitComment} className="space-y-3">
                <div className="flex gap-1.5">
                  {COMMENT_TYPES.map((ct) => {
                    const Icon = ct.icon;
                    return (
                      <button
                        key={ct.value}
                        type="button"
                        onClick={() => setCommentType(ct.value)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          commentType === ct.value
                            ? ct.color + " ring-1 ring-current"
                            : "text-gray-500 hover:bg-gray-100"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {ct.label}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={3}
                  placeholder={t("writeComment")}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 resize-y"
                />

                <Button type="submit" size="sm" loading={submitting} className="w-full">
                  <Send className="w-4 h-4" /> {t("send")}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Comments list */}
          {comments.map((c) => {
            const typeInfo = COMMENT_TYPES.find((ct) => ct.value === c.type);
            const Icon = typeInfo?.icon || MessageSquare;
            return (
              <Card key={c.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", typeInfo?.color || "bg-gray-100 text-gray-600")}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {c.user.firstName} {c.user.lastName}
                        </span>
                        <Badge variant="info" className="text-[10px] px-1.5 py-0">
                          {c.user.role === "INSTRUCTOR" ? "Instructeur" : "Admin"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                      <p className="text-xs text-gray-400 mt-1.5">
                        {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {comments.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">{t("noComment")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
