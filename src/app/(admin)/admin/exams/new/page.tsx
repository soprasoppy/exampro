"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CERTIFICATIONS } from "@/lib/certifications";
import { useI18n } from "@/lib/i18n/context";

export default function NewExamPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    certification: "",
    category: "",
    level: "",
    duration: 60,
    numberOfQuestions: 20,
    randomOrder: false,
    startDate: "",
    endDate: "",
    passingScore: 50,
  });

  function updateField(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const exam = await res.json();
      router.push(`/admin/exams/${exam.id}/questions`);
    } else {
      alert("Erreur lors de la creation");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </button>

      <Card>
        <CardHeader>
          <CardTitle>{t("newExam")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Certification type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Certification <span className="text-red-500">*</span>
              </label>
              <select
                value={form.certification}
                onChange={(e) => updateField("certification", e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              >
                <option value="">-- Choisir une certification --</option>
                {CERTIFICATIONS.map((cert) => (
                  <option key={cert.id} value={cert.id}>
                    {cert.name} - {cert.fullName}
                  </option>
                ))}
              </select>
            </div>

            <Input id="title" label={t("title")} value={form.title} onChange={(e) => updateField("title", e.target.value)} required placeholder="Ex: PMP Practice Exam #1" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("description")}</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input id="category" label={t("category")} value={form.category} onChange={(e) => updateField("category", e.target.value)} placeholder="Ex: Knowledge Areas" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("level")}</label>
                <select
                  value={form.level}
                  onChange={(e) => updateField("level", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                >
                  <option value="">--</option>
                  <option value="Debutant">Debutant</option>
                  <option value="Intermediaire">Intermediaire</option>
                  <option value="Avance">Avance</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input id="duration" label={`${t("duration")} (min)`} type="number" min={1} value={form.duration} onChange={(e) => updateField("duration", parseInt(e.target.value) || 0)} required />
              <Input id="nbQuestions" label={t("numberOfQuestions")} type="number" min={1} value={form.numberOfQuestions} onChange={(e) => updateField("numberOfQuestions", parseInt(e.target.value) || 0)} required />
              <Input id="passingScore" label={`${t("passingScore")} (%)`} type="number" min={0} max={100} value={form.passingScore} onChange={(e) => updateField("passingScore", parseInt(e.target.value) || 0)} required />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="randomOrder" checked={form.randomOrder} onChange={(e) => updateField("randomOrder", e.target.checked)} className="rounded" />
              <label htmlFor="randomOrder" className="text-sm text-gray-700">Activer le mode aleatoire (melange des questions)</label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input id="startDate" label="Date d'ouverture" type="datetime-local" value={form.startDate} onChange={(e) => updateField("startDate", e.target.value)} />
              <Input id="endDate" label="Date de fermeture" type="datetime-local" value={form.endDate} onChange={(e) => updateField("endDate", e.target.value)} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={saving} className="flex-1">Creer et ajouter des questions</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>{t("cancel")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
