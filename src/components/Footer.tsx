import Link from "next/link";
import { RUBRIQUES } from "@/lib/categories";

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white/80">
      <div className="flag-stripe h-1" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-3xl font-black text-white">
            <span className="text-brand">Fogo</span>info
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            Le média de référence pour l&apos;actualité guinéenne, africaine et mondiale.
            Analyses, vidéos et reportages.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Rubriques</p>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {RUBRIQUES.map((r) => (
              <li key={r.slug}>
                <Link href={`/${r.slug}`} className="hover:text-white">
                  {r.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/videos" className="hover:text-white">
                Vidéos
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Fogoinfo</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/recherche" className="hover:text-white">
                Rechercher
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white">
                Espace rédaction
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Fogoinfo. Tous droits réservés.
      </div>
    </footer>
  );
}
