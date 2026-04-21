"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Save, Send, AlertTriangle, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

interface Choice {
  label: string;
  text: string;
}

interface Question {
  id: string;
  type: string;
  text: string;
  choices: Choice[] | null;
  points: number;
}

interface SessionData {
  id: string;
  examId: string;
  status: string;
  endsAt: string;
  exam: { title: string; duration: number };
  questions: Question[];
  answers: { questionId: string; answer: string | null }[];
}

export default function ExamSessionPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const router = useRouter();
  const { t } = useI18n();

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Bloquer la navigation (fermeture onglet, rafraichissement)
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Bloquer le bouton retour du navigateur
  useEffect(() => {
    function handlePopState() {
      window.history.pushState(null, "", window.location.href);
    }

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Bloquer les raccourcis clavier de navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Bloquer F5, Ctrl+R, Ctrl+W, Alt+F4, Alt+Left
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r") ||
        (e.ctrlKey && e.key === "w") ||
        (e.altKey && e.key === "F4") ||
        (e.altKey && e.key === "ArrowLeft")
      ) {
        e.preventDefault();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Desactiver le clic droit
  useEffect(() => {
    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
    }

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // Charger la session
  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((data: SessionData) => {
        if (data.status === "COMPLETED") {
          router.push(`/dashboard/results/${sessionId}`);
          return;
        }

        setSessionData(data);

        // Restaurer les reponses sauvegardees
        const savedAnswers: Record<string, string> = {};
        data.answers?.forEach((a: { questionId: string; answer: string | null }) => {
          if (a.answer) savedAnswers[a.questionId] = a.answer;
        });
        setAnswers(savedAnswers);

        // Calculer le temps restant
        const remaining = Math.max(0, Math.floor((new Date(data.endsAt).getTime() - Date.now()) / 1000));
        setTimeRemaining(remaining);
      })
      .finally(() => setLoading(false));
  }, [sessionId, router]);

  // Chronometre
  useEffect(() => {
    if (timeRemaining <= 0 && sessionData) {
      handleSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining > 0]);

  // Sauvegarder une reponse
  const saveAnswer = useCallback(
    async (questionId: string, answer: string) => {
      if (!sessionId) return;
      setSaving(true);
      try {
        await fetch(`/api/sessions/${sessionId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, answer }),
        });
      } finally {
        setSaving(false);
      }
    },
    [sessionId]
  );

  // Gestion des reponses avec debounce
  function handleAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveAnswer(questionId, value), 500);
  }

  // QCM multiple : toggle une option
  function toggleMultiple(questionId: string, label: string) {
    const current = answers[questionId] || "";
    const selected = current ? current.split(",") : [];
    const idx = selected.indexOf(label);

    if (idx >= 0) {
      selected.splice(idx, 1);
    } else {
      selected.push(label);
    }

    const value = selected.sort().join(",");
    handleAnswer(questionId, value);
  }

  // Soumettre l'examen
  async function handleSubmit() {
    if (submitting) return;

    // Sauvegarder la derniere reponse en cours
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    const currentQ = sessionData?.questions[currentIndex];
    if (currentQ && answers[currentQ.id]) {
      await saveAnswer(currentQ.id, answers[currentQ.id]);
    }

    setSubmitting(true);
    const res = await fetch(`/api/sessions/${sessionId}/submit`, { method: "POST" });

    if (res.ok) {
      router.push(`/dashboard/results/${sessionId}`);
    } else {
      setSubmitting(false);
      alert("Erreur lors de la soumission");
    }
  }

  // Formater le temps
  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  if (loading || !sessionData) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-900 flex items-center justify-center">
        <p className="text-gray-300 text-lg">{t("loadingExam")}</p>
      </div>
    );
  }

  const questions = sessionData.questions;
  const currentQuestion = questions[currentIndex];
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const isLastMinute = timeRemaining <= 60;

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-100 flex flex-col overflow-hidden select-none">
      {/* Barre superieure fixe */}
      <header className="bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-gray-900 text-lg">{sessionData.exam.title}</h1>
          <span className="text-sm text-gray-500">
            {t("question")} {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-sm text-gray-500">
            {answeredCount} / {questions.length} {t("answered").toLowerCase()}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {saving && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Save className="w-3 h-3 animate-pulse" /> {t("saving")}
            </span>
          )}

          <div className={cn(
            "flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg",
            isLastMinute ? "bg-red-100 text-red-700 animate-pulse" : "bg-gray-100 text-gray-900"
          )}>
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>

          {isLastMinute && (
            <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
              <AlertTriangle className="w-4 h-4" /> {t("lastMinute")}
            </span>
          )}

          <Button variant="danger" size="sm" onClick={() => {
            if (confirm(t("submitConfirm"))) handleSubmit();
          }} loading={submitting}>
            <Send className="w-4 h-4 mr-1" /> {t("submit")}
          </Button>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panneau navigation questions (gauche) */}
        <aside className="w-56 bg-white border-r p-4 overflow-y-auto shrink-0">
          <p className="text-sm font-semibold text-gray-700 mb-3">{t("questions")}</p>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, i) => {
              const isCurrent = i === currentIndex;
              const isPast = i < currentIndex;
              const isFuture = i > currentIndex;

              return (
                <button
                  key={q.id}
                  disabled
                  className={cn(
                    "w-9 h-9 rounded-lg text-xs font-semibold cursor-default",
                    isCurrent
                      ? "bg-blue-600 text-white shadow-sm"
                      : isPast && answers[q.id]
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : isPast
                      ? "bg-gray-200 text-gray-400"
                      : "bg-gray-50 text-gray-300"
                  )}
                >
                  {isFuture ? <Lock className="w-3 h-3 mx-auto" /> : i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-6 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-600 shrink-0"></span> {t("current")}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-green-100 border border-green-300 shrink-0"></span> {t("answered")}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-gray-50 shrink-0 flex items-center justify-center"><Lock className="w-2 h-2 text-gray-300" /></span> {t("locked")}
            </div>
          </div>
        </aside>

        {/* Zone question (centre) */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto bg-white rounded-xl border shadow-sm p-8">
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="info">{t("question")} {currentIndex + 1}</Badge>
              <Badge>
                {currentQuestion.type === "SINGLE_CHOICE" && t("singleChoice")}
                {currentQuestion.type === "MULTIPLE_CHOICE" && t("multipleChoice")}
                {currentQuestion.type === "TRUE_FALSE" && t("trueFalse")}
                {currentQuestion.type === "SHORT_ANSWER" && t("shortAnswer")}
                {currentQuestion.type === "OPEN_ENDED" && t("openEnded")}
              </Badge>
              <Badge variant="default">{currentQuestion.points} {t("pts")}</Badge>
            </div>

            <p className="text-gray-900 text-lg mb-8 leading-relaxed">{currentQuestion.text}</p>

            {/* QCM simple */}
            {currentQuestion.type === "SINGLE_CHOICE" && currentQuestion.choices && (
              <div className="space-y-3">
                {(currentQuestion.choices as Choice[]).map((choice) => (
                  <label
                    key={choice.label}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                      answers[currentQuestion.id] === choice.label
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <input
                      type="radio"
                      name={`q_${currentQuestion.id}`}
                      value={choice.label}
                      checked={answers[currentQuestion.id] === choice.label}
                      onChange={() => handleAnswer(currentQuestion.id, choice.label)}
                      className="text-blue-600"
                    />
                    <span className="font-medium text-gray-700 mr-2">{choice.label}.</span>
                    <span>{choice.text}</span>
                  </label>
                ))}
              </div>
            )}

            {/* QCM multiple */}
            {currentQuestion.type === "MULTIPLE_CHOICE" && currentQuestion.choices && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-2">{t("multipleAnswers")}</p>
                {(currentQuestion.choices as Choice[]).map((choice) => {
                  const selected = (answers[currentQuestion.id] || "").split(",");
                  return (
                    <label
                      key={choice.label}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        selected.includes(choice.label)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(choice.label)}
                        onChange={() => toggleMultiple(currentQuestion.id, choice.label)}
                        className="text-blue-600"
                      />
                      <span className="font-medium text-gray-700 mr-2">{choice.label}.</span>
                      <span>{choice.text}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Vrai/Faux */}
            {currentQuestion.type === "TRUE_FALSE" && (
              <div className="flex gap-4">
                {[t("true"), t("false")].map((val, i) => (
                  <label
                    key={val}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors",
                      answers[currentQuestion.id] === (i === 0 ? "A" : "B")
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <input
                      type="radio"
                      name={`q_${currentQuestion.id}`}
                      checked={answers[currentQuestion.id] === (i === 0 ? "A" : "B")}
                      onChange={() => handleAnswer(currentQuestion.id, i === 0 ? "A" : "B")}
                      className="text-blue-600"
                    />
                    <span className="font-medium">{val}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Reponse courte */}
            {currentQuestion.type === "SHORT_ANSWER" && (
              <input
                type="text"
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("yourAnswer")}
              />
            )}

            {/* Question ouverte */}
            {currentQuestion.type === "OPEN_ENDED" && (
              <textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                rows={6}
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder={t("writeAnswer")}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-end mt-10 pt-6 border-t">
              {currentIndex < questions.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!answers[currentQuestion.id]) {
                      alert(t("answerRequired"));
                      return;
                    }
                    setCurrentIndex((i) => i + 1);
                  }}
                >
                  {t("next")} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={() => {
                    if (!answers[currentQuestion.id]) {
                      alert(t("submitAnswerRequired"));
                      return;
                    }
                    if (confirm(t("submitConfirm"))) {
                      handleSubmit();
                    }
                  }}
                  loading={submitting}
                >
                  <Send className="w-4 h-4 mr-1" /> {t("submitExam")}
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
