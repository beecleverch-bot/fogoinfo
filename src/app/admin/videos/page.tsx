"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClass, useAdmin } from "@/components/admin/AdminGate";
import { formatDate, videoThumbnail } from "@/lib/format";
import type { Video } from "@/lib/types";

export default function AdminVideos() {
  const { supabase } = useAdmin();
  const [videos, setVideos] = useState<Video[] | null>(null);

  useEffect(() => {
    supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setVideos((data as Video[]) ?? []));
  }, [supabase]);

  async function supprimer(v: Video) {
    if (!confirm(`Supprimer « ${v.titre} » ?`)) return;
    const { error } = await supabase.from("videos").delete().eq("id", v.id);
    if (error) alert(error.message);
    else setVideos((list) => list!.filter((x) => x.id !== v.id));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-black">Vidéos</h1>
        <Link href="/admin/videos/nouveau" className={buttonClass}>
          + Nouvelle vidéo
        </Link>
      </div>
      {videos === null ? (
        <p className="text-muted">Chargement…</p>
      ) : videos.length === 0 ? (
        <p className="text-muted">Aucune vidéo.</p>
      ) : (
        <ul className="divide-y divide-line rounded-lg bg-paper shadow-sm">
          {videos.map((v) => {
            const thumb = videoThumbnail(v);
            return (
              <li key={v.id} className="flex items-center gap-4 p-3">
                <div className="img-frame h-16 w-28 shrink-0 overflow-hidden rounded">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/videos/${v.id}`} className="font-semibold hover:text-brand">
                    {v.titre}
                  </Link>
                  <p className="text-xs text-muted">
                    {[v.categorie, v.duree, formatDate(v.created_at), `${v.vues} vues`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="whitespace-nowrap text-sm">
                  <Link href={`/admin/videos/${v.id}`} className="mr-3 font-semibold hover:text-brand">
                    Modifier
                  </Link>
                  <button onClick={() => supprimer(v)} className="text-brand hover:underline">
                    Supprimer
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
