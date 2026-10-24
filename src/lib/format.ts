export function formatDate(iso: string, withTime = false) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Africa/Conakry",
  });
}

export function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

export function videoThumbnail(v: { url_video: string; miniature_url: string | null }) {
  // Une miniature qui n'est pas une image (ex. fichier .WAV) est ignorée.
  if (v.miniature_url && /\.(jpe?g|png|webp|gif|avif)|unsplash|ytimg/i.test(v.miniature_url)) {
    return v.miniature_url;
  }
  const id = youtubeId(v.url_video);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

// Les contenus saisis en texte brut sont convertis en paragraphes.
export function toHtml(contenu: string | null) {
  if (!contenu) return "";
  if (/<\w+[^>]*>/.test(contenu)) return contenu;
  return contenu
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function excerpt(contenu: string | null, length = 160) {
  const text = (contenu ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > length ? text.slice(0, length).trimEnd() + "…" : text;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
