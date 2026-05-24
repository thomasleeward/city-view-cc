import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SermonSeriesCard } from "@/components/site/SermonSeriesCard";
import { YouTubePlaylistEmbed } from "@/components/site/YouTubePlaylistEmbed";
import { getSermonSeries } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Sermon Archive",
  description: "Browse current and past sermon series from City View.",
};

export default async function SermonArchivePage() {
  const series = await getSermonSeries();
  const latest = series[0];
  const archiveSeries = latest ? series.slice(1) : series;

  return (
    <>
      <PageHero
        eyebrow="Watch"
        title="Sermon Archive"
        description="Browse current and past sermon series, newest first."
      />
      <Section>
        {latest && (
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <YouTubePlaylistEmbed
              url={latest.youtubePlaylistUrl}
              title={`${latest.name} playlist`}
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">
                Latest Series
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">
                {latest.name}
              </h2>
              <p className="mt-3 text-lg text-muted">{latest.dateLabel}</p>
            </div>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {archiveSeries.map((item) => (
            <SermonSeriesCard key={item.id} series={item} />
          ))}
        </div>
      </Section>
    </>
  );
}
