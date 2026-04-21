"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, UserPlus, AlertCircle } from "lucide-react";
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

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError(t("passwordMismatch")); return; }
    if (form.password.length < 6) { setError(t("passwordTooShort")); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur"); setLoading(false); return; }
      router.push("/login?registered=true");
    } catch { setError(t("loginServerError")); setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-light-mint via-white to-brand-cream">
      <div className="absolute top-4 right-4"><LangSwitcher /></div>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-brand-green tracking-tight">AJC Professional Simulator</Link>
          <p className="text-xs text-brand-orange font-medium uppercase tracking-wider mt-1">Ashane & Junia Consulting</p>
          <p className="mt-3 text-brand-green/60">{t("registerTitle")}</p>
        </div>

        <div className="bg-white rounded-2xl border border-brand-green/10 shadow-xl p-8">
          <button onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl: "/dashboard" }); }} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-brand-green/20 rounded-xl text-sm font-medium text-brand-green hover:bg-brand-cream hover:border-brand-green/30 transition-all duration-200 disabled:opacity-50">
            {googleLoading ? <svg className="animate-spin h-5 w-5 text-brand-green/40" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <GoogleIcon />}
            {t("continueWithGoogle")}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-green/10" /></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-3 text-brand-green/40">{t("or")}</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600" role="alert"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}

            <div className="grid grid-cols-2 gap-3">
              <Input id="firstName" label={t("firstName")} value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} autoComplete="given-name" required />
              <Input id="lastName" label={t("lastName")} value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} autoComplete="family-name" required />
            </div>
            <Input id="email" label={t("email")} type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="votre@email.com" autoComplete="email" required />
            <div className="relative">
              <Input id="password" label={t("password")} type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => updateField("password", e.target.value)} placeholder={t("passwordMin")} autoComplete="new-password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[34px] text-brand-green/40 hover:text-brand-green transition-colors" aria-label={showPassword ? t("hidePassword") : t("showPassword")}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input id="confirmPassword" label={t("confirmPassword")} type="password" value={form.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} placeholder={t("confirmPasswordPlaceholder")} autoComplete="new-password" required />

            <Button type="submit" loading={loading} className="w-full bg-brand-orange hover:bg-[#C96A24] focus:ring-brand-orange" size="lg">
              <UserPlus className="w-4 h-4" /> {t("registerButton")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-green/50">
            {t("hasAccount")}{" "}
            <Link href="/login" className="text-brand-orange hover:text-[#C96A24] font-medium transition-colors">{t("loginButton")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
