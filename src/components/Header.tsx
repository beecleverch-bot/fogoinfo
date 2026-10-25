import Image from "next/image";
import Link from "next/link";
import { RUBRIQUES } from "@/lib/categories";
import { MobileMenu } from "./MobileMenu";
import { Today } from "./Today";

const NAV = [
  ...RUBRIQUES.map((r) => ({ href: `/${r.slug}`, label: r.label })),
  { href: "/videos", label: "Vidéos" },
];

export function Header() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="flag-stripe h-1" />
      <div className="bg-brand text-sm text-white/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
          <Today />
          <span className="hidden sm:inline">Guinée · Afrique · Monde</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5">
        <MobileMenu items={NAV} />
        <Link href="/" className="group flex items-center gap-3">
          <Image src="/logo.png" alt="" width={72} height={72} priority className="h-14 w-14 sm:h-[72px] sm:w-[72px]" />
          <span className="flex flex-col">
            <span className="font-serif text-4xl font-black tracking-tight sm:text-5xl">
              <span className="text-flag-red">Fo</span>
              <span className="text-gold-text">go</span>
              <span className="text-brand">info</span>
            </span>
            <span className="mt-1 hidden text-xs uppercase tracking-[0.2em] text-muted sm:block">
              L&apos;actualité guinéenne, africaine et mondiale
            </span>
          </span>
        </Link>
        <form action="/recherche" className="hidden items-center md:flex">
          <label htmlFor="q" className="sr-only">
            Rechercher
          </label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="Rechercher un article…"
            className="w-56 rounded-l-md border border-line px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="rounded-r-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            OK
          </button>
        </form>
        <Link href="/recherche" className="md:hidden" aria-label="Rechercher">
          <SearchIcon />
        </Link>
      </div>

      <nav className="hidden border-t border-line md:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 px-4">
          <li>
            <Link
              href="/"
              className="block px-3 py-3 text-sm font-semibold uppercase tracking-wide hover:text-brand"
            >
              Accueil
            </Link>
          </li>
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-3 py-3 text-sm font-semibold uppercase tracking-wide hover:text-brand"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
