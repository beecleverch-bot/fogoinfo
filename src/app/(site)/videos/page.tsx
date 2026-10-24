import type { Metadata } from "next";
import { VideoCard } from "@/components/VideoCard";
import { getVideos } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Vidéos",
  description: "Reportages, interviews, débats et documentaires de Fogoinfo.",
};

export default async function VideosPage() {
  const videos = await getVideos();
  return (
    <div className="bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <header className="mb-10 border-b border-white/20 pb-4">
          <h1 className="font-serif text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
            <span className="mr-3 inline-block h-8 w-2 bg-gold align-middle" />
            Vidéos
          </h1>
          <p className="mt-2 text-white/70">Reportages, interviews, débats et documentaires.</p>
        </header>
        {videos.length === 0 ? (
          <p className="py-16 text-center text-white/60">Aucune vidéo pour le moment.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} dark />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
