import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { anonKey, url } from "@/lib/supabase";

// Importe les articles et vidéos du site Base44 et recopie leurs images dans
// le stockage Supabase. Appelé depuis /admin/import par un administrateur
// connecté : toutes les écritures passent par ses droits (RLS).
// Équivalent en ligne de commande : scripts/import-base44.mjs

export const maxDuration = 300;

const APP_ID = process.env.BASE44_APP_ID ?? "695912f19b023253911be93e";
const API = `https://base44.app/api/apps/${APP_ID}/entities`;

type Raw = Record<string, unknown>;

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!url || !anonKey || !token) {
    return Response.json({ error: "Non connecté." }, { status: 401 });
  }
  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return Response.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  }

  const log: string[] = [];
  try {
    const [rawArticles, rawVideos] = await Promise.all([fetchEntity("Article"), fetchEntity("Video")]);
    log.push(`Base44 : ${rawArticles.length} articles, ${rawVideos.length} vidéos trouvés.`);

    const copy = fileCopier(supabase, log);
    const articles = [];
    for (const a of rawArticles) {
      let contenu = str(a.contenu) ?? "";
      for (const [, src] of contenu.matchAll(/src="([^"]+)"/g)) {
        contenu = contenu.replaceAll(src, await copy(src));
      }
      articles.push({
        id: String(a.id),
        titre: str(a.titre) ?? "(sans titre)",
        soustitre: str(a.soustitre)?.trim() || null,
        categorie: str(a.categorie) ?? "Actualités",
        contenu,
        image_url: str(a.image_url) ? await copy(str(a.image_url)!) : null,
        auteur: str(a.auteur) || null,
        date_publication: str(a.date_publication) ?? str(a.created_date),
        vues: Math.round(Number(a.vues) || 0),
        est_une: Boolean(a.est_une),
        tags: Array.isArray(a.tags) ? a.tags : [],
        created_at: str(a.created_date),
      });
    }
    const videos = [];
    for (const v of rawVideos) {
      videos.push({
        id: String(v.id),
        titre: str(v.titre) ?? "(sans titre)",
        description: str(v.description) || null,
        url_video: str(v.url_video) ?? "",
        miniature_url: str(v.miniature_url) ? await copy(str(v.miniature_url)!) : null,
        categorie: str(v.categorie) || null,
        duree: str(v.duree) || null,
        vues: Math.round(Number(v.vues) || 0),
        created_at: str(v.created_date),
      });
    }

    const r1 = await supabase.from("articles").upsert(articles);
    if (r1.error) throw new Error(`Articles : ${r1.error.message}`);
    const r2 = await supabase.from("videos").upsert(videos);
    if (r2.error) throw new Error(`Vidéos : ${r2.error.message}`);
    log.push(`Import terminé : ${articles.length} articles et ${videos.length} vidéos enregistrés.`);
    revalidatePath("/", "layout");
    return Response.json({ ok: true, log });
  } catch (e) {
    log.push(`Erreur : ${e instanceof Error ? e.message : String(e)}`);
    return Response.json({ ok: false, log }, { status: 500 });
  }
}

async function fetchEntity(name: string): Promise<Raw[]> {
  const res = await fetch(`${API}/${name}?limit=5000`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Base44 ${name} : HTTP ${res.status}`);
  return res.json();
}

function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

// Recopie un fichier hébergé chez Base44 dans le bucket "media" et renvoie
// sa nouvelle adresse. Les autres liens (Unsplash, YouTube…) sont gardés.
function fileCopier(supabase: SupabaseClient, log: string[]) {
  const done = new Map<string, string>();
  return async (src: string): Promise<string> => {
    if (!/base44/.test(src)) return src;
    if (done.has(src)) return done.get(src)!;
    const name = decodeURIComponent(new URL(src).pathname.split("/").pop() ?? "fichier");
    const path = `base44/${name}`;
    const publicUrl = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
    const res = await fetch(src, { cache: "no-store" });
    if (!res.ok) {
      log.push(`Image introuvable, lien d'origine conservé : ${name}`);
      return src;
    }
    const { error } = await supabase.storage.from("media").upload(path, await res.arrayBuffer(), {
      contentType: res.headers.get("content-type") ?? undefined,
    });
    // Déjà copiée lors d'un import précédent : on garde la copie existante.
    if (error && !/exists|duplicate/i.test(error.message)) {
      log.push(`Copie impossible (${error.message}), lien d'origine conservé : ${name}`);
      return src;
    }
    log.push(`Image copiée : ${name}`);
    done.set(src, publicUrl);
    return publicUrl;
  };
}
