import { auth } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Acces refuse" }, { status: 403 });
  }

  const templateData = [
    {
      code_question: "Q001",
      categorie: "Mathematiques",
      niveau: "Licence 1",
      type_question: "qcm",
      question: "Quel est le resultat de 2 + 2 ?",
      choix_A: "3",
      choix_B: "4",
      choix_C: "5",
      choix_D: "6",
      bonne_reponse: "B",
      explication: "2 + 2 = 4",
      difficulte: "easy",
    },
    {
      code_question: "Q002",
      categorie: "Mathematiques",
      niveau: "Licence 1",
      type_question: "vrai_faux",
      question: "Pi est un nombre rationnel",
      choix_A: "Vrai",
      choix_B: "Faux",
      choix_C: "",
      choix_D: "",
      bonne_reponse: "B",
      explication: "Pi est irrationnel",
      difficulte: "medium",
    },
    {
      code_question: "Q003",
      categorie: "Informatique",
      niveau: "Licence 2",
      type_question: "qcm_multiple",
      question: "Quels sont des langages de programmation ?",
      choix_A: "Python",
      choix_B: "HTML",
      choix_C: "Java",
      choix_D: "CSS",
      bonne_reponse: "A,C",
      explication: "Python et Java sont des langages de programmation",
      difficulte: "medium",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Questions");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=modele_import_questions.xlsx",
    },
  });
}
