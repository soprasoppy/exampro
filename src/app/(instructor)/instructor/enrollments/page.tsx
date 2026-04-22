"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, UserCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface Enrollment {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  exam: { id: string; title: string; certification: string | null };
}

export default function InstructorEnrollmentsPage() {
  const { t } = useI18n();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/instructor/enrollments")
      .then((r) => r.json())
      .then(setEnrollments)
      .finally(() => setLoading(false));
  }, []);

  async function handleUpdate(id: string, status: "APPROVED" | "REJECTED") {
    setUpdating(id);
    try {
      const res = await fetch(`/api/enrollments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setEnrollments((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status } : e))
        );
      }
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand-green animate-spin" />
      </div>
    );
  }

  const pending = enrollments.filter((e) => e.status === "PENDING");
  const processed = enrollments.filter((e) => e.status !== "PENDING");

  return (
    <div className="lg:pl-0 pl-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("enrollmentRequests")}</h1>
      <p className="text-sm text-gray-500 mb-6">{t("enrollmentRequestsSubtitle")}</p>

      {/* Demandes en attente */}
      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            {t("pendingRequests")} ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {enrollment.user.firstName} {enrollment.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{enrollment.user.email}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {t("requestsExam")}: <span className="font-medium">{enrollment.exam.title}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(enrollment.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleUpdate(enrollment.id, "APPROVED")}
                      loading={updating === enrollment.id}
                    >
                      <Check className="w-4 h-4 mr-1" /> {t("approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleUpdate(enrollment.id, "REJECTED")}
                      loading={updating === enrollment.id}
                    >
                      <X className="w-4 h-4 mr-1" /> {t("reject")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Demandes traitees */}
      {processed.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("processedRequests")}</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t("candidate")}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t("exams")}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {processed.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {enrollment.user.firstName} {enrollment.user.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm">{enrollment.exam.title}</td>
                      <td className="px-4 py-3">
                        <Badge variant={enrollment.status === "APPROVED" ? "success" : "danger"}>
                          {enrollment.status === "APPROVED" ? t("approved") : t("rejected")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}

      {enrollments.length === 0 && (
        <div className="text-center py-16">
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t("noEnrollmentRequest")}</p>
        </div>
      )}
    </div>
  );
}
