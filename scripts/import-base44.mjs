#!/usr/bin/env node
// Importe les articles et vidéos du site Base44 dans Supabase, et recopie les
// images hébergées chez Base44 dans le stockage Supabase (bucket "media"),
// pour ne plus dépendre de Base44.
//
// Usage :
//   node scripts/import-base44.mjs --export     -> écrit base44-export.json seulement
//   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/import-base44.mjs
//
// Le script est idempotent : il peut être relancé (upsert sur l'id d'origine).

import { writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const APP_ID = process.env.BASE44_APP_ID ?? "695912f19b023253911be93e";
const API = `https://base44.app/api/apps/${APP_ID}/entities`;
const exportOnly = process.argv.includes("--export");

async function fetchEntity(name) {
  const res = await fetch(`${API}/${name}?limit=5000`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return res.json();
}

const isBase44File = (url) => typeof url === "string" && /base44/.test(url);

function mapArticle(a) {
  return {
    id: a.id,
    titre: a.titre ?? "(sans titre)",
    soustitre: a.soustitre?.trim() || null,
    categorie: a.categorie ?? "Actualités",
    contenu: a.contenu ?? "",
    image_url: a.image_url || null,
    auteur: a.auteur || null,
    date_publication: a.date_publication ?? a.created_date,
    vues: Math.round(Number(a.vues) || 0),
    est_une: Boolean(a.est_une),
    tags: Array.isArray(a.tags) ? a.tags : [],
    created_at: a.created_date,
  };
}

function mapVideo(v) {
  return {
    id: v.id,
    titre: v.titre ?? "(sans titre)",
    description: v.description || null,
    url_video: v.url_video,
    miniature_url: v.miniature_url || null,
    categorie: v.categorie || null,
    duree: v.duree || null,
    vues: Math.round(Number(v.vues) || 0),
    created_at: v.created_date,
  };
}

const [rawArticles, rawVideos] = await Promise.all([fetchEntity("Article"), fetchEntity("Video")]);
const articles = rawArticles.map(mapArticle);
const videos = rawVideos.map(mapVideo);
console.log(`Base44 : ${articles.length} articles, ${videos.length} vidéos`);

if (exportOnly) {
  await writeFile("base44-export.json", JSON.stringify({ articles: rawArticles, videos: rawVideos }, null, 2));
  console.log("Exporté dans base44-export.json");
  process.exit(0);
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (ou utilisez --export).");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const copies = new Map();
async function copyFile(url) {
  if (!isBase44File(url)) return url;
  if (copies.has(url)) return copies.get(url);
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  ! image introuvable, lien conservé : ${url}`);
    return url;
  }
  const name = decodeURIComponent(new URL(url).pathname.split("/").pop());
  const path = `base44/${name}`;
  const { error } = await supabase.storage.from("media").upload(path, await res.arrayBuffer(), {
    contentType: res.headers.get("content-type") ?? undefined,
    upsert: true,
  });
  if (error) throw error;
  const publicUrl = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  copies.set(url, publicUrl);
  console.log(`  image copiée : ${name}`);
  return publicUrl;
}

for (const a of articles) {
  a.image_url = await copyFile(a.image_url);
  // Images insérées dans le corps de l'article
  for (const [, src] of (a.contenu ?? "").matchAll(/src="([^"]+)"/g)) {
    if (isBase44File(src)) a.contenu = a.contenu.replaceAll(src, await copyFile(src));
  }
}
for (const v of videos) v.miniature_url = await copyFile(v.miniature_url);

const r1 = await supabase.from("articles").upsert(articles);
if (r1.error) throw r1.error;
const r2 = await supabase.from("videos").upsert(videos);
if (r2.error) throw r2.error;
console.log("Import terminé.");
