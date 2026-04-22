"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { SessionProvider } from "next-auth/react";
import { ClipboardList, Award, UserCircle, BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  const candidateNav = [
    { label: t("myExams"), href: "/dashboard", icon: ClipboardList },
    { label: t("examCatalog"), href: "/dashboard/catalog", icon: BookOpen },
    { label: t("myCertificates"), href: "/dashboard/certificates", icon: Award },
    { label: t("myProfile"), href: "/dashboard/profile", icon: UserCircle },
  ];

  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar items={candidateNav} title="AJC Simulator" />
        <main className="flex-1 p-8 bg-background">{children}</main>
      </div>
    </SessionProvider>
  );
}
