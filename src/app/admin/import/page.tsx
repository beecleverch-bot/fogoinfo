"use client";

import { useState } from "react";
import { buttonClass, useAdmin } from "@/components/admin/AdminGate";

export default function ImportBase44() {
  const { supabase } = useAdmin();
  const [status, setStatus] = useState<"idle" | "running" | "ok" | "error">("idle");
  const [log, setLog] = useState<string[]>([]);

  async function lancer() {
    setStatus("running");
    setLog([]);
    const { data } = await supabase.auth.getSession();
    try {
      const res = await fetch("/api/import-base44", {
        method: "POST",
        headers: { Authorization: `Bearer ${data.session?.access_token ?? ""}` },
      });
      const body = await res.json();
      setLog(body.log ?? [body.error ?? `Erreur HTTP ${res.status}`]);
      setStatus(res.ok ? "ok" : "error");
    } catch (e) {
      setLog([`Erreur réseau : ${e instanceof Error ? e.message : String(e)}`]);
      setStatus("error");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl font-black">Importer depuis Base44</h1>
      <p className="mt-2 text-muted">
        Copie tous les articles, vidéos et images de l&apos;ancien site Base44 dans ce site. Vous pouvez le relancer sans
        risque : les contenus déjà importés sont mis à jour, sans doublon.
      </p>
      <button onClick={lancer} disabled={status === "running"} className={`${buttonClass} mt-6`}>
        {status === "running" ? "Import en cours… (jusqu'à quelques minutes)" : "Lancer l'import"}
      </button>
      {log.length > 0 && (
        <ul
          className={`mt-6 space-y-1 rounded-lg p-4 font-mono text-sm ${
            status === "error" ? "bg-brand/10 text-brand-dark" : "bg-paper shadow-sm"
          }`}
        >
          {log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
