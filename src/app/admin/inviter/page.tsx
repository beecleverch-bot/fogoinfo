"use client";

import { useCallback, useEffect, useState } from "react";
import { buttonClass, inputClass, useAdmin, type Profil } from "@/components/admin/AdminGate";
import { PaysOptions } from "@/components/admin/PaysOptions";
import { formatDate } from "@/lib/format";

type Admin = Profil & { email: string; invited_by: string | null; created_at: string };

export default function InviterAdmin() {
  const { supabase, email: moi, isSuper } = useAdmin();
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
      setMessage(
        error.code === "23505"
          ? "Cette adresse est déjà dans la liste."
          : error.code === "42501"
            ? "Vous ne pouvez ajouter que des rédacteurs."
            : error.message,
      );
      return;
    }
    setEmail("");
    setMessage(
      `${adresse} est ajouté comme ${role === "admin" ? "admin" : `rédacteur (${pays})`}. ` +
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
      <ul className="mt-2 space-y-1 text-sm text-muted">
        <li>
          <strong>Super admin</strong> (vous seul) : gère tout, y compris les admins et le site.
        </li>
        <li>
          <strong>Admin</strong> : gère les articles de tous les pays, la une, les vidéos, et ajoute ou retire des
          rédacteurs. Ne peut pas toucher aux admins.
        </li>
        <li>
          <strong>Rédacteur</strong> : ajoute, modifie et supprime uniquement les articles de son pays.
        </li>
      </ul>

      <form onSubmit={inviter} className="mt-6 grid gap-3 rounded-lg bg-paper p-5 shadow-sm sm:grid-cols-[2fr_1fr_1fr_auto]">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="adresse@exemple.com"
          className={inputClass}
        />
        <select
          value={role}
          disabled={!isSuper}
          onChange={(e) => setRole(e.target.value as Profil["role"])}
          className={inputClass}
        >
          <option value="redacteur">Rédacteur</option>
          {isSuper && <option value="admin">Admin</option>}
        </select>
        {role !== "redacteur" ? (
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
          // Un admin ne gère que les rédacteurs ; personne ne touche au super admin.
          const modifiable = !estMoi && a.role !== "super" && (isSuper || a.role === "redacteur");
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
                {isSuper && modifiable ? (
                  <select
                    value={a.role}
                    onChange={(e) =>
                      modifier(a, {
                        role: e.target.value as Profil["role"],
                        pays: e.target.value === "redacteur" ? (a.pays ?? "Guinée") : null,
                      })
                    }
                    className="rounded border border-line px-2 py-1"
                  >
                    <option value="redacteur">Rédacteur</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className="rounded bg-soft px-2 py-1">
                    {a.role === "super" ? "Super admin" : a.role === "admin" ? "Admin" : "Rédacteur"}
                  </span>
                )}
                {a.role === "redacteur" && (
                  <select
                    disabled={!modifiable}
                    value={a.pays ?? ""}
                    onChange={(e) => modifier(a, { pays: e.target.value })}
                    className="w-40 rounded border border-line px-2 py-1"
                  >
                    <PaysOptions actuel={a.pays} />
                  </select>
                )}
                {modifiable && (
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
