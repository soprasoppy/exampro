"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { getCertification } from "@/lib/certifications";
import {
  Loader2, Search, Plus, Pencil, Trash2, Copy, Eye, EyeOff,
  ChevronLeft, ChevronRight, Filter, X, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  examId: string;
  type: string;
  text: string;
  choices: { label: string; text: string }[] | null;
  correctAnswer: string;
  explanation: string | null;
  category: string | null;
  difficulty: string | null;
  tags: string[];
  active: boolean;
  points: number;
  successRate: number | null;
  totalAnswers: number;
  exam: { title: string; certification: string | null };
  _count: { answers: number };
}

interface QuestionsResponse {
  questions: Question[];
  total: number;
  page: number;
  totalPages: number;
}

const TYPES = [
  { value: "SINGLE_CHOICE", label: "QCM simple" },
  { value: "MULTIPLE_CHOICE", label: "QCM multiple" },
  { value: "TRUE_FALSE", label: "Vrai / Faux" },
  { value: "SHORT_ANSWER", label: "Reponse courte" },
  { value: "OPEN_ENDED", label: "Question ouverte" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Facile", color: "bg-emerald-100 text-emerald-800" },
  { value: "medium", label: "Moyen", color: "bg-amber-100 text-amber-800" },
  { value: "hard", label: "Difficile", color: "bg-red-100 text-red-800" },
];

export default function QuestionBankPage() {
  const [data, setData] = useState<QuestionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<{ id: string; title: string; certification: string | null }[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Modal
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    examId: "",
    type: "SINGLE_CHOICE",
    text: "",
    choices: [{ label: "A", text: "" }, { label: "B", text: "" }, { label: "C", text: "" }, { label: "D", text: "" }],
    correctAnswer: "",
    explanation: "",
    difficulty: "medium",
    tags: "",
    points: 1,
  });

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (search) params.set("search", search);
    if (filterExam) params.set("examId", filterExam);
    if (filterType) params.set("type", filterType);
    if (filterDifficulty) params.set("difficulty", filterDifficulty);
    if (filterStatus) params.set("status", filterStatus);

    const res = await fetch(`/api/instructor/questions?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [page, search, filterExam, filterType, filterDifficulty, filterStatus]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    fetch("/api/instructor/exams").then((r) => r.json()).then((exams) => {
      setExams(exams.map((e: { id: string; title: string; certification: string | null }) => ({ id: e.id, title: e.title, certification: e.certification })));
    });
  }, []);

  function openCreate() {
    setEditingQuestion(null);
    setForm({
      examId: exams[0]?.id || "",
      type: "SINGLE_CHOICE",
      text: "",
      choices: [{ label: "A", text: "" }, { label: "B", text: "" }, { label: "C", text: "" }, { label: "D", text: "" }],
      correctAnswer: "",
      explanation: "",
      difficulty: "medium",
      tags: "",
      points: 1,
    });
    setModalOpen(true);
  }

  function openEdit(q: Question) {
    setEditingQuestion(q);
    setForm({
      examId: q.examId,
      type: q.type,
      text: q.text,
      choices: (q.choices as { label: string; text: string }[]) || [{ label: "A", text: "" }, { label: "B", text: "" }],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      difficulty: q.difficulty || "medium",
      tags: q.tags.join(", "),
      points: q.points,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      choices: ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"].includes(form.type) ? form.choices : null,
    };

    const url = editingQuestion
      ? `/api/instructor/questions/${editingQuestion.id}`
      : "/api/instructor/questions";

    await fetch(url, {
      method: editingQuestion ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setModalOpen(false);
    setSaving(false);
    loadQuestions();
  }

  async function handleDuplicate(id: string) {
    await fetch(`/api/instructor/questions/${id}/duplicate`, { method: "POST" });
    loadQuestions();
  }

  async function handleToggleStatus(id: string) {
    await fetch(`/api/instructor/questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "toggle-status" }),
    });
    loadQuestions();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer definitivement cette question ?")) return;
    await fetch(`/api/instructor/questions/${id}`, { method: "DELETE" });
    loadQuestions();
  }

  function clearFilters() {
    setSearch("");
    setFilterExam("");
    setFilterType("");
    setFilterDifficulty("");
    setFilterStatus("");
    setPage(1);
  }

  const hasFilters = search || filterExam || filterType || filterDifficulty || filterStatus;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-green">Banque de questions</h1>
          <p className="text-sm text-brand-green/50 mt-0.5">{data?.total || 0} questions au total</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Ajouter une question
        </Button>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-green/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher une question..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-green/15 text-sm text-brand-green placeholder:text-brand-green/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4" /> Filtres
          {hasFilters && <span className="w-2 h-2 bg-brand-orange rounded-full" />}
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card className="mb-4">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-brand-green/60 mb-1 block">Examen</label>
                <select value={filterExam} onChange={(e) => { setFilterExam(e.target.value); setPage(1); }}
                  className="w-full rounded-lg border border-brand-green/15 px-3 py-2 text-sm text-brand-green focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
                  <option value="">Tous</option>
                  {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-brand-green/60 mb-1 block">Type</label>
                <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                  className="w-full rounded-lg border border-brand-green/15 px-3 py-2 text-sm text-brand-green focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
                  <option value="">Tous</option>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-brand-green/60 mb-1 block">Difficulte</label>
                <select value={filterDifficulty} onChange={(e) => { setFilterDifficulty(e.target.value); setPage(1); }}
                  className="w-full rounded-lg border border-brand-green/15 px-3 py-2 text-sm text-brand-green focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
                  <option value="">Toutes</option>
                  {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-brand-green/60 mb-1 block">Statut</label>
                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                  className="w-full rounded-lg border border-brand-green/15 px-3 py-2 text-sm text-brand-green focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
                  <option value="">Tous</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-3 text-xs text-brand-orange hover:text-[#C96A24] font-medium flex items-center gap-1">
                <X className="w-3 h-3" /> Effacer les filtres
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Questions list */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 text-brand-orange animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {data?.questions.map((q) => {
            const cert = getCertification(q.exam.certification);
            const diff = DIFFICULTIES.find((d) => d.value === q.difficulty);
            return (
              <Card key={q.id} className={cn("hover:shadow-md", !q.active && "opacity-60")}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {cert && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cert.color}`}>{cert.name}</span>}
                        <Badge variant="info">{TYPES.find((t) => t.value === q.type)?.label}</Badge>
                        {diff && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${diff.color}`}>{diff.label}</span>}
                        {!q.active && <Badge variant="danger">Inactif</Badge>}
                        {q.tags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-brand-cream text-brand-green px-1.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                      <p className="text-sm text-brand-green font-medium line-clamp-2">{q.text}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-brand-green/50">
                        <span>{q.exam.title}</span>
                        <span>{q.points} pt(s)</span>
                        {q.successRate !== null && (
                          <span className={q.successRate < 40 ? "text-red-500 font-medium" : ""}>
                            {q.successRate}% reussite ({q.totalAnswers} rep.)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit(q)} className="p-2 rounded-lg text-brand-green/40 hover:text-brand-green hover:bg-brand-cream transition-colors" title="Modifier">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDuplicate(q.id)} className="p-2 rounded-lg text-brand-green/40 hover:text-brand-green hover:bg-brand-cream transition-colors" title="Dupliquer">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggleStatus(q.id)} className="p-2 rounded-lg text-brand-green/40 hover:text-brand-green hover:bg-brand-cream transition-colors" title={q.active ? "Desactiver" : "Activer"}>
                        {q.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {data?.questions.length === 0 && (
            <div className="text-center py-16">
              <HelpCircle className="w-12 h-12 text-brand-green/20 mx-auto mb-4" />
              <p className="text-brand-green/50 font-medium">Aucune question trouvee</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-brand-green/60 px-3">
            Page {page} / {data.totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingQuestion ? "Modifier la question" : "Ajouter une question"} className="max-w-2xl">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-brand-green/60 mb-1 block">Examen</label>
              <select value={form.examId} onChange={(e) => setForm({ ...form, examId: e.target.value })} required
                className="w-full rounded-lg border border-brand-green/15 px-3 py-2 text-sm text-brand-green focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
                {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-brand-green/60 mb-1 block">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required
                className="w-full rounded-lg border border-brand-green/15 px-3 py-2 text-sm text-brand-green focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-brand-green/60 mb-1 block">Question</label>
            <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required rows={3}
              className="w-full rounded-lg border border-brand-green/15 px-3 py-2 text-sm text-brand-green focus:outline-none focus:ring-2 focus:ring-brand-orange/50 resize-y" />
          </div>

          {["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"].includes(form.type) && (
            <div>
              <label className="text-xs font-medium text-brand-green/60 mb-1 block">Choix</label>
              <div className="space-y-2">
                {form.choices.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm font-bold text-brand-green w-6">{c.label}.</span>
                    <input
                      value={c.text}
                      onChange={(e) => {
                        const newChoices = [...form.choices];
                        newChoices[i] = { ...c, text: e.target.value };
                        setForm({ ...form, choices: newChoices });
                      }}
                      className="flex-1 rounded-lg border border-brand-green/15 px-3 py-1.5 text-sm text-brand-green focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                      placeholder={`Choix ${c.label}`}
                    />
                  </div>
                ))}
                {form.type !== "TRUE_FALSE" && form.choices.length < 6 && (
                  <button type="button" onClick={() => {
                    const next = String.fromCharCode(65 + form.choices.length);
                    setForm({ ...form, choices: [...form.choices, { label: next, text: "" }] });
                  }} className="text-xs text-brand-orange hover:text-[#C96A24] font-medium">
                    + Ajouter un choix
                  </button>
                )}
              </div>
            </div>
          )}

          <Input
            id="correctAnswer"
            label="Reponse correcte"
            value={form.correctAnswer}
            onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
            placeholder={form.type === "MULTIPLE_CHOICE" ? "Ex: A,C" : "Ex: B"}
            required
          />

          <div>
            <label className="text-xs font-medium text-brand-green/60 mb-1 block">Explication</label>
            <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2}
              className="w-full rounded-lg border border-brand-green/15 px-3 py-2 text-sm text-brand-green focus:outline-none focus:ring-2 focus:ring-brand-orange/50 resize-y"
              placeholder="Explication de la bonne reponse..." />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-brand-green/60 mb-1 block">Difficulte</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full rounded-lg border border-brand-green/15 px-3 py-2 text-sm text-brand-green focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
                {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <Input id="points" label="Points" type="number" min={1} value={form.points} onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 1 })} />
            <Input id="tags" label="Tags (virgule)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Reseau, Securite" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} className="flex-1 bg-brand-orange hover:bg-[#C96A24]">
              {editingQuestion ? "Enregistrer" : "Ajouter"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
