"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditExamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "", description: "", category: "", level: "",
    duration: 60, numberOfQuestions: 20, randomOrder: false,
    startDate: "", endDate: "", passingScore: 50, published: false,
  });

  useEffect(() => {
    fetch(`/api/exams/${id}`).then((r) => r.json()).then((exam) => {
      setForm({
        title: exam.title,
        description: exam.description || "",
        category: exam.category || "",
        level: exam.level || "",
        duration: exam.duration,
        numberOfQuestions: exam.numberOfQuestions,
        randomOrder: exam.randomOrder,
        startDate: exam.startDate ? new Date(exam.startDate).toISOString().slice(0, 16) : "",
        endDate: exam.endDate ? new Date(exam.endDate).toISOString().slice(0, 16) : "",
        passingScore: exam.passingScore,
        published: exam.published,
      });
      setLoading(false);
    });
  }, [id]);

  function updateField(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/exams/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin/exams");
  }

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Chargement...</p></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"><ArrowLeft className="w-4 h-4" /> Retour</button>

      <Card>
        <CardHeader><CardTitle>Modifier l&apos;examen</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="title" label="Titre" value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input id="category" label="Categorie" value={form.category} onChange={(e) => updateField("category", e.target.value)} />
              <Input id="level" label="Niveau" value={form.level} onChange={(e) => updateField("level", e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input id="duration" label="Duree (min)" type="number" min={1} value={form.duration} onChange={(e) => updateField("duration", parseInt(e.target.value) || 0)} required />
              <Input id="nbQ" label="Nb questions" type="number" min={1} value={form.numberOfQuestions} onChange={(e) => updateField("numberOfQuestions", parseInt(e.target.value) || 0)} required />
              <Input id="pass" label="Seuil (%)" type="number" min={0} max={100} value={form.passingScore} onChange={(e) => updateField("passingScore", parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.randomOrder} onChange={(e) => updateField("randomOrder", e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Mode aleatoire</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.published} onChange={(e) => updateField("published", e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Publie</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input id="start" label="Date d'ouverture" type="datetime-local" value={form.startDate} onChange={(e) => updateField("startDate", e.target.value)} />
              <Input id="end" label="Date de fermeture" type="datetime-local" value={form.endDate} onChange={(e) => updateField("endDate", e.target.value)} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={saving} className="flex-1">Sauvegarder</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
