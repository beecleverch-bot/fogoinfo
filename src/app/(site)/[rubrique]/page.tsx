import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard, ArticleRow } from "@/components/ArticleCard";
import { getRubrique, RUBRIQUES } from "@/lib/categories";
import { getArticles } from "@/lib/data";

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return RUBRIQUES.map((r) => ({ rubrique: r.slug }));
}

type Props = { params: Promise<{ rubrique: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = getRubrique((await params).rubrique);
  return r ? { title: r.label, description: r.description } : {};
}

export default async function RubriquePage({ params }: Props) {
  const rubrique = getRubrique((await params).rubrique);
  if (!rubrique) notFound();
  const articles = await getArticles({ categories: rubrique.categories });
  const [premiers, suite] = [articles.slice(0, 3), articles.slice(3)];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-10 border-b-2 border-ink pb-4">
        <h1 className="font-serif text-4xl font-black uppercase tracking-tight sm:text-5xl">
          <span className="mr-3 inline-block h-8 w-2 bg-brand align-middle" />
          {rubrique.label}
        </h1>
        <p className="mt-2 text-muted">{rubrique.description}</p>
      </header>

      {articles.length === 0 ? (
        <p className="py-16 text-center text-muted">Aucun article dans cette rubrique pour le moment.</p>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-3">
            {premiers.map((a) => (
              <ArticleCard key={a.id} article={a} showExcerpt />
            ))}
          </div>
          {suite.length > 0 && (
            <div className="mt-12 grid gap-8 border-t border-line pt-10 md:grid-cols-2">
              {suite.map((a) => (
                <ArticleRow key={a.id} article={a} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
