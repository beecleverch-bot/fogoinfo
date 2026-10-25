"use client";

import { useState } from "react";
import { buttonClass, Card, Field, inputClass, useAdmin } from "@/components/admin/AdminGate";

export default function Compte() {
  const { supabase, email } = useAdmin();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmation) {
      return setMessage({ ok: false, texte: "Les deux mots de passe ne sont pas identiques." });
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      setMessage({ ok: false, texte: error.message });
    } else {
      setPassword("");
      setConfirmation("");
      setMessage({
        ok: true,
        texte: "Mot de passe enregistré. Vous pouvez maintenant vous connecter avec votre e-mail et ce mot de passe.",
      });
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="font-serif text-3xl font-black">Mot de passe</h1>
      <p className="mt-1 text-muted">
        Choisissez un mot de passe pour <strong>{email}</strong> : vous n&apos;aurez plus besoin d&apos;attendre un
        e-mail pour vous connecter.
      </p>
      <div className="mt-4">
        <Card>
        <form onSubmit={enregistrer} className="space-y-4">
          <Field label="Nouveau mot de passe" hint="8 caractères minimum.">
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Confirmer le mot de passe">
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className={inputClass}
            />
          </Field>
          <button disabled={saving} className={buttonClass}>
            {saving ? "Enregistrement…" : "Enregistrer le mot de passe"}
          </button>
          {message && <p className={`text-sm ${message.ok ? "text-leaf" : "text-brand"}`}>{message.texte}</p>}
        </form>
        </Card>
      </div>
    </div>
  );
}
