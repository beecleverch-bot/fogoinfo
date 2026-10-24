"use client";

import type { Session, SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { browserClient, isSupabaseConfigured } from "@/lib/supabase";

type Ctx = { supabase: SupabaseClient; email: string };
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
            L&apos;espace rédaction nécessite une base Supabase. Renseignez{" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> et <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (voir le README).
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
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) return;
    supabase.rpc("is_admin").then(({ data }) => setIsAdmin(Boolean(data)));
  }, [session, supabase]);

  if (session === undefined || (session && isAdmin === undefined)) {
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
  if (!isAdmin) {
    return (
      <Shell>
        <Card>
          <h1 className="text-xl font-bold">Accès refusé</h1>
          <p className="mt-2 text-muted">
            Le compte <strong>{email}</strong> n&apos;est pas administrateur. Demandez à un administrateur de vous inviter.
          </p>
          <button onClick={() => supabase.auth.signOut()} className="mt-4 text-sm font-semibold text-brand">
            Se déconnecter
          </button>
        </Card>
      </Shell>
    );
  }

  return (
    <AdminContext.Provider value={{ supabase, email }}>
      <Shell email={email} onSignOut={() => supabase.auth.signOut()}>
        {children}
      </Shell>
    </AdminContext.Provider>
  );
}

function Login({ supabase }: { supabase: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    if (error) {
      setError(error.message);
      setStatus("error");
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="vous@exemple.com"
          />
          <button disabled={status === "sending"} className={buttonClass}>
            {status === "sending" ? "Envoi…" : "Recevoir un lien de connexion"}
          </button>
          {status === "error" && <p className="text-sm text-brand">{error}</p>}
        </form>
      )}
    </Card>
  );
}

function Shell({
  children,
  email,
  onSignOut,
}: {
  children: React.ReactNode;
  email?: string;
  onSignOut?: () => void;
}) {
  const pathname = usePathname();
  const tabs = [
    { href: "/admin", label: "Articles" },
    { href: "/admin/videos", label: "Vidéos" },
    { href: "/admin/inviter", label: "Administrateurs" },
    { href: "/admin/import", label: "Import Base44" },
  ];
  return (
    <div className="min-h-screen bg-soft">
      <div className="flag-stripe h-1" />
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="font-serif text-2xl font-black">
            <span className="text-brand">Fogo</span>info <span className="text-sm font-normal text-white/60">rédaction</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-white/70 hover:text-white">
              Voir le site ↗
            </Link>
            {email && (
              <>
                <span className="hidden text-white/50 sm:inline">{email}</span>
                <button onClick={onSignOut} className="font-semibold text-gold">
                  Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
        {email && (
          <nav className="mx-auto flex max-w-6xl gap-1 px-4">
            {tabs.map((t) => {
              const active = t.href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/articles") : pathname.startsWith(t.href);
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
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
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
