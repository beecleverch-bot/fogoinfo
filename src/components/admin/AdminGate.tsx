"use client";

import type { Session, SupabaseClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { browserClient, isSupabaseConfigured } from "@/lib/supabase";

export type Profil = {
  role: "super" | "admin" | "redacteur";
  pays: string | null;
};
// isSuper : vous seul. peutGerer : super admin ou admin (contenu de tous les pays,
// vidéos, rédacteurs).
type Ctx = {
  supabase: SupabaseClient;
  email: string;
  isSuper: boolean;
  peutGerer: boolean;
  pays: string | null;
};
const AdminContext = createContext<Ctx | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin hors de AdminGate");
  return ctx;
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <Card>
          <h1 className="text-xl font-bold">Mode démonstration</h1>
          <p className="mt-2 text-muted">
            L&apos;espace rédaction nécessite une base Supabase. Renseignez <code>NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (voir le README).
          </p>
        </Card>
      </Shell>
    );
  }
  return <Gate>{children}</Gate>;
}

function Gate({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => browserClient(), []);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  // null = pas administrateur, undefined = en cours de vérification
  const [profil, setProfil] = useState<Profil | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) return;
    const email = (session.user.email ?? "").toLowerCase();
    supabase
      .from("admins")
      .select("role, pays")
      .eq("email", email)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (!error) return setProfil((data as Profil | null) ?? null);
        // Base pas encore migrée (supabase/002_roles_pays.sql) : ancien modèle,
        // tout administrateur a tous les droits.
        const { data: admin } = await supabase.rpc("is_admin");
        setProfil(admin ? { role: "super", pays: null } : null);
      });
  }, [session, supabase]);

  if (session === undefined || (session && profil === undefined)) {
    return (
      <Shell>
        <p className="py-20 text-center text-muted">Chargement…</p>
      </Shell>
    );
  }
  if (!session) {
    return (
      <Shell>
        <Login supabase={supabase} />
      </Shell>
    );
  }
  const email = session.user.email ?? "";
  if (!profil) {
    return (
      <Shell>
        <Card>
          <h1 className="text-xl font-bold">Accès refusé</h1>
          <p className="mt-2 text-muted">
            Le compte <strong>{email}</strong> n&apos;est pas administrateur. Demandez à un administrateur de vous
            inviter.
          </p>
          <button onClick={() => supabase.auth.signOut()} className="mt-4 text-sm font-semibold text-brand">
            Se déconnecter
          </button>
        </Card>
      </Shell>
    );
  }

  const isSuper = profil.role === "super";
  const peutGerer = isSuper || profil.role === "admin";
  const badge = isSuper ? "Super admin" : peutGerer ? "Admin" : `Rédacteur · ${profil.pays ?? "sans pays"}`;
  return (
    <AdminContext.Provider value={{ supabase, email, isSuper, peutGerer, pays: profil.pays }}>
      <Shell
        email={email}
        badge={badge}
        isSuper={isSuper}
        peutGerer={peutGerer}
        onSignOut={() => supabase.auth.signOut()}
      >
        {children}
      </Shell>
    </AdminContext.Provider>
  );
}

