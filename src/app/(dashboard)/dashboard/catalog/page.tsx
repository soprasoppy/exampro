"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Clock, FileQuestion, Check, X, HourglassIcon, Search, Filter } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { getCertification, CERTIFICATIONS } from "@/lib/certifications";
import { formatDuration } from "@/lib/utils";

interface Exam {
  id: string;
  title: string;
  description: string;
  certification: string | null;
  category: string;
  level: string;
  duration: number;
  numberOfQuestions: number;
}

interface Enrollment {
  id: string;
  examId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function CatalogPage() {
  const { t } = useI18n();
  const [exams, setExams] = useState<Exam[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);

  // Filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCert, setSelectedCert] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/exams").then((r) => r.json()),
      fetch("/api/enrollments").then((r) => r.ok ? r.json() : []),
    ])
      .then(([allExams, userEnrollments]) => {
        setExams(Array.isArray(allExams) ? allExams : []);
        setEnrollments(Array.isArray(userEnrollments) ? userEnrollments : []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Niveaux uniques
  const levels = useMemo(() => {
    const set = new Set(exams.map((e) => e.level).filter(Boolean));
    return Array.from(set);
  }, [exams]);

  // Certifications presentes
  const availableCerts = useMemo(() => {
    const set = new Set(exams.map((e) => e.certification).filter(Boolean));
    return CERTIFICATIONS.filter((c) => set.has(c.id));
  }, [exams]);

  // Filtrage
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchSearch =
        !searchQuery ||
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exam.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exam.category || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchCert = !selectedCert || exam.certification === selectedCert;
      const matchLevel = !selectedLevel || exam.level === selectedLevel;

      return matchSearch && matchCert && matchLevel;
    });
  }, [exams, searchQuery, selectedCert, selectedLevel]);

  function getEnrollmentStatus(examId: string) {
    const enrollment = enrollments.find((e) => e.examId === examId);
    return enrollment?.status || null;
  }

  async function requestExam(examId: string) {
    setRequesting(examId);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });

      if (res.ok) {
        const enrollment = await res.json();
        setEnrollments((prev) => [...prev, enrollment]);
      }
    } finally {
      setRequesting(null);
    }
  }

  const activeFilters = (selectedCert ? 1 : 0) + (selectedLevel ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="lg:pl-0 pl-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("examCatalog")}</h1>
      <p className="text-sm text-gray-500 mb-6">{t("examCatalogSubtitle")}</p>

      {/* Barre de recherche + bouton filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search")}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            showFilters || activeFilters > 0
              ? "bg-brand-green text-white border-brand-green"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          {t("filters")}
          {activeFilters > 0 && (
            <span className="bg-white/20 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Panneau filtres */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filtre certification */}
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Certification</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCert("")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !selectedCert ? "bg-brand-green text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t("all")}
                </button>
                {availableCerts.map((cert) => (
                  <button
                    key={cert.id}
                    onClick={() => setSelectedCert(selectedCert === cert.id ? "" : cert.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCert === cert.id ? cert.color : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cert.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre niveau */}
            <div className="sm:w-48">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">{t("level")}</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
              >
                <option value="">{t("all")}</option>
                {levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {activeFilters > 0 && (
            <button
              onClick={() => { setSelectedCert(""); setSelectedLevel(""); }}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              {t("clearFilters")}
            </button>
          )}
        </div>
      )}

      {/* Resultats */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredExams.length} {filteredExams.length > 1 ? "examens" : "examen"}
        {searchQuery && ` pour "${searchQuery}"`}
      </p>

      {filteredExams.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {searchQuery || activeFilters > 0 ? t("noSearchResult") : t("noExamAvailable")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredExams.map((exam) => {
            const cert = getCertification(exam.certification);
            const status = getEnrollmentStatus(exam.id);

            return (
              <Card key={exam.id} className="hover:shadow-md overflow-hidden">
                {cert && <div className={`h-1.5 ${cert.color.split(" ")[0]}`} />}
                <CardHeader className="pb-2">
                  <div>
                    {cert && (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mb-2 ${cert.color}`}>
                        {cert.name}
                      </span>
                    )}
                    <CardTitle className="text-sm sm:text-base leading-tight">{exam.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {exam.description && (
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{exam.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {exam.category && <Badge>{exam.category}</Badge>}
                    {exam.level && <Badge variant="info">{exam.level}</Badge>}
                    <Badge variant="default">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatDuration(exam.duration)}
                    </Badge>
                    <Badge variant="default">
                      <FileQuestion className="w-3 h-3 inline mr-1" />
                      {exam.numberOfQuestions}q
                    </Badge>
                  </div>

                  {status === "APPROVED" ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                      <Check className="w-4 h-4" /> {t("enrollmentApproved")}
                    </div>
                  ) : status === "PENDING" ? (
                    <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                      <HourglassIcon className="w-4 h-4" /> {t("enrollmentPending")}
                    </div>
                  ) : status === "REJECTED" ? (
                    <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                      <X className="w-4 h-4" /> {t("enrollmentRejected")}
                    </div>
                  ) : (
                    <Button
                      onClick={() => requestExam(exam.id)}
                      loading={requesting === exam.id}
                      className="w-full"
                      size="sm"
                    >
                      {t("requestExam")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
