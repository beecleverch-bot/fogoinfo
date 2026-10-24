import Link from "next/link";
import { RUBRIQUES } from "@/lib/categories";
import { RESEAUX_LABELS, SITE } from "@/lib/site";

export function Footer() {
  const { contact } = SITE;
  const reseaux = (Object.keys(SITE.reseaux) as (keyof typeof SITE.reseaux)[]).filter((k) => SITE.reseaux[k]);
  const aContact = contact.email || contact.telephone || contact.whatsapp || contact.adresse;

  return (
    <footer className="mt-16 bg-ink text-white/80">
      <div className="flag-stripe h-1" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="font-serif text-3xl font-black text-white">
            <span className="text-brand">Fogo</span>info
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">{SITE.presentation}</p>
          {SITE.directeurPublication && (
            <p className="mt-3 text-sm">
              Directeur de publication : <span className="text-white">{SITE.directeurPublication}</span>
            </p>
          )}
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
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Contact</p>
          <ul className="space-y-2 text-sm">
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="hover:text-white">
                  {contact.email}
                </a>
              </li>
            )}
            {contact.telephone && (
              <li>
                <a href={`tel:${contact.telephone.replace(/\s/g, "")}`} className="hover:text-white">
                  {contact.telephone}
                </a>
              </li>
            )}
            {contact.whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener"
                  className="hover:text-white"
                >
                  WhatsApp : {contact.whatsapp}
                </a>
              </li>
            )}
            {contact.adresse && <li>{contact.adresse}</li>}
            {!aContact && (
              <li>
                <Link href="/recherche" className="hover:text-white">
                  Rechercher
                </Link>
              </li>
            )}
            <li>
              <Link href="/admin" className="hover:text-white">
                Espace rédaction
              </Link>
            </li>
          </ul>
        </div>
        {reseaux.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Suivez-nous</p>
            <ul className="space-y-2 text-sm">
              {reseaux.map((k) => (
                <li key={k}>
                  <a href={SITE.reseaux[k]} target="_blank" rel="noopener" className="hover:text-white">
                    {RESEAUX_LABELS[k]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Fogoinfo. Tous droits réservés.
      </div>
    </footer>
  );
}
