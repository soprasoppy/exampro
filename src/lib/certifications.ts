export const CERTIFICATIONS = [
  {
    id: "PMP",
    name: "PMP",
    fullName: "Project Management Professional",
    color: "bg-blue-100 text-blue-800",
    icon: "blue",
  },
  {
    id: "CAPM",
    name: "CAPM",
    fullName: "Certified Associate in Project Management",
    color: "bg-indigo-100 text-indigo-800",
    icon: "indigo",
  },
  {
    id: "PgMP",
    name: "PgMP",
    fullName: "Program Management Professional",
    color: "bg-purple-100 text-purple-800",
    icon: "purple",
  },
  {
    id: "RISK",
    name: "RISK",
    fullName: "Risk Management Professional",
    color: "bg-red-100 text-red-800",
    icon: "red",
  },
  {
    id: "AUDIT",
    name: "Audit & Control",
    fullName: "Audit et Control",
    color: "bg-orange-100 text-orange-800",
    icon: "orange",
  },
  {
    id: "GOOGLE",
    name: "Google Projects",
    fullName: "Google Projects Certification",
    color: "bg-green-100 text-green-800",
    icon: "green",
  },
  {
    id: "ITIL",
    name: "ITIL",
    fullName: "Information Technology Infrastructure Library",
    color: "bg-teal-100 text-teal-800",
    icon: "teal",
  },
  {
    id: "SCRUM",
    name: "SCRUM",
    fullName: "Scrum Master / Scrum Framework",
    color: "bg-cyan-100 text-cyan-800",
    icon: "cyan",
  },
] as const;

export type CertificationId = typeof CERTIFICATIONS[number]["id"];

export function getCertification(id: string | null | undefined) {
  return CERTIFICATIONS.find((c) => c.id === id) || null;
}
