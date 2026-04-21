"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
}

export default function ImportPage() {
  const { id: examId } = useParams<{ id: string }>();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/exams/${examId}/import`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    setUploading(false);
  }

  async function downloadTemplate() {
    const res = await fetch(`/api/exams/${examId}/template`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modele_import_questions.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.push(`/admin/exams/${examId}/questions`)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"><ArrowLeft className="w-4 h-4" /> Retour aux questions</button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Importer des questions depuis Excel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">Format attendu du fichier Excel :</p>
            <p className="text-xs text-blue-700 mb-2">
              Colonnes : code_question, categorie, niveau, type_question, question, choix_A, choix_B, choix_C, choix_D, bonne_reponse, explication, difficulte
            </p>
            <p className="text-xs text-blue-700 mb-3">
              Types valides : qcm, qcm_multiple, vrai_faux, reponse_courte, question_ouverte
            </p>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              Telecharger le modele Excel
            </Button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <p className="text-gray-500 mb-2">
                {file ? file.name : "Cliquez pour selectionner un fichier Excel"}
              </p>
              <Button variant="outline" type="button" onClick={() => document.getElementById("fileInput")?.click()}>
                Choisir un fichier
              </Button>
            </label>
          </div>

          {file && (
            <Button onClick={handleUpload} loading={uploading} className="w-full">
              Importer les questions
            </Button>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Resultat de l&apos;import</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1 bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{result.success}</p>
                <p className="text-sm text-green-700">Questions importees</p>
              </div>
              <div className="flex-1 bg-red-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                <p className="text-sm text-red-700">Erreurs</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-2">Erreurs :</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i}>Ligne {err.row}: {err.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button variant="outline" className="mt-4" onClick={() => router.push(`/admin/exams/${examId}/questions`)}>
              Voir les questions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
