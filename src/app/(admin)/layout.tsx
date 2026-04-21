"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { SessionProvider } from "next-auth/react";
import { LayoutDashboard, Users, FileText, Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  const adminNav = [
    { label: t("dashboard"), href: "/admin", icon: LayoutDashboard },
    { label: t("users"), href: "/admin/users", icon: Users },
    { label: t("exams"), href: "/admin/exams", icon: FileText },
    { label: t("results"), href: "/admin/results", icon: Trophy },
  ];

  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar items={adminNav} title="AJC Admin" />
        <main className="flex-1 p-8 bg-background">{children}</main>
      </div>
    </SessionProvider>
  );
}
