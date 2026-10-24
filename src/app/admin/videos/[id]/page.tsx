"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonClass, Field, inputClass, useAdmin } from "@/components/admin/AdminGate";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { CATEGORIES_VIDEO } from "@/lib/categories";
import { youtubeId } from "@/lib/format";

type Form = {
  titre: string;
  description: string;
  url_video: string;
  miniature_url: string;
  categorie: string;
  duree: string;
};

const vide: Form = { titre: "", description: "", url_video: "", miniature_url: "", categorie: "Reportage", duree: "" };

export default function EditVideo() {
  const { id } = useParams<{ id: string }>();
  const nouveau = id === "nouveau";
  const { supabase } = useAdmin();
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(nouveau ? vide : null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (nouveau) return;
    supabase
      .from("videos")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return setError("Vidéo introuvable.");
        setForm({
          titre: data.titre,
          description: data.description ?? "",
          url_video: data.url_video,
          miniature_url: data.miniature_url ?? "",
          categorie: data.categorie ?? "Reportage",
          duree: data.duree ?? "",
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
      description: form.description.trim() || null,
      url_video: form.url_video.trim(),
      miniature_url: form.miniature_url.trim() || null,
      categorie: form.categorie,
      duree: form.duree.trim() || null,
    };
    const { error } = nouveau
      ? await supabase.from("videos").insert(row)
      : await supabase.from("videos").update(row).eq("id", id);
    setSaving(false);
    if (error) setError(error.message);
    else router.push("/admin/videos");
  }

  if (!form) return <p className="text-muted">{error || "Chargement…"}</p>;
  const yt = youtubeId(form.url_video);

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-black">{nouveau ? "Nouvelle vidéo" : "Modifier la vidéo"}</h1>
        <Link href="/admin/videos" className="text-sm text-muted hover:text-ink">
          ← Retour
        </Link>
      </div>
      <div className="space-y-5 rounded-lg bg-paper p-6 shadow-sm">
        <Field label="Titre">
          <input required value={form.titre} onChange={(e) => set("titre", e.target.value)} className={`${inputClass} text-lg font-semibold`} />
        </Field>
        <Field label="Lien de la vidéo" hint="Lien YouTube (youtube.com/watch?v=… ou youtu.be/…) ou lien direct vers un fichier vidéo.">
          <input required type="url" value={form.url_video} onChange={(e) => set("url_video", e.target.value)} className={inputClass} />
        </Field>
        {yt && (
          <div className="aspect-video max-w-md overflow-hidden rounded bg-black">
            <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${yt}`} title="Aperçu" />
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Catégorie">
            <select value={form.categorie} onChange={(e) => set("categorie", e.target.value)} className={inputClass}>
              {CATEGORIES_VIDEO.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Durée" hint="Ex. 12:30">
            <input value={form.duree} onChange={(e) => set("duree", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="Description">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className={inputClass} />
        </Field>
        <ImageUpload
          value={form.miniature_url}
          onChange={(url) => set("miniature_url", url)}
          label="Miniature (facultatif : la miniature YouTube est utilisée par défaut)"
        />
      </div>
      {error && <p className="text-brand">{error}</p>}
      <button disabled={saving} className={buttonClass}>
        {saving ? "Enregistrement…" : nouveau ? "Publier" : "Enregistrer"}
      </button>
    </form>
  );
}
