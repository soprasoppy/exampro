"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Loader2, MessageSquare, AlertTriangle, Lightbulb,
  Send, User, CheckCircle, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Choice { label: string; text: string; }

interface Answer {
  questionId: string;
  answer: string | null;
  isCorrect: boolean | null;
  question: {
    id: string; text: string; type: string;
    choices: Choice[] | null; correctAnswer: string;
    explanation: string | null; points: number;
  };
}

interface SessionResult {
  id: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  startedAt: string;
  submittedAt: string;
  exam: { id: string; title: string; passingScore: number; duration: number };
  answers: Answer[];
  user: { firstName: string; lastName: string; email: string };
}

interface Comment {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  user: { firstName: string; lastName: string; role: string };
}

const COMMENT_TYPES = [
  { value: "COMMENT", label: "Commentaire", icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
  { value: "REMARK", label: "Remarque", icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
  { value: "SUGGESTION", label: "Suggestion", icon: Lightbulb, color: "text-emerald-600 bg-emerald-50" },
] as const;

export default function InstructorSessionReviewPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const router = useRouter();

  const [result, setResult] = useState<SessionResult | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [commentType, setCommentType] = useState("COMMENT");
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/sessions/${sessionId}/result`).then((r) => r.json()),
      fetch(`/api/instructor/sessions/${sessionId}/comments`).then((r) => r.json()),
    ]).then(([resultData, commentsData]) => {
      setResult(resultData);
      setComments(Array.isArray(commentsData) ? commentsData : []);
    }).finally(() => setLoading(false));
  }, [sessionId]);

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/instructor/sessions/${sessionId}/comments`, {
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

  if (loading || !result) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-brand-orange animate-spin" /></div>;
  }

  const passed = result.score >= result.exam.passingScore;

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-brand-green/60 hover:text-brand-green mb-4">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Candidate info + score */}
      <Card className="mb-6">
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center">
                <User className="w-6 h-6 text-brand-green" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-brand-green">
                  {result.user.firstName} {result.user.lastName}
                </h1>
                <p className="text-sm text-brand-green/50">{result.user.email}</p>
                <p className="text-xs text-brand-green/40 mt-0.5">
                  {result.exam.title} - Soumis le {new Date(result.submittedAt).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className={cn("text-3xl font-bold", passed ? "text-emerald-600" : "text-red-500")}>
                {Math.round(result.score)}%
              </p>
              <Badge variant={passed ? "success" : "danger"}>
                {passed ? "Reussi" : "Echoue"}
              </Badge>
              <p className="text-xs text-brand-green/40 mt-1">{result.correctCount}/{result.totalQuestions} correctes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Answers review */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold text-brand-green">Reponses du candidat</h2>
          {result.answers.map((a, i) => (
            <Card key={a.questionId} className={cn(
              "border-l-4",
              a.isCorrect ? "border-l-emerald-500" : a.answer ? "border-l-red-500" : "border-l-gray-300"
            )}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-brand-green/50">Question {i + 1}</span>
                  <div className="flex items-center gap-1">
                    {a.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : a.answer ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : null}
                    <Badge variant={a.isCorrect ? "success" : a.answer ? "danger" : "default"}>
                      {a.isCorrect ? "Correct" : a.answer ? "Incorrect" : "Non repondu"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-brand-green mb-3">{a.question.text}</p>

                {a.question.choices && (
                  <div className="space-y-1 mb-3">
                    {(a.question.choices as Choice[]).map((c) => {
                      const isCorrectChoice = a.question.correctAnswer.split(",").includes(c.label);
                      const isUserChoice = a.answer?.split(",").includes(c.label);
                      return (
                        <div key={c.label} className={cn(
                          "px-3 py-1.5 rounded-lg text-sm",
                          isCorrectChoice ? "bg-emerald-50 text-emerald-800 font-medium" : "",
                          isUserChoice && !isCorrectChoice ? "bg-red-50 text-red-800" : "",
                        )}>
                          <span className="font-medium mr-2">{c.label}.</span>
                          {c.text}
                          {isCorrectChoice && " \u2713"}
                          {isUserChoice && !isCorrectChoice && " (reponse du candidat)"}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!a.question.choices && (
                  <div className="text-sm space-y-1 mb-3">
                    <p><span className="font-medium text-brand-green/70">Reponse :</span> {a.answer || "Non repondu"}</p>
                    <p><span className="font-medium text-emerald-700">Bonne reponse :</span> {a.question.correctAnswer}</p>
                  </div>
                )}

                {a.question.explanation && (
                  <div className="bg-brand-light-mint rounded-lg p-2.5 text-xs text-brand-green/70">
                    <span className="font-medium">Explication :</span> {a.question.explanation}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comments panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-brand-green">
            Commentaires ({comments.length})
          </h2>

          {/* Comment form */}
          <Card>
            <CardContent className="pt-4">
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
                            : "text-brand-green/50 hover:bg-brand-cream"
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
                  placeholder="Votre retour pour ce candidat..."
                  required
                  className="w-full border border-brand-green/15 rounded-lg px-3 py-2 text-sm text-brand-green focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange hover:border-brand-green/30 transition-all duration-200 resize-y"
                />

                <Button type="submit" size="sm" loading={submitting} className="w-full bg-brand-orange hover:bg-[#C96A24]">
                  <Send className="w-4 h-4" /> Envoyer
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
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", typeInfo?.color || "bg-gray-100 text-gray-600")}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-brand-green">{c.user.firstName} {c.user.lastName}</span>
                      </div>
                      <p className="text-sm text-brand-green/80 whitespace-pre-wrap">{c.content}</p>
                      <p className="text-[10px] text-brand-green/40 mt-1.5">
                        {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {comments.length === 0 && (
            <p className="text-center text-sm text-brand-green/40 py-4">Aucun commentaire pour cette session</p>
          )}
        </div>
      </div>
    </div>
  );
}
