import { createBrowserClient, createServerClient } from "@supabase/ssr";

export const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Accepte les noms de variable proposés par le bouton « Connect » de Supabase.
export const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Sans variables Supabase, le site tourne en mode démo sur src/data/seed.json.
export const isSupabaseConfigured = Boolean(url && anonKey);

export function browserClient() {
  return createBrowserClient(url!, anonKey!);
}

// Client serveur en lecture seule (pages publiques) : pas de cookies,
// ce qui permet la mise en cache des pages.
export function publicServerClient() {
  return createServerClient(url!, anonKey!, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
