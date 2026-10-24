import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { VideoCard } from "@/components/VideoCard";
import { getVideo, getVideos, incrementVues } from "@/lib/data";
import { formatDate, videoThumbnail, youtubeId } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = await getVideo((await params).id);
  if (!video) return {};
  const thumb = videoThumbnail(video);
  return {
    title: video.titre,
    description: video.description || undefined,
    openGraph: { title: video.titre, images: thumb ? [thumb] : undefined },
  };
}

export default async function VideoPage({ params }: Props) {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) notFound();

  after(() => incrementVues("videos", id));

  const ytId = youtubeId(video.url_video);
  const autres = (await getVideos(4)).filter((v) => v.id !== id).slice(0, 3);

  return (
    <div className="bg-ink text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/videos" className="text-sm text-white/60 hover:text-gold">
          ← Toutes les vidéos
        </Link>
        <div className="mt-4 aspect-video overflow-hidden rounded-sm bg-black">
          {ytId ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${ytId}`}
              title={video.titre}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video className="h-full w-full" src={video.url_video} controls />
          )}
        </div>
        {video.categorie && (
          <span className="mt-6 inline-block text-xs font-bold uppercase tracking-wider text-gold">
            {video.categorie}
          </span>
        )}
        <h1 className="mt-2 font-serif text-3xl font-black leading-tight sm:text-4xl">{video.titre}</h1>
        <p className="mt-2 text-sm text-white/60">
          {formatDate(video.created_at)}
          {video.duree && <> · {video.duree}</>}
        </p>
        {video.description && <p className="mt-4 max-w-3xl leading-relaxed text-white/85">{video.description}</p>}

        {autres.length > 0 && (
          <section className="mt-14 border-t border-white/20 pt-8">
            <h2 className="mb-6 font-serif text-2xl font-black uppercase">À voir aussi</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {autres.map((v) => (
                <VideoCard key={v.id} video={v} dark />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
