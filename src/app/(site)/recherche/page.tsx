import type { Metadata } from "next";
import { ArticleRow } from "@/components/ArticleCard";
import { searchArticles } from "@/lib/data";

export const metadata: Metadata = { title: "Recherche" };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function RecherchePage({ searchParams }: Props) {
  const q = ((await searchParams).q ?? "").slice(0, 100);
  const resultats = q ? await searchArticles(q) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-4xl font-black uppercase tracking-tight">
        <span className="mr-3 inline-block h-8 w-2 bg-brand align-middle" />
        Recherche
      </h1>
      <form action="/recherche" className="mt-6 flex">
        <input
          name="q"
          type="search"
          defaultValue={q}
          autoFocus
          placeholder="Mot-clé, auteur, sujet…"
          className="flex-1 rounded-l-md border border-line px-4 py-3 outline-none focus:border-brand"
        />
        <button type="submit" className="rounded-r-md bg-brand px-6 font-semibold text-white hover:bg-brand-dark">
          Rechercher
        </button>
      </form>

      {q && (
        <p className="mt-8 text-sm text-muted">
          {resultats.length} résultat{resultats.length > 1 ? "s" : ""} pour « {q} »
        </p>
      )}
      <div className="mt-6 space-y-8">
        {resultats.map((a) => (
          <ArticleRow key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}
