"use client";

import Link from "next/link";
import { Timer, Save, ShieldCheck, ArrowRight, Award, BookOpen, Users, Phone, Mail, MapPin } from "lucide-react";
import { LangSwitcher } from "@/components/ui/lang-switcher";
import { useI18n } from "@/lib/i18n/context";
import { CERTIFICATIONS } from "@/lib/certifications";

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-brand-green/10 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-green tracking-tight">AJC Professional Simulator</h1>
            <p className="text-[10px] text-brand-orange font-medium tracking-wider uppercase">Ashane & Junia Consulting</p>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-brand-green hover:text-brand-orange transition-colors"
            >
              {t("login")}
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium bg-brand-orange text-white rounded-xl hover:bg-[#C96A24] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {t("register")}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <div className="relative overflow-hidden">
          {/* Background with brand colors */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-light-mint via-white to-brand-cream" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-mint/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 pt-20 pb-16">
            <div className="inline-flex items-center gap-2 bg-brand-green text-white rounded-full px-4 py-1.5 text-sm font-medium mb-6 shadow-md">
              <Award className="w-4 h-4 text-brand-orange" />
              {t("securePlatform")}
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-green mb-6 leading-tight tracking-tight">
              {t("heroTitle")}
              <span className="text-brand-orange">{t("heroHighlight")}</span>
              {t("heroTitle2")}
            </h2>

            <p className="text-lg text-brand-green/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("heroSubtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-orange text-white rounded-xl font-semibold hover:bg-[#C96A24] text-base transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {t("heroCta")}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-brand-green text-brand-green rounded-xl font-semibold hover:bg-brand-green hover:text-white text-base transition-all duration-300"
              >
                {t("heroSecondary")}
              </Link>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-brand-green py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-center text-white/60 text-sm font-medium uppercase tracking-wider mb-8">Certifications disponibles</p>
            <div className="flex flex-wrap justify-center gap-3">
              {CERTIFICATIONS.map((cert) => (
                <div
                  key={cert.id}
                  className="px-4 py-2 bg-white/10 border border-white/10 rounded-full text-white text-sm font-medium hover:bg-brand-orange/20 hover:border-brand-orange/30 transition-all duration-200"
                >
                  {cert.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <h3 className="text-3xl font-bold text-brand-green text-center mb-12">
            Why Choose Us?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Timer, titleKey: "featureTimer" as const, descKey: "featureTimerDesc" as const },
              { icon: Save, titleKey: "featureSave" as const, descKey: "featureSaveDesc" as const },
              { icon: ShieldCheck, titleKey: "featureResume" as const, descKey: "featureResumeDesc" as const },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.titleKey}
                  className="group p-8 bg-white rounded-2xl border border-brand-green/10 hover:border-brand-orange/30 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand-light-mint flex items-center justify-center mb-5 transition-colors duration-300 group-hover:bg-brand-orange/10">
                    <Icon className="w-7 h-7 text-brand-green group-hover:text-brand-orange transition-colors" aria-hidden="true" />
                  </div>
                  <h4 className="font-bold text-brand-green text-lg mb-2">{t(feature.titleKey)}</h4>
                  <p className="text-sm text-brand-green/60 leading-relaxed">{t(feature.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-brand-cream py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { icon: Award, value: "8+", label: "Certifications" },
                { icon: BookOpen, value: "66+", label: "Questions" },
                { icon: Users, value: "PMI", label: "Aligned" },
                { icon: ShieldCheck, value: "100%", label: "Secure" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label}>
                    <Icon className="w-8 h-8 text-brand-orange mx-auto mb-3" />
                    <p className="text-3xl font-bold text-brand-green">{stat.value}</p>
                    <p className="text-sm text-brand-green/60">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-green text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-1">AJC Professional Simulator</h4>
              <p className="text-xs text-brand-mint/60 uppercase tracking-wider mb-3">Ashane & Junia Consulting</p>
              <p className="text-sm text-white/60">Your Growth Is Our Business</p>
            </div>
            <div>
              <h5 className="font-semibold mb-3 text-brand-orange">Contact</h5>
              <div className="space-y-2 text-sm text-white/70">
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +237 654 368 711</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> ajconsultingcmr@gmail.com</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Douala - Bonapriso</p>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-3 text-brand-orange">Certifications</h5>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATIONS.slice(0, 4).map((cert) => (
                  <span key={cert.id} className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-white/70">{cert.name}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/40">
            {t("footerText")} - Ashane & Junia Consulting
          </div>
        </div>
      </footer>
    </div>
  );
}
