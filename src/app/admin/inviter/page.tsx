"use client";

import { useEffect, useState } from "react";
import { buttonClass, inputClass, useAdmin } from "@/components/admin/AdminGate";
import { formatDate } from "@/lib/format";

type Admin = { email: string; invited_by: string | null; created_at: string };

export default function InviterAdmin() {
  const { supabase, email: moi } = useAdmin();
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function charger() {
    const { data } = await supabase.from("admins").select("*").order("created_at");
    setAdmins((data as Admin[]) ?? []);
  }

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
    const { error } = await supabase.from("admins").insert({ email: adresse, invited_by: moi });
    if (error) {
      setMessage(error.code === "23505" ? "Cette adresse est déjà administrateur." : error.message);
      return;
    }
    setEmail("");
    setMessage(
      `${adresse} est maintenant administrateur. Il suffit de se connecter sur ${window.location.origin}/admin avec cette adresse.`,
    );
    charger();
  }

  async function retirer(a: Admin) {
    if (!confirm(`Retirer les droits de ${a.email} ?`)) return;
    const { error } = await supabase.from("admins").delete().eq("email", a.email);
    if (error) alert(error.message);
    else charger();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl font-black">Administrateurs</h1>
      <p className="mt-1 text-muted">Les administrateurs peuvent publier, modifier et supprimer les articles et vidéos.</p>

      <form onSubmit={inviter} className="mt-6 flex flex-col gap-3 rounded-lg bg-paper p-5 shadow-sm sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="adresse@exemple.com"
          className={inputClass}
        />
        <button className={`${buttonClass} whitespace-nowrap`}>Inviter</button>
      </form>
      {message && <p className="mt-3 rounded bg-leaf/10 p-3 text-sm text-leaf">{message}</p>}

      <ul className="mt-6 divide-y divide-line rounded-lg bg-paper shadow-sm">
        {(admins ?? []).map((a) => (
          <li key={a.email} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">
                {a.email} {a.email === moi.toLowerCase() && <span className="text-xs text-muted">(vous)</span>}
              </p>
              <p className="text-xs text-muted">
                Ajouté le {formatDate(a.created_at)}
                {a.invited_by && <> par {a.invited_by}</>}
              </p>
            </div>
            {a.email !== moi.toLowerCase() && (
              <button onClick={() => retirer(a)} className="text-sm text-brand hover:underline">
                Retirer
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
