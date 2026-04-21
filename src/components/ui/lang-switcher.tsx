"use client";

import { useI18n } from "@/lib/i18n/context";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

interface LangSwitcherProps {
  className?: string;
}

export function LangSwitcher({ className }: LangSwitcherProps) {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        "text-brand-green/60 hover:bg-brand-cream hover:text-brand-green",
        className
      )}
      aria-label={locale === "fr" ? "Switch to English" : "Passer en francais"}
    >
      <Languages className="w-4 h-4" />
      {locale === "fr" ? "EN" : "FR"}
    </button>
  );
}
