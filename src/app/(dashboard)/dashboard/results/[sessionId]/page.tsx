"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Choice {
  label: string;
  text: string;
}

interface Answer {
  questionId: string;
  answer: string | null;
  isCorrect: boolean | null;
  question: {
    id: string;
    text: string;
    type: string;
    choices: Choice[] | null;
    correctAnswer: string;
    explanation: string | null;
    points: number;
  };
}

interface ExamComment {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  user: { firstName: string; lastName: string; role: string };
}

interface ResultData {
  id: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  totalPoints: number;
  startedAt: string;
  submittedAt: string;
  exam: { id: string; title: string; passingScore: number; duration: number };
  answers: Answer[];
  user: { firstName: string; lastName: string; email: string };
}

export default function ResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);
  const [comments, setComments] = useState<ExamComment[]>([]);
  const [sessionComments, setSessionComments] = useState<ExamComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/result`)
      .then((r) => r.json())
      .then((data) => {
        setResult(data);
        // Charger commentaires generaux de l'examen + commentaires specifiques a cette session
        Promise.all([
          data?.exam?.id ? fetch(`/api/exams/${data.exam.id}/comments`).then((r) => r.json()).catch(() => []) : [],
          fetch(`/api/instructor/sessions/${sessionId}/comments`).then((r) => r.json()).catch(() => []),
        ]).then(([examComments, sessComments]) => {
          setComments(Array.isArray(examComments) ? examComments : []);
          setSessionComments(Array.isArray(sessComments) ? sessComments : []);
        });
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading || !result) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Chargement...</p></div>;
  }

  const passed = result.score >= result.exam.passingScore;

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour au tableau de bord
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{result.exam.title} - Resultats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-center py-8 rounded-xl mb-6",
            passed ? "bg-green-50" : "bg-red-50"
          )}>
            <p className="text-5xl font-bold mb-2" style={{ color: passed ? "#16a34a" : "#dc2626" }}>
              {Math.round(result.score)}%
            </p>
            <Badge variant={passed ? "success" : "danger"} className="text-base px-4 py-1">
              {passed ? "Reussi" : "Echoue"}
            </Badge>
            <p className="text-sm text-gray-600 mt-3">
              Seuil de reussite : {result.exam.passingScore}%
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{result.correctCount}/{result.totalQuestions}</p>
              <p className="text-sm text-gray-600">Bonnes reponses</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{result.totalQuestions}</p>
              <p className="text-sm text-gray-600">Questions</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{result.exam.duration} min</p>
              <p className="text-sm text-gray-600">Duree</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructor comments */}
      {comments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-brand-green mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-orange" />
            Remarques de l&apos;instructeur
          </h2>
          <div className="space-y-3">
            {comments.map((c) => {
              const typeConfig = {
                COMMENT: { icon: MessageSquare, color: "border-l-blue-400 bg-blue-50/50", iconColor: "text-blue-500", label: "Commentaire" },
                REMARK: { icon: AlertTriangle, color: "border-l-amber-400 bg-amber-50/50", iconColor: "text-amber-500", label: "Remarque" },
                SUGGESTION: { icon: Lightbulb, color: "border-l-emerald-400 bg-emerald-50/50", iconColor: "text-emerald-500", label: "Suggestion" },
              }[c.type] || { icon: MessageSquare, color: "border-l-gray-400 bg-gray-50/50", iconColor: "text-gray-500", label: "Note" };
              const Icon = typeConfig.icon;
              return (
                <Card key={c.id} className={`border-l-4 ${typeConfig.color} border-t-0 border-r-0 border-b-0`}>
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${typeConfig.iconColor}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-brand-green/70">{typeConfig.label}</span>
                          <span className="text-[10px] text-brand-green/40">
                            par {c.user.firstName} {c.user.lastName} - {new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <p className="text-sm text-brand-green whitespace-pre-wrap">{c.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Session-specific comments from instructor */}
      {sessionComments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-brand-green mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-orange" />
            Retour de l&apos;instructeur sur votre passage
          </h2>
          <div className="space-y-3">
            {sessionComments.map((c) => {
              const typeConfig = {
                COMMENT: { icon: MessageSquare, color: "border-l-blue-400 bg-blue-50/50", iconColor: "text-blue-500", label: "Commentaire" },
                REMARK: { icon: AlertTriangle, color: "border-l-amber-400 bg-amber-50/50", iconColor: "text-amber-500", label: "Remarque" },
                SUGGESTION: { icon: Lightbulb, color: "border-l-emerald-400 bg-emerald-50/50", iconColor: "text-emerald-500", label: "Suggestion" },
              }[c.type] || { icon: MessageSquare, color: "border-l-gray-400 bg-gray-50/50", iconColor: "text-gray-500", label: "Note" };
              const Icon = typeConfig.icon;
              return (
                <Card key={c.id} className={`border-l-4 ${typeConfig.color} border-t-0 border-r-0 border-b-0`}>
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${typeConfig.iconColor}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-brand-green/70">{typeConfig.label}</span>
                          <span className="text-[10px] text-brand-green/40">
                            par {c.user.firstName} {c.user.lastName} - {new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <p className="text-sm text-brand-green whitespace-pre-wrap">{c.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail des reponses */}
      <h2 className="text-lg font-semibold text-brand-green mb-4">Detail des reponses</h2>
      <div className="space-y-4">
        {result.answers.map((a, i) => (
          <Card key={a.questionId} className={cn(
            "border-l-4",
            a.isCorrect ? "border-l-green-500" : a.answer ? "border-l-red-500" : "border-l-gray-300"
          )}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Question {i + 1}</span>
                <Badge variant={a.isCorrect ? "success" : a.answer ? "danger" : "default"}>
                  {a.isCorrect ? "Correct" : a.answer ? "Incorrect" : "Non repondu"}
                </Badge>
              </div>
              <p className="text-gray-900 mb-3">{a.question.text}</p>

              {a.question.choices && (
                <div className="space-y-1 mb-3">
                  {(a.question.choices as Choice[]).map((c) => {
                    const isCorrectChoice = a.question.correctAnswer.split(",").includes(c.label);
                    const isUserChoice = a.answer?.split(",").includes(c.label);
                    return (
                      <div key={c.label} className={cn(
                        "px-3 py-2 rounded text-sm",
                        isCorrectChoice ? "bg-green-50 text-green-800 font-medium" : "",
                        isUserChoice && !isCorrectChoice ? "bg-red-50 text-red-800" : "",
                      )}>
                        <span className="font-medium mr-2">{c.label}.</span>
                        {c.text}
                        {isCorrectChoice && " \u2713"}
                        {isUserChoice && !isCorrectChoice && " (votre reponse)"}
                      </div>
                    );
                  })}
                </div>
              )}

              {!a.question.choices && (
                <div className="mb-3">
                  <p className="text-sm"><span className="font-medium">Votre reponse :</span> {a.answer || "Non repondu"}</p>
                  <p className="text-sm"><span className="font-medium">Bonne reponse :</span> {a.question.correctAnswer}</p>
                </div>
              )}

              {a.question.explanation && (
                <div className="bg-blue-50 rounded-lg p-3 mt-2">
                  <p className="text-sm text-blue-800"><span className="font-medium">Explication :</span> {a.question.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
