"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonClass, Field, inputClass, useAdmin } from "@/components/admin/AdminGate";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { CATEGORIES_ARTICLE, PAYS_SUGGERES } from "@/lib/categories";

type Form = {
  titre: string;
  soustitre: string;
  categorie: string;
  contenu: string;
  image_url: string;
  auteur: string;
  date_publication: string;
  est_une: boolean;
  tags: string;
  pays: string;
};

const vide: Form = {
  titre: "",
  soustitre: "",
  categorie: "Actualités",
  contenu: "",
  image_url: "",
  auteur: "",
  date_publication: toLocalInput(new Date().toISOString()),
  est_une: false,
  tags: "",
  pays: "Guinée",
};

function toLocalInput(iso: string) {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function EditArticle() {
  const { id } = useParams<{ id: string }>();
  const nouveau = id === "nouveau";
  const { supabase, isSuper, pays } = useAdmin();
  const router = useRouter();
  // Un rédacteur publie toujours dans son pays.
  const [form, setForm] = useState<Form | null>(nouveau ? { ...vide, pays: (isSuper ? vide.pays : pays) ?? "" } : null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (nouveau) return;
    supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return setError("Article introuvable.");
        setForm({
          titre: data.titre,
          soustitre: data.soustitre ?? "",
          categorie: data.categorie,
          contenu: data.contenu ?? "",
          image_url: data.image_url ?? "",
          auteur: data.auteur ?? "",
          date_publication: toLocalInput(data.date_publication),
          est_une: data.est_une,
          tags: (data.tags ?? []).join(", "),
          pays: data.pays ?? "",
        });
      });
  }, [id, nouveau, supabase]);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f!, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    const row = {
      titre: form.titre.trim(),
      soustitre: form.soustitre.trim() || null,
      categorie: form.categorie,
      contenu: form.contenu,
      image_url: form.image_url.trim() || null,
      auteur: form.auteur.trim() || null,
      date_publication: new Date(form.date_publication).toISOString(),
      est_une: form.est_une,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      pays: isSuper ? form.pays.trim() || null : pays,
    };
    const { data, error } = nouveau
      ? await supabase.from("articles").insert(row).select("id")
      : await supabase.from("articles").update(row).eq("id", id).select("id");
    setSaving(false);
    if (error) {
      setError(
        error.code === "42501"
          ? `Vous ne pouvez publier que des articles du pays « ${pays ?? "?"} ».`
          : error.message,
      );
    } else if (!data?.length) {
      setError("Vous n'avez pas le droit de modifier cet article (autre pays).");
    } else {
      router.push("/admin");
    }
  }

  if (!form) return <p className="text-muted">{error || "Chargement…"}</p>;

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-black">{nouveau ? "Nouvel article" : "Modifier l'article"}</h1>
        <Link href="/admin" className="text-sm text-muted hover:text-ink">
          ← Retour
        </Link>
      </div>

      <div className="space-y-5 rounded-lg bg-paper p-6 shadow-sm">
        <Field label="Titre">
          <input required value={form.titre} onChange={(e) => set("titre", e.target.value)} className={`${inputClass} text-lg font-semibold`} />
        </Field>
        <Field label="Sous-titre / chapô">
          <input value={form.soustitre} onChange={(e) => set("soustitre", e.target.value)} className={inputClass} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Rubrique">
            <select value={form.categorie} onChange={(e) => set("categorie", e.target.value)} className={inputClass}>
              {CATEGORIES_ARTICLE.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Auteur">
            <input value={form.auteur} onChange={(e) => set("auteur", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Pays" hint={isSuper ? "Seuls les rédacteurs de ce pays pourront le modifier." : undefined}>
            {isSuper ? (
              <>
                <input
                  list="pays-suggeres"
                  value={form.pays}
                  onChange={(e) => set("pays", e.target.value)}
                  className={inputClass}
                />
                <datalist id="pays-suggeres">
                  {PAYS_SUGGERES.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </>
            ) : (
              <input value={pays ?? ""} disabled className={`${inputClass} bg-soft`} />
            )}
          </Field>
          <Field label="Date de publication">
            <input
              type="datetime-local"
              required
              value={form.date_publication}
              onChange={(e) => set("date_publication", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <ImageUpload value={form.image_url} onChange={(url) => set("image_url", url)} label="Image principale" />
        <Field label="Contenu" hint="Texte simple (une ligne vide = nouveau paragraphe) ou HTML (<p>, <h2>, <strong>, <a>, <img>…).">
          <textarea
            value={form.contenu}
            onChange={(e) => set("contenu", e.target.value)}
            rows={16}
            className={`${inputClass} font-serif leading-relaxed`}
          />
        </Field>
        <Field label="Mots-clés" hint="Séparés par des virgules.">
          <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className={inputClass} />
        </Field>
        {isSuper && (
          <label className="flex items-center gap-2 font-semibold">
            <input type="checkbox" checked={form.est_une} onChange={(e) => set("est_une", e.target.checked)} />
            Mettre à la une
          </label>
        )}
      </div>

      {error && <p className="text-brand">{error}</p>}
      <button disabled={saving} className={buttonClass}>
        {saving ? "Enregistrement…" : nouveau ? "Publier" : "Enregistrer"}
      </button>
    </form>
  );
}
