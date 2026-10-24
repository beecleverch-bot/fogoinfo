"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClass, inputClass, useAdmin } from "@/components/admin/AdminGate";
import { formatDate } from "@/lib/format";
import type { Article } from "@/lib/types";

export default function AdminArticles() {
  const { supabase, isSuper, pays } = useAdmin();
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [filtre, setFiltre] = useState("");

  useEffect(() => {
    supabase
      .from("articles")
      .select("*")
      .order("date_publication", { ascending: false })
      .then(({ data }) => setArticles((data as Article[]) ?? []));
  }, [supabase]);

  async function supprimer(a: Article) {
    if (!confirm(`Supprimer « ${a.titre} » ?`)) return;
    const { error } = await supabase.from("articles").delete().eq("id", a.id);
    if (error) alert(error.message);
    else setArticles((list) => list!.filter((x) => x.id !== a.id));
  }

  async function basculerUne(a: Article) {
    const { error } = await supabase.from("articles").update({ est_une: !a.est_une }).eq("id", a.id);
    if (error) alert(error.message);
    else setArticles((list) => list!.map((x) => (x.id === a.id ? { ...x, est_une: !a.est_une } : x)));
  }

  // Un rédacteur ne voit que les articles de son pays.
  const visibles = (articles ?? [])
    .filter((a) => isSuper || a.pays === pays)
    .filter((a) =>
      `${a.titre} ${a.categorie} ${a.auteur} ${a.pays ?? ""}`.toLowerCase().includes(filtre.toLowerCase()),
    );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-black">Articles{!isSuper && pays && ` · ${pays}`}</h1>
        <Link href="/admin/articles/nouveau" className={buttonClass}>
          + Nouvel article
        </Link>
      </div>
      <input
        value={filtre}
        onChange={(e) => setFiltre(e.target.value)}
        placeholder="Filtrer par titre, rubrique, auteur…"
        className={`${inputClass} mb-4`}
      />
      {articles === null ? (
        <p className="text-muted">Chargement…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-paper shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase text-muted">
              <tr>
                <th className="p-3">Titre</th>
                <th className="p-3">Rubrique</th>
                {isSuper && <th className="p-3">Pays</th>}
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Vues</th>
                <th className="p-3 text-center">À la une</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visibles.map((a) => (
                <tr key={a.id} className="hover:bg-soft">
                  <td className="max-w-md p-3">
                    <Link href={`/admin/articles/${a.id}`} className="font-semibold hover:text-brand">
                      {a.titre}
                    </Link>
                    {a.auteur && <p className="text-xs text-muted">{a.auteur}</p>}
                  </td>
                  <td className="p-3">{a.categorie}</td>
                  {isSuper && <td className="p-3">{a.pays ?? "—"}</td>}
                  <td className="whitespace-nowrap p-3">{formatDate(a.date_publication)}</td>
                  <td className="p-3 text-right">{a.vues}</td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={a.est_une}
                      disabled={!isSuper}
                      onChange={() => basculerUne(a)}
                      aria-label="À la une"
                    />
                  </td>
                  <td className="whitespace-nowrap p-3 text-right">
                    <Link href={`/article/${a.id}`} target="_blank" className="mr-3 text-muted hover:text-ink">
                      Voir
                    </Link>
                    <Link href={`/admin/articles/${a.id}`} className="mr-3 font-semibold text-ink hover:text-brand">
                      Modifier
                    </Link>
                    <button onClick={() => supprimer(a)} className="text-brand hover:underline">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr>
                  <td colSpan={isSuper ? 7 : 6} className="p-6 text-center text-muted">
                    Aucun article.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
