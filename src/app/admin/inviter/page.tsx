"use client";

import { useCallback, useEffect, useState } from "react";
import { buttonClass, inputClass, useAdmin, type Profil } from "@/components/admin/AdminGate";
import { PaysOptions } from "@/components/admin/PaysOptions";
import { formatDate } from "@/lib/format";

type Admin = Profil & { email: string; invited_by: string | null; created_at: string };

export default function InviterAdmin() {
  const { supabase, email: moi } = useAdmin();
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Profil["role"]>("redacteur");
  const [pays, setPays] = useState("Guinée");
  const [message, setMessage] = useState("");

  const charger = useCallback(async () => {
    const { data } = await supabase.from("admins").select("*").order("created_at");
    setAdmins((data as Admin[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    supabase
      .from("admins")
      .select("*")
      .order("created_at")
      .then(({ data }) => setAdmins((data as Admin[]) ?? []));
  }, [supabase]);

  async function inviter(e: React.FormEvent) {
    e.preventDefault();
    const adresse = email.trim().toLowerCase();
    const { error } = await supabase.from("admins").insert({
      email: adresse,
      invited_by: moi,
      role,
      pays: role === "redacteur" ? pays.trim() : null,
    });
    if (error) {
      setMessage(error.code === "23505" ? "Cette adresse est déjà dans la liste." : error.message);
      return;
    }
    setEmail("");
    setMessage(
      `${adresse} est ajouté comme ${role === "super" ? "super admin" : `rédacteur (${pays})`}. ` +
        `Il suffit de se connecter sur ${window.location.origin}/admin avec cette adresse.`,
    );
    charger();
  }

  async function modifier(a: Admin, changes: Partial<Profil>) {
    const { error } = await supabase.from("admins").update(changes).eq("email", a.email);
    if (error) alert(error.message);
    else charger();
  }

  async function retirer(a: Admin) {
    if (!confirm(`Retirer les droits de ${a.email} ?`)) return;
    const { error } = await supabase.from("admins").delete().eq("email", a.email);
    if (error) alert(error.message);
    else charger();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl font-black">Administrateurs</h1>
      <p className="mt-1 text-muted">
        Un <strong>rédacteur</strong> ajoute, modifie et supprime uniquement les articles de son pays. Le{" "}
        <strong>super admin</strong> gère tout : articles de tous les pays, « à la une », vidéos, administrateurs.
      </p>

      <form onSubmit={inviter} className="mt-6 grid gap-3 rounded-lg bg-paper p-5 shadow-sm sm:grid-cols-[2fr_1fr_1fr_auto]">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="adresse@exemple.com"
          className={inputClass}
        />
        <select value={role} onChange={(e) => setRole(e.target.value as Profil["role"])} className={inputClass}>
          <option value="redacteur">Rédacteur</option>
          <option value="super">Super admin</option>
        </select>
        {role === "super" ? (
          <input value="Tous les pays" disabled className={inputClass} />
        ) : (
          <select value={pays} onChange={(e) => setPays(e.target.value)} className={inputClass}>
            <PaysOptions actuel={pays} />
          </select>
        )}
        <button className={`${buttonClass} whitespace-nowrap`}>Ajouter</button>
      </form>
      {message && <p className="mt-3 rounded bg-leaf/10 p-3 text-sm text-leaf">{message}</p>}

      <ul className="mt-6 divide-y divide-line rounded-lg bg-paper shadow-sm">
        {(admins ?? []).map((a) => {
          const estMoi = a.email === moi.toLowerCase();
          return (
            <li key={a.email} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">
                  {a.email} {estMoi && <span className="text-xs text-muted">(vous)</span>}
                </p>
                <p className="text-xs text-muted">
                  Ajouté le {formatDate(a.created_at)}
                  {a.invited_by && <> par {a.invited_by}</>}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <select
                  value={a.role}
                  disabled={estMoi}
                  onChange={(e) => modifier(a, { role: e.target.value as Profil["role"] })}
                  className="rounded border border-line px-2 py-1"
                >
                  <option value="redacteur">Rédacteur</option>
                  <option value="super">Super admin</option>
                </select>
                {a.role === "redacteur" && (
                  <select
                    value={a.pays ?? ""}
                    onChange={(e) => modifier(a, { pays: e.target.value })}
                    className="w-40 rounded border border-line px-2 py-1"
                  >
                    <PaysOptions actuel={a.pays} />
                  </select>
                )}
                {!estMoi && (
                  <button onClick={() => retirer(a)} className="text-brand hover:underline">
                    Retirer
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
