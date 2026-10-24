import seed from "@/data/seed.json";
import { isSupabaseConfigured, publicServerClient } from "./supabase";
import type { Article, Video } from "./types";

const seedArticles = (seed.articles as Article[])
  .slice()
  .sort(byDateDesc);
const seedVideos = (seed.videos as Video[])
  .slice()
  .sort((a, b) => b.created_at.localeCompare(a.created_at));

function byDateDesc(a: Article, b: Article) {
  return b.date_publication.localeCompare(a.date_publication);
}

export async function getArticles(opts: {
  categories?: string[] | null;
  limit?: number;
} = {}): Promise<Article[]> {
  const { categories, limit } = opts;
  if (!isSupabaseConfigured) {
    let list = seedArticles;
    if (categories) list = list.filter((a) => categories.includes(a.categorie));
    return limit ? list.slice(0, limit) : list;
  }
  let q = publicServerClient()
    .from("articles")
    .select("*")
    .order("date_publication", { ascending: false });
  if (categories) q = q.in("categorie", categories);
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data as Article[];
}

export async function getUne(limit = 4): Promise<Article[]> {
  if (!isSupabaseConfigured) {
    return seedArticles.filter((a) => a.est_une).slice(0, limit);
  }
  const { data, error } = await publicServerClient()
    .from("articles")
    .select("*")
    .eq("est_une", true)
    .order("date_publication", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Article[];
}

export async function getPopulaires(limit = 5): Promise<Article[]> {
  if (!isSupabaseConfigured) {
    return seedArticles
      .slice()
      .sort((a, b) => b.vues - a.vues)
      .slice(0, limit);
  }
  const { data, error } = await publicServerClient()
    .from("articles")
    .select("*")
    .order("vues", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Article[];
}

export async function getArticle(id: string): Promise<Article | null> {
  if (!isSupabaseConfigured) {
    return seedArticles.find((a) => a.id === id) ?? null;
  }
  const { data, error } = await publicServerClient()
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Article | null;
}

export async function incrementVues(table: "articles" | "videos", id: string) {
  if (!isSupabaseConfigured) return;
  await publicServerClient().rpc("increment_vues", { tbl: table, row_id: id });
}

export async function searchArticles(query: string): Promise<Article[]> {
  const q = query.trim();
  if (!q) return [];
  if (!isSupabaseConfigured) {
    const needle = normalize(q);
    return seedArticles.filter((a) =>
      normalize(
        [a.titre, a.soustitre, a.contenu, a.auteur, a.categorie, ...a.tags].join(" "),
      ).includes(needle),
    );
  }
  // Échappe les caractères spéciaux du filtre PostgREST.
  const safe = q.replace(/[%,()*]/g, " ");
  const { data, error } = await publicServerClient()
    .from("articles")
    .select("*")
    .or(
      `titre.ilike.%${safe}%,soustitre.ilike.%${safe}%,contenu.ilike.%${safe}%,auteur.ilike.%${safe}%`,
    )
    .order("date_publication", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as Article[];
}

export async function getVideos(limit?: number): Promise<Video[]> {
  if (!isSupabaseConfigured) {
    return limit ? seedVideos.slice(0, limit) : seedVideos;
  }
  let q = publicServerClient()
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data as Video[];
}

export async function getVideo(id: string): Promise<Video | null> {
  if (!isSupabaseConfigured) {
    return seedVideos.find((v) => v.id === id) ?? null;
  }
  const { data, error } = await publicServerClient()
    .from("videos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Video | null;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
