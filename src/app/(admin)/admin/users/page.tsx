"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  createdAt: string;
  _count: { sessions: number };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "CANDIDATE" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const res = await fetch("/api/users");
    setUsers(await res.json());
    setLoading(false);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setForm({ firstName: "", lastName: "", email: "", password: "", role: "CANDIDATE" });
    setSaving(false);
    loadUsers();
  }

  async function toggleActive(user: User) {
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    loadUsers();
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetUser || newPassword.length < 6) return;
    setResetting(true);
    const res = await fetch(`/api/users/${resetUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setResetting(false);
    if (res.ok) {
      setResetSuccess(true);
      setTimeout(() => {
        setResetUser(null);
        setNewPassword("");
        setResetSuccess(false);
      }, 2000);
    }
  }

  const filtered = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Chargement...</p></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <Button onClick={() => setShowModal(true)}>+ Nouvel utilisateur</Button>
      </div>

      <div className="mb-4">
        <Input placeholder="Rechercher un utilisateur..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Nom</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Examens</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-sm font-medium">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3"><Badge variant={user.role === "ADMIN" ? "info" : "default"}>{user.role}</Badge></td>
                <td className="px-4 py-3"><Badge variant={user.active ? "success" : "danger"}>{user.active ? "Actif" : "Inactif"}</Badge></td>
                <td className="px-4 py-3 text-sm">{user._count.sessions}</td>
                <td className="px-4 py-3 flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(user)}>
                    {user.active ? "Desactiver" : "Activer"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setResetUser(user); setNewPassword(""); setResetSuccess(false); }}>
                    Reinit. MDP
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!resetUser} onClose={() => setResetUser(null)} title="Reinitialiser le mot de passe">
        {resetUser && (
          <form onSubmit={resetPassword} className="space-y-4">
            <p className="text-sm text-gray-600">
              Nouveau mot de passe pour <span className="font-medium">{resetUser.firstName} {resetUser.lastName}</span> ({resetUser.email})
            </p>
            <Input
              id="newpwd"
              label="Nouveau mot de passe"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 caracteres"
              required
            />
            {resetSuccess && (
              <p className="text-sm text-emerald-600 font-medium">Mot de passe reinitialise avec succes !</p>
            )}
            <Button type="submit" loading={resetting} disabled={newPassword.length < 6} className="w-full">
              Reinitialiser
            </Button>
          </form>
        )}
      </Modal>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouvel utilisateur">
        <form onSubmit={createUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input id="fn" label="Prenom" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <Input id="ln" label="Nom" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <Input id="em" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input id="pw" label="Mot de passe" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="CANDIDATE">Candidat</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
          <Button type="submit" loading={saving} className="w-full">Creer</Button>
        </form>
      </Modal>
    </div>
  );
}
