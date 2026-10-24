import Link from "next/link";
import { excerpt, formatDate } from "@/lib/format";
import type { Article } from "@/lib/types";

export function CategoryTag({ categorie }: { categorie: string }) {
  return (
    <span className="text-xs font-bold uppercase tracking-wider text-brand">{categorie}</span>
  );
}

export function Cover({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  return (
    <div className={`img-frame overflow-hidden ${className}`}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      )}
    </div>
  );
}

export function ArticleCard({ article, showExcerpt = false }: { article: Article; showExcerpt?: boolean }) {
  return (
    <Link href={`/article/${article.id}`} className="group block">
      <Cover src={article.image_url} alt={article.titre} className="aspect-[16/10] rounded-sm" />
      <div className="mt-3">
        <CategoryTag categorie={article.categorie} />
        <h3 className="mt-1 font-serif text-xl font-bold leading-snug group-hover:text-brand">
          {article.titre}
        </h3>
        {showExcerpt && (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {article.soustitre || excerpt(article.contenu)}
          </p>
        )}
        <p className="mt-2 text-xs text-muted">
          {article.auteur && <>{article.auteur} · </>}
          {formatDate(article.date_publication)}
        </p>
      </div>
    </Link>
  );
}

export function ArticleRow({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.id}`} className="group flex gap-4">
      <Cover src={article.image_url} alt={article.titre} className="aspect-[4/3] w-28 shrink-0 rounded-sm sm:w-40" />
      <div>
        <CategoryTag categorie={article.categorie} />
        <h3 className="mt-0.5 font-serif text-lg font-bold leading-snug group-hover:text-brand">
          {article.titre}
        </h3>
        <p className="mt-1 hidden text-sm text-muted sm:block">
          {article.soustitre || excerpt(article.contenu, 120)}
        </p>
        <p className="mt-1 text-xs text-muted">{formatDate(article.date_publication)}</p>
      </div>
    </Link>
  );
}

export function SectionTitle({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between border-b-2 border-ink pb-2">
      <h2 className="font-serif text-xl font-black uppercase tracking-tight sm:text-2xl">
        <span className="mr-2 inline-block h-4 w-1.5 bg-brand align-middle" />
        {children}
      </h2>
      {href && (
        <Link href={href} className="whitespace-nowrap text-sm font-semibold text-brand hover:underline">
          Voir tout →
        </Link>
      )}
    </div>
  );
}
