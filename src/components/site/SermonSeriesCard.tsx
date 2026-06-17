import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SermonSeries } from "@/lib/content/sermons";

export function SermonSeriesCard({ series }: { series: SermonSeries }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-video bg-cream">
        {series.imageUrl ? (
          <Image
            src={series.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-green text-white">
            <span className="font-display text-3xl">{series.name}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-terracotta">
          {series.dateLabel}
        </p>
        <h3 className="mt-2 font-display text-2xl font-bold text-ink">
          {series.name}
        </h3>
        <Button
          href={series.youtubePlaylistUrl}
          variant="ghost"
          className="mt-5 w-full justify-between"
        >
          View Series <ExternalLink size={16} />
        </Button>
      </div>
    </article>
  );
}
