import Link from "next/link";
import { videoThumbnail } from "@/lib/format";
import type { Video } from "@/lib/types";
import { Cover } from "./ArticleCard";

export function VideoCard({ video, dark = false }: { video: Video; dark?: boolean }) {
  return (
    <Link href={`/videos/${video.id}`} className="group block">
      <div className="relative">
        <Cover src={videoThumbnail(video)} alt={video.titre} className="aspect-video rounded-sm" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/90 text-white shadow-lg transition group-hover:scale-110">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
        {video.duree && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-semibold text-white">
            {video.duree}
          </span>
        )}
      </div>
      {video.categorie && (
        <span className="mt-3 block text-xs font-bold uppercase tracking-wider text-gold">
          {video.categorie}
        </span>
      )}
      <h3
        className={`mt-1 font-serif text-lg font-bold leading-snug ${
          dark ? "text-white group-hover:text-gold" : "group-hover:text-brand"
        }`}
      >
        {video.titre}
      </h3>
    </Link>
  );
}
