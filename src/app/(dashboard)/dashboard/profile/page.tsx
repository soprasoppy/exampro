"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Shield, Calendar, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string | null;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulaire infos
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Formulaire mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: Profile) => {
        setProfile(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile((prev) => prev ? { ...prev, ...updated } : prev);
        setInfoMessage({ type: "success", text: t("profileUpdated") });
        await updateSession({ name: `${firstName} ${lastName}` });
      } else {
        const err = await res.json();
        setInfoMessage({ type: "error", text: err.error });
      }
    } catch {
      setInfoMessage({ type: "error", text: t("loginServerError") });
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMessage(null);

    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: "error", text: t("passwordMismatch") });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMessage({ type: "error", text: t("passwordTooShort") });
      return;
    }

    setSavingPwd(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPwdMessage({ type: "success", text: t("passwordChanged") });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const err = await res.json();
        setPwdMessage({ type: "error", text: err.error });
      }
    } catch {
      setPwdMessage({ type: "error", text: t("loginServerError") });
    } finally {
      setSavingPwd(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand-green animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const isGoogleAccount = !profile.image ? false : true;

  return (
    <div className="lg:pl-0 pl-12 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("myProfile")}</h1>
      <p className="text-sm text-gray-500 mb-6">{t("profileSubtitle")}</p>

      {/* Infos du compte */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            {t("accountInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Infos non-editables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">{t("email")}</p>
                <p className="text-sm font-medium">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">{t("role")}</p>
                <Badge variant={profile.role === "ADMIN" ? "danger" : profile.role === "INSTRUCTOR" ? "warning" : "info"}>
                  {profile.role === "ADMIN" ? "Administrateur" : profile.role === "INSTRUCTOR" ? "Instructeur" : "Candidat"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">{t("memberSince")}</p>
                <p className="text-sm font-medium">
                  {new Date(profile.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire modification */}
          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="firstName"
                label={t("firstName")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                id="lastName"
                label={t("lastName")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            {infoMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                infoMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}>
                {infoMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {infoMessage.text}
              </div>
            )}

            <Button type="submit" loading={savingInfo} disabled={firstName === profile.firstName && lastName === profile.lastName}>
              {t("save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Changement de mot de passe */}
      {!isGoogleAccount && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t("changePassword")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative">
                <Input
                  id="currentPassword"
                  label={t("currentPassword")}
                  type={showCurrentPwd ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    id="newPassword"
                    label={t("newPassword")}
                    type={showNewPwd ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("passwordMin")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                  >
                    {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Input
                  id="confirmPassword"
                  label={t("confirmPassword")}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirmPasswordPlaceholder")}
                  required
                />
              </div>

              {pwdMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                  pwdMessage.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                    : "bg-red-50 border border-red-200 text-red-600"
                }`}>
                  {pwdMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {pwdMessage.text}
                </div>
              )}

              <Button type="submit" loading={savingPwd}>
                {t("changePassword")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
