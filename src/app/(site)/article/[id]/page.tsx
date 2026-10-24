import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import sanitizeHtml from "sanitize-html";
import { ArticleCard, SectionTitle } from "@/components/ArticleCard";
import { ShareButtons } from "@/components/ShareButtons";
import { rubriqueFor } from "@/lib/categories";
import { getArticle, getArticles, incrementVues } from "@/lib/data";
import { excerpt, formatDate, toHtml } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle((await params).id);
  if (!article) return {};
  const description = article.soustitre || excerpt(article.contenu);
  return {
    title: article.titre,
    description,
    openGraph: {
      type: "article",
      title: article.titre,
      description,
      publishedTime: article.date_publication,
      authors: article.auteur ? [article.auteur] : undefined,
      images: article.image_url ? [article.image_url] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();

  after(() => incrementVues("articles", id));

  const rubrique = rubriqueFor(article.categorie);
  const similaires = (await getArticles({ categories: [article.categorie], limit: 4 }))
    .filter((a) => a.id !== article.id)
    .slice(0, 3);
  const html = sanitizeHtml(toHtml(article.contenu), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "iframe"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder"],
    },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
  });

  return (
    <article className="mx-auto max-w-7xl px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <nav className="text-sm text-muted">
          <Link href="/" className="hover:text-brand">Accueil</Link>
          {rubrique && (
            <>
              {" / "}
              <Link href={`/${rubrique.slug}`} className="hover:text-brand">{rubrique.label}</Link>
            </>
          )}
        </nav>
        <span className="mt-6 inline-block bg-brand px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
          {article.categorie}
        </span>
        <h1 className="mt-4 font-serif text-3xl font-black leading-tight sm:text-5xl">{article.titre}</h1>
        {article.soustitre && <p className="mt-4 text-xl leading-relaxed text-muted">{article.soustitre}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4 text-sm">
          <div>
            {article.auteur && <p className="font-semibold">Par {article.auteur}</p>}
            <p className="text-muted">
              Publié le {formatDate(article.date_publication, true)} · {article.vues} vue{article.vues > 1 ? "s" : ""}
            </p>
          </div>
          <ShareButtons title={article.titre} />
        </div>
      </div>

      {article.image_url && (
        <div className="img-frame mx-auto mt-8 aspect-[16/9] max-w-5xl overflow-hidden rounded-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.image_url} alt={article.titre} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="mx-auto mt-10 max-w-3xl">
        {html ? (
          <div className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="text-muted italic">Le contenu de cet article n&apos;est pas encore disponible.</p>
        )}

        {article.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <Link
                key={t}
                href={`/recherche?q=${encodeURIComponent(t)}`}
                className="rounded-full bg-soft px-3 py-1 text-sm text-muted hover:bg-brand hover:text-white"
              >
                #{t}
              </Link>
            ))}
          </div>
        )}
      </div>

      {similaires.length > 0 && (
        <section className="mt-16">
          <SectionTitle href={rubrique ? `/${rubrique.slug}` : undefined}>Dans la même rubrique</SectionTitle>
          <div className="grid gap-8 md:grid-cols-3">
            {similaires.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
