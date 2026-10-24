import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-serif text-6xl font-black text-brand">404</p>
      <h1 className="mt-4 font-serif text-2xl font-bold">Page introuvable</h1>
      <p className="mt-2 text-muted">Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" className="mt-6 inline-block rounded bg-brand px-5 py-2.5 font-semibold text-white">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
