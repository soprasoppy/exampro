"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Choice {
  label: string;
  text: string;
}

interface Question {
  id: string;
  code: string | null;
  type: string;
  text: string;
  choices: Choice[] | null;
  correctAnswer: string;
  explanation: string | null;
  category: string | null;
  difficulty: string;
  points: number;
}

export default function QuestionsPage() {
  const { id: examId } = useParams<{ id: string }>();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "SINGLE_CHOICE",
    text: "",
    choiceA: "", choiceB: "", choiceC: "", choiceD: "",
    correctAnswer: "",
    explanation: "",
    category: "",
    difficulty: "medium",
    points: 1,
  });

  useEffect(() => { loadQuestions(); }, [examId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadQuestions() {
    const res = await fetch(`/api/exams/${examId}/questions`);
    setQuestions(await res.json());
    setLoading(false);
  }

  async function addQuestion(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const choices = [];
    if (form.choiceA) choices.push({ label: "A", text: form.choiceA });
    if (form.choiceB) choices.push({ label: "B", text: form.choiceB });
    if (form.choiceC) choices.push({ label: "C", text: form.choiceC });
    if (form.choiceD) choices.push({ label: "D", text: form.choiceD });

    await fetch(`/api/exams/${examId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        text: form.text,
        choices: choices.length > 0 ? choices : null,
        correctAnswer: form.correctAnswer,
        explanation: form.explanation || null,
        category: form.category || null,
        difficulty: form.difficulty,
        points: form.points,
      }),
    });

    setShowModal(false);
    setForm({ type: "SINGLE_CHOICE", text: "", choiceA: "", choiceB: "", choiceC: "", choiceD: "", correctAnswer: "", explanation: "", category: "", difficulty: "medium", points: 1 });
    setSaving(false);
    loadQuestions();
  }

  const typeLabels: Record<string, string> = {
    SINGLE_CHOICE: "QCM simple",
    MULTIPLE_CHOICE: "QCM multiple",
    TRUE_FALSE: "Vrai/Faux",
    SHORT_ANSWER: "Reponse courte",
    OPEN_ENDED: "Question ouverte",
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Chargement...</p></div>;

  return (
    <div>
      <button onClick={() => router.push("/admin/exams")} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"><ArrowLeft className="w-4 h-4" /> Retour aux examens</button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Questions ({questions.length})</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/exams/${examId}/import`)}>Importer Excel</Button>
          <Button onClick={() => setShowModal(true)}>+ Ajouter une question</Button>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => (
          <Card key={q.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">#{i + 1}</span>
                    <Badge variant="info">{typeLabels[q.type] || q.type}</Badge>
                    <Badge variant={q.difficulty === "easy" ? "success" : q.difficulty === "hard" ? "danger" : "warning"}>
                      {q.difficulty}
                    </Badge>
                    <Badge>{q.points} pt(s)</Badge>
                  </div>
                  <p className="text-gray-900">{q.text}</p>
                  {q.choices && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(q.choices as Choice[]).map((c) => (
                        <span key={c.label} className={`text-sm px-2 py-1 rounded ${q.correctAnswer.includes(c.label) ? "bg-green-100 text-green-800 font-medium" : "bg-gray-100 text-gray-600"}`}>
                          {c.label}. {c.text}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Bonne reponse : {q.correctAnswer}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {questions.length === 0 && (
          <Card><CardContent className="py-8 text-center text-sm text-gray-500">Aucune question. Ajoutez des questions manuellement ou importez un fichier Excel.</CardContent></Card>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Ajouter une question" className="max-w-2xl">
        <form onSubmit={addQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de question</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="SINGLE_CHOICE">QCM simple</option>
              <option value="MULTIPLE_CHOICE">QCM multiple</option>
              <option value="TRUE_FALSE">Vrai / Faux</option>
              <option value="SHORT_ANSWER">Reponse courte</option>
              <option value="OPEN_ENDED">Question ouverte</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          {(form.type === "SINGLE_CHOICE" || form.type === "MULTIPLE_CHOICE" || form.type === "TRUE_FALSE") && (
            <div className="grid grid-cols-2 gap-3">
              <Input id="cA" label="Choix A" value={form.choiceA} onChange={(e) => setForm({ ...form, choiceA: e.target.value })} />
              <Input id="cB" label="Choix B" value={form.choiceB} onChange={(e) => setForm({ ...form, choiceB: e.target.value })} />
              <Input id="cC" label="Choix C" value={form.choiceC} onChange={(e) => setForm({ ...form, choiceC: e.target.value })} />
              <Input id="cD" label="Choix D" value={form.choiceD} onChange={(e) => setForm({ ...form, choiceD: e.target.value })} />
            </div>
          )}
          <Input id="answer" label="Bonne reponse (ex: A, ou A,B pour multiple)" value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} required />
          <Input id="expl" label="Explication (optionnel)" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
          <div className="grid grid-cols-3 gap-3">
            <Input id="cat" label="Categorie" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulte</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>
            <Input id="pts" label="Points" type="number" min={0.5} step={0.5} value={form.points} onChange={(e) => setForm({ ...form, points: parseFloat(e.target.value) || 1 })} />
          </div>
          <Button type="submit" loading={saving} className="w-full">Ajouter</Button>
        </form>
      </Modal>
    </div>
  );
}
