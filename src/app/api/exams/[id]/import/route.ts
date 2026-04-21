import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import * as XLSX from "xlsx";
import type { ExcelQuestion, ImportResult } from "@/lib/types";

function mapQuestionType(type: string): "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "OPEN_ENDED" {
  const normalized = (type || "").toLowerCase().trim();
  if (normalized === "qcm" || normalized === "single_choice" || normalized === "qcm_simple") return "SINGLE_CHOICE";
  if (normalized === "qcm_multiple" || normalized === "multiple_choice") return "MULTIPLE_CHOICE";
  if (normalized === "vrai_faux" || normalized === "true_false" || normalized === "vrai/faux") return "TRUE_FALSE";
  if (normalized === "reponse_courte" || normalized === "short_answer") return "SHORT_ANSWER";
  if (normalized === "question_ouverte" || normalized === "open_ended") return "OPEN_ENDED";
  return "SINGLE_CHOICE";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id } = await params;

  // Verifier que l'examen existe
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) {
    return Response.json({ error: "Examen non trouve" }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return Response.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: ExcelQuestion[] = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return Response.json({ error: "Le fichier est vide" }, { status: 400 });
    }

    const result: ImportResult = { success: 0, errors: [] };
    const lastQuestion = await prisma.question.findFirst({
      where: { examId: id },
      orderBy: { orderIndex: "desc" },
    });
    let orderIndex = (lastQuestion?.orderIndex ?? -1) + 1;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // +2 car ligne 1 = en-tete

      if (!row.question) {
        result.errors.push({ row: rowNum, message: "La colonne 'question' est vide" });
        continue;
      }
      if (!row.bonne_reponse) {
        result.errors.push({ row: rowNum, message: "La colonne 'bonne_reponse' est vide" });
        continue;
      }

      const type = mapQuestionType(row.type_question || "");
      const choices = [];
      if (row.choix_A) choices.push({ label: "A", text: row.choix_A });
      if (row.choix_B) choices.push({ label: "B", text: row.choix_B });
      if (row.choix_C) choices.push({ label: "C", text: row.choix_C });
      if (row.choix_D) choices.push({ label: "D", text: row.choix_D });

      try {
        await prisma.question.create({
          data: {
            examId: id,
            code: row.code_question?.toString(),
            type,
            text: row.question,
            choices: choices.length > 0 ? choices : undefined,
            correctAnswer: row.bonne_reponse.toString(),
            explanation: row.explication,
            category: row.categorie,
            difficulty: row.difficulte || "medium",
            orderIndex: orderIndex++,
          },
        });
        result.success++;
      } catch (e) {
        result.errors.push({
          row: rowNum,
          message: `Erreur d'insertion: ${e instanceof Error ? e.message : "inconnue"}`,
        });
      }
    }

    return Response.json(result);
  } catch {
    return Response.json({ error: "Erreur lors du traitement du fichier" }, { status: 500 });
  }
}
