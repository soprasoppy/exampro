"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCertification } from "@/lib/certifications";
import { Award, Calendar, Loader2, Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface Certificate {
  id: string;
  score: number;
  submittedAt: string;
  exam: {
    title: string;
    certification: string | null;
    passingScore: number;
  };
}

export default function CertificatesPage() {
  const { t } = useI18n();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => r.json())
      .then(setCertificates)
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
    <div className="lg:pl-0 pl-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("myCertificates")}</h1>
      <p className="text-sm text-gray-500 mb-6">{t("certificatesSubtitle")}</p>

      {certificates.length === 0 ? (
        <div className="text-center py-16">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t("noCertificate")}</p>
          <p className="text-sm text-gray-400 mt-1">{t("noCertificateDesc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {certificates.map((cert) => {
            const certInfo = getCertification(cert.exam.certification);
            const passed = cert.score >= cert.exam.passingScore;

            return (
              <Card key={cert.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Certificate header with color band */}
                <div className={`h-2 ${certInfo ? certInfo.color.split(" ")[0] : "bg-blue-100"}`} />
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-amber-500" />
                  </div>

                  {certInfo && (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mb-3 ${certInfo.color}`}>
                      {certInfo.name}
                    </span>
                  )}

                  <h3 className="font-bold text-gray-900 text-lg mb-2">{cert.exam.title}</h3>

                  {certInfo && (
                    <p className="text-xs text-gray-500 mb-4">{certInfo.fullName}</p>
                  )}

                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{Math.round(cert.score)}%</p>
                      <p className="text-xs text-gray-500">{t("score")}</p>
                    </div>
                  </div>

                  <Badge variant={passed ? "success" : "danger"} className="mb-3">
                    {passed ? t("passed") : t("failed")}
                  </Badge>

                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-3">
                    <Calendar className="w-3 h-3" />
                    {new Date(cert.submittedAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
