"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { LangSwitcher } from "@/components/ui/lang-switcher";
import { useI18n } from "@/lib/i18n/context";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: NavItem[];
  title: string;
}

export function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin" || href === "/dashboard" || href === "/instructor/exams") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  const navContent = (
    <>
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">{title}</Link>
        <p className="text-xs text-brand-mint/60 mt-0.5">Ashane & Junia Consulting</p>
      </div>

      <nav className="flex-1 p-4 space-y-1" aria-label="Navigation principale">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-brand-orange text-white shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        {session?.user && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
            <p className="text-xs text-white/50 truncate">{session.user.email}</p>
          </div>
        )}
        <LangSwitcher className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10" />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {t("logout")}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-brand-green rounded-lg border border-brand-green shadow-md text-white hover:bg-[#153728]"
        aria-label={t("openMenu")}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-brand-green min-h-screen flex flex-col shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-white/50 hover:text-white"
              aria-label={t("closeMenu")}
            >
              <X className="w-5 h-5" />
            </button>
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-brand-green min-h-screen flex-col shrink-0">
        {navContent}
      </aside>
    </>
  );
}
