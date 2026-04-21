"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCertification } from "@/lib/certifications";
import { useI18n } from "@/lib/i18n/context";
import { Loader2, MessageSquare, FileQuestion, Eye } from "lucide-react";

interface Exam {
  id: string;
  title: string;
  certification: string | null;
  category: string | null;
  level: string | null;
  duration: number;
  numberOfQuestions: number;
  published: boolean;
  status: string;
  _count: { questions: number; sessions: number; comments: number };
  createdBy: { firstName: string; lastName: string };
}

export default function InstructorExamsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/instructor/exams")
      .then((r) => r.json())
      .then(setExams)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("exams")}</h1>
      <p className="text-sm text-gray-500 mb-6">{t("instructorExamsSubtitle")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {exams.map((exam) => {
          const cert = getCertification(exam.certification);
          return (
            <Card key={exam.id} className="hover:shadow-md transition-all overflow-hidden">
              {cert && <div className={`h-1.5 ${cert.color.split(" ")[0]}`} />}
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    {cert && (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mb-2 ${cert.color}`}>
                        {cert.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t("createdBy")} {exam.createdBy.firstName} {exam.createdBy.lastName}
                    </p>
                  </div>
                  <Badge variant={exam.status === "READY" ? "success" : "warning"}>
                    {exam.status === "READY" ? "Pret" : "En attente"}
                  </Badge>
                </div>

                <div className="flex gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <FileQuestion className="w-4 h-4" />
                    {exam._count.questions} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {exam._count.comments} {t("comments").toLowerCase()}
                  </span>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/instructor/exams/${exam.id}`)}
                >
                  <Eye className="w-4 h-4" /> {t("viewAndComment")}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {exams.length === 0 && (
        <div className="text-center py-16">
          <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t("noExamCreated")}</p>
        </div>
      )}
    </div>
  );
}