function Login({ supabase }: { supabase: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "lien">("password");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  function echec(message: string) {
    setError(message);
    setStatus("error");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    if (mode === "password") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        echec(
          /invalid login credentials/i.test(error.message)
            ? "E-mail ou mot de passe incorrect. Pas encore de mot de passe ? Utilisez le lien par e-mail."
            : error.message,
        );
      }
      return;
    }
    // Pas de lien pour une adresse inconnue : le quota d'e-mails est limité.
    const { data: autorise, error: erreurCheck } = await supabase.rpc("email_autorise", { adresse: email });
    if (!erreurCheck && autorise === false) {
      return echec(
        "Cette adresse n'a pas accès à l'espace rédaction. Vérifiez l'orthographe, ou demandez à un administrateur de vous ajouter.",
      );
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    if (error) {
      echec(
        /rate limit/i.test(error.message)
          ? "Trop de liens envoyés pour le moment. Réessayez dans une heure, ou connectez-vous avec votre mot de passe."
          : error.message,
      );
    } else {
      setStatus("sent");
    }
  }

  return (
    <Card>
      <h1 className="font-serif text-2xl font-black">Espace rédaction</h1>
      {status === "sent" ? (
        <p className="mt-3 text-muted">
          Un lien de connexion a été envoyé à <strong>{email}</strong>. Ouvrez-le sur cet appareil pour vous connecter.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block text-sm font-semibold" htmlFor="email">
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="vous@exemple.com"
          />
          {mode === "password" && (
            <>
              <label className="block text-sm font-semibold" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </>
          )}
          <button disabled={status === "sending"} className={buttonClass}>
            {status === "sending"
              ? "Patientez…"
              : mode === "password"
                ? "Se connecter"
                : "Recevoir un lien de connexion"}
          </button>
          {status === "error" && <p className="text-sm text-brand">{error}</p>}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "password" ? "lien" : "password");
              setStatus("idle");
            }}
            className="block text-sm text-muted underline hover:text-ink"
          >
            {mode === "password" ? "Pas de mot de passe ? Recevoir un lien par e-mail" : "J'ai un mot de passe"}
          </button>
        </form>
      )}
    </Card>
  );
}

// Pages réservées au super admin, et à l'équipe de gestion (super admin + admins).
const PAGES_SUPER = ["/admin/import"];
const PAGES_GESTION = ["/admin/videos", "/admin/inviter"];

function Shell({
  children,
  email,
  badge,
  isSuper = false,
  peutGerer = false,
  onSignOut,
}: {
  children: React.ReactNode;
  email?: string;
  badge?: string;
  isSuper?: boolean;
  peutGerer?: boolean;
  onSignOut?: () => void;
}) {
  const pathname = usePathname();
  const tabs = [
    { href: "/admin", label: "Articles" },
    { href: "/admin/videos", label: "Vidéos" },
    { href: "/admin/inviter", label: "Administrateurs" },
    { href: "/admin/import", label: "Import Base44" },
    { href: "/admin/compte", label: "Mot de passe" },
  ].filter((t) => (isSuper || !PAGES_SUPER.includes(t.href)) && (peutGerer || !PAGES_GESTION.includes(t.href)));
  const interdit =
    Boolean(email) &&
    ((!isSuper && PAGES_SUPER.some((p) => pathname.startsWith(p))) ||
      (!peutGerer && PAGES_GESTION.some((p) => pathname.startsWith(p))));
  return (
    <div className="min-h-screen bg-soft">
      <div className="flag-stripe h-1" />
      <header className="bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 font-serif text-2xl font-black">
            <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10" />
            <span>
              <span className="text-flag-red">Fo</span>
              <span className="text-gold-text">go</span>
              <span className="text-brand">info</span>
            </span>
            <span className="text-sm font-normal text-muted">rédaction</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted hover:text-ink">
              Voir le site ↗
            </Link>
            {email && (
              <>
                <span className="hidden text-muted sm:inline">{email}</span>
                {badge && <span className="rounded bg-brand px-2 py-0.5 text-xs text-white">{badge}</span>}
                <button onClick={onSignOut} className="font-semibold text-flag-red">
                  Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
        {email && (
          <div className="bg-brand">
            <nav className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 pt-2">
              {tabs.map((t) => {
                const active =
                  t.href === "/admin"
                    ? pathname === "/admin" || pathname.startsWith("/admin/articles")
                    : pathname.startsWith(t.href);
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={`rounded-t px-4 py-2 text-sm font-semibold ${active ? "bg-soft text-ink" : "text-white/70 hover:text-white"}`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {interdit ? (
          <Card>
            <h1 className="text-xl font-bold">Accès réservé</h1>
            <p className="mt-2 text-muted">Cette page n&apos;est pas accessible avec votre compte.</p>
          </Card>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md rounded-lg bg-paper p-6 shadow-sm">{children}</div>;
}

export const inputClass =
  "w-full rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand";
export const buttonClass =
  "rounded-md bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-50";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
