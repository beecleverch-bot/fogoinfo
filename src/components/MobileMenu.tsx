"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  // Ferme le menu à chaque changement de page.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="p-1"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>
      {open && (
        <div className="absolute inset-x-0 z-50 mt-4 border-y border-line bg-paper shadow-lg">
          <ul className="divide-y divide-line">
            <li>
              <Link href="/" className="block px-5 py-3 font-semibold">
                Accueil
              </Link>
            </li>
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block px-5 py-3 font-semibold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
