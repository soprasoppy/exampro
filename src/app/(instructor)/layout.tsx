"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { SessionProvider } from "next-auth/react";
import { LayoutDashboard, FileText, HelpCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  const instructorNav = [
    { label: t("dashboard"), href: "/instructor/dashboard", icon: LayoutDashboard },
    { label: t("exams"), href: "/instructor/exams", icon: FileText },
    { label: "Banque de questions", href: "/instructor/questions", icon: HelpCircle },
  ];

  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar items={instructorNav} title="AJC Instructeur" />
        <main className="flex-1 p-8 bg-background">{children}</main>
      </div>
    </SessionProvider>
  );
}
