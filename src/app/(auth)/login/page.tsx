"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle, Award, BookOpen, ShieldCheck } from "lucide-react";
import { LangSwitcher } from "@/components/ui/lang-switcher";
import { useI18n } from "@/lib/i18n/context";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { setError(t("loginError")); setLoading(false); }
      else { router.push("/dashboard"); router.refresh(); }
    } catch { setError(t("loginServerError")); setLoading(false); }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-light-mint via-brand-mint/20 to-white" />

        {/* Decorative elements */}
        <div className="absolute top-16 right-16 w-48 h-48 border-[3px] border-brand-green/8 rounded-full" />
        <div className="absolute top-28 right-28 w-28 h-28 border-[3px] border-brand-orange/15 rounded-full" />
        <div className="absolute bottom-32 left-8 w-40 h-40 bg-brand-mint/25 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-brand-orange/10 rounded-2xl rotate-12" />

        <div className="relative z-10 flex flex-col p-10 w-full">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Image
              src="/ajc-logo.jpg"
              alt="Ashane & Junia Consulting"
              width={70}
              height={70}
              className="rounded-2xl shadow-lg"
              priority
            />
            <div>
              <h1 className="text-lg font-bold text-brand-green tracking-tight leading-tight">
                AJC Professional<br />Simulator
              </h1>
              <p className="text-[9px] text-brand-orange font-semibold uppercase tracking-[0.25em] mt-0.5">
                Ashane & Junia Consulting
              </p>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 flex items-center mt-4">
            <div className="flex items-end w-full">
              {/* Text */}
              <div className="flex-1 pb-20 pr-4">
                <h2 className="text-[3.2rem] font-bold text-brand-green leading-[1.05] mb-1">
                  Elevate Your
                </h2>
                <h2 className="text-[4rem] font-black text-brand-green leading-[1.05] mb-2">
                  Business
                </h2>
                <p className="text-xl text-brand-green/60 italic mb-10">
                  with A&J Consulting
                </p>

                <div className="space-y-3">
                  {[
                    "Professional Strategies",
                    "Experts Consulting",
                    "Tailored Training",
                    "Projects Implementation",
                  ].map((text) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-orange shrink-0" />
                      <p className="font-semibold text-brand-green/80">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image - larger */}
              <div className="relative w-[420px] shrink-0 -mr-10 -mb-10">
                <Image
                  src="/ajc-consultant.png"
                  alt="AJC Consultant"
                  width={500}
                  height={650}
                  className="object-contain drop-shadow-[0_20px_40px_rgba(27,67,50,0.25)]"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Bottom features */}
          <div className="flex gap-5 pt-2">
            {[
              { icon: Award, text: "8+ Certifications" },
              { icon: BookOpen, text: "PMI Aligned" },
              { icon: ShieldCheck, text: "Proven Results" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-green flex items-center justify-center shadow-md">
                    <Icon className="w-4 h-4 text-brand-orange" />
                  </div>
                  <span className="text-xs font-bold text-brand-green">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-6 py-12 bg-white relative">
        <div className="absolute top-4 right-4">
          <LangSwitcher />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/ajc-logo.jpg"
              alt="Ashane & Junia Consulting"
              width={80}
              height={80}
              className="rounded-2xl shadow-lg mx-auto mb-3"
            />
            <Link href="/" className="text-2xl font-bold text-brand-green tracking-tight">
              AJC Professional Simulator
            </Link>
            <p className="text-xs text-brand-orange font-medium uppercase tracking-wider mt-1">
              Ashane & Junia Consulting
            </p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-brand-green">{t("loginTitle")}</h1>
            <p className="text-brand-green/50 mt-1 text-sm">Accedez a votre espace de simulation</p>
          </div>

          {/* Google */}
          <button
            onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl: "/dashboard" }); }}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-brand-green/15 rounded-xl text-sm font-medium text-brand-green hover:bg-brand-cream hover:border-brand-green/25 transition-all duration-200 disabled:opacity-50"
          >
            {googleLoading ? (
              <svg className="animate-spin h-5 w-5 text-brand-green/40" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : <GoogleIcon />}
            {t("continueWithGoogle")}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-green/10" /></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-3 text-brand-green/40">{t("or")}</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {registered && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700" role="alert">
                <CheckCircle className="w-4 h-4 shrink-0" /> {t("registerSuccess")}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <Input id="email" label={t("email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" autoComplete="email" required />

            <div className="relative">
              <Input id="password" label={t("password")} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("passwordPlaceholder")} autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[34px] text-brand-green/40 hover:text-brand-green transition-colors" aria-label={showPassword ? t("hidePassword") : t("showPassword")}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full bg-brand-orange hover:bg-[#C96A24] focus:ring-brand-orange" size="lg">
              <LogIn className="w-4 h-4" /> {t("loginButton")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-green/50">
            {t("noAccount")}{" "}
            <Link href="/register" className="text-brand-orange hover:text-[#C96A24] font-medium transition-colors">{t("register")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
