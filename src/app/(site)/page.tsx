import Link from "next/link";
import { ArticleCard, ArticleRow, CategoryTag, Cover, SectionTitle } from "@/components/ArticleCard";
import { VideoCard } from "@/components/VideoCard";
import { RUBRIQUES } from "@/lib/categories";
import { getArticles, getPopulaires, getUne, getVideos } from "@/lib/data";
import { excerpt, formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function Accueil() {
  const [une, recents, populaires, videos, tribunes] = await Promise.all([
    getUne(4),
    getArticles({ limit: 12 }),
    getPopulaires(5),
    getVideos(4),
    getArticles({ categories: ["Tribune", "Analyse"], limit: 3 }),
  ]);

  const [principal, ...secondaires] = une.length ? une : recents.slice(0, 4);
  const uneIds = new Set([principal, ...secondaires].filter(Boolean).map((a) => a.id));
  const fil = recents.filter((a) => !uneIds.has(a.id));

  const rubriques = RUBRIQUES.filter((r) => r.categories && r.slug !== "tribunes");
  const parRubrique = await Promise.all(
    rubriques.map(async (r) => ({ rubrique: r, articles: await getArticles({ categories: r.categories, limit: 3 }) })),
  );

  if (!principal) {
    return <p className="mx-auto max-w-7xl px-4 py-20 text-center text-muted">Aucun article pour le moment.</p>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* À la une */}
      <section className="grid gap-8 lg:grid-cols-3">
        <Link href={`/article/${principal.id}`} className="group relative block lg:col-span-2">
          <Cover src={principal.image_url} alt={principal.titre} className="aspect-[16/10] rounded-sm lg:aspect-[16/9]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
            <span className="inline-block bg-brand px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
              À la une · {principal.categorie}
            </span>
            <h1 className="mt-3 font-serif text-2xl font-black leading-tight text-white sm:text-4xl">
              {principal.titre}
            </h1>
            {(principal.soustitre || principal.contenu) && (
              <p className="mt-2 hidden max-w-2xl text-white/85 sm:block">
                {principal.soustitre || excerpt(principal.contenu)}
              </p>
            )}
            <p className="mt-3 text-xs text-white/70">
              {principal.auteur && <>{principal.auteur} · </>}
              {formatDate(principal.date_publication)}
            </p>
          </div>
        </Link>

        <div className="flex flex-col gap-6">
          {secondaires.map((a) => (
            <Link key={a.id} href={`/article/${a.id}`} className="group flex gap-4 border-b border-line pb-6 last:border-0">
              <Cover src={a.image_url} alt={a.titre} className="aspect-square w-24 shrink-0 rounded-sm" />
              <div>
                <CategoryTag categorie={a.categorie} />
                <h2 className="mt-1 font-serif text-lg font-bold leading-snug group-hover:text-brand">{a.titre}</h2>
                <p className="mt-1 text-xs text-muted">{formatDate(a.date_publication)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dernières actualités + Les plus lus */}
      <section className="mt-14 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle href="/actualites">Dernières actualités</SectionTitle>
          <div className="grid gap-8 sm:grid-cols-2">
            {fil.slice(0, 6).map((a) => (
              <ArticleCard key={a.id} article={a} showExcerpt />
            ))}
          </div>
        </div>
        <aside>
          <SectionTitle>Les plus lus</SectionTitle>
          <ol className="space-y-5">
            {populaires.map((a, i) => (
              <li key={a.id}>
                <Link href={`/article/${a.id}`} className="group flex gap-4">
                  <span className="font-serif text-4xl font-black leading-none text-brand/30">{i + 1}</span>
                  <div>
                    <CategoryTag categorie={a.categorie} />
                    <p className="font-serif font-bold leading-snug group-hover:text-brand">{a.titre}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>

          {tribunes.length > 0 && (
            <div className="mt-10 bg-soft p-5">
              <h2 className="mb-4 font-serif text-xl font-black uppercase">
                <Link href="/tribunes" className="hover:text-brand">Tribunes</Link>
              </h2>
              <ul className="space-y-4">
                {tribunes.map((a) => (
                  <li key={a.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                    <Link href={`/article/${a.id}`} className="group block">
                      <p className="font-serif text-lg font-bold italic leading-snug group-hover:text-brand">
                        « {a.titre} »
                      </p>
                      {a.auteur && <p className="mt-1 text-sm text-muted">par {a.auteur}</p>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>

      {/* Vidéos */}
      {videos.length > 0 && (
        <section className="-mx-4 mt-14 bg-ink px-4 py-10 sm:mx-0 sm:px-8">
          <div className="mb-6 flex items-end justify-between border-b border-white/20 pb-2">
            <h2 className="font-serif text-2xl font-black uppercase text-white">
              <span className="mr-2 inline-block h-4 w-1.5 bg-gold align-middle" />
              Vidéos
            </h2>
            <Link href="/videos" className="text-sm font-semibold text-gold hover:underline">
              Voir tout →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} dark />
            ))}
          </div>
        </section>
      )}

      {/* Rubriques */}
      {parRubrique
        .filter(({ articles }) => articles.length > 0)
        .map(({ rubrique, articles }) => (
          <section key={rubrique.slug} className="mt-14">
            <SectionTitle href={`/${rubrique.slug}`}>{rubrique.label}</SectionTitle>
            <div className="grid gap-8 md:grid-cols-3">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        ))}

      {fil.length > 6 && (
        <section className="mt-14">
          <SectionTitle href="/actualites">À lire aussi</SectionTitle>
          <div className="grid gap-6 md:grid-cols-2">
            {fil.slice(6).map((a) => (
              <ArticleRow key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
