import { fallbackSermonSeries, type SermonSeries } from "@/lib/content/sermons";
import { homeContent } from "@/lib/content/site";
import { createClient } from "@/lib/supabase/server";

export type HeroSlide = {
  id: string;
  headline: string;
  subheadline: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export async function getSermonSeries(): Promise<SermonSeries[]> {
  const supabase = await createClient();

  if (!supabase) {
    return fallbackSermonSeries;
  }

  const { data, error } = await supabase
    .from("sermon_series")
    .select("*")
    .eq("is_published", true)
    .order("start_date", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    return fallbackSermonSeries;
  }

  return data.map((series) => ({
    id: series.id,
    name: series.name,
    dateLabel: series.date_label,
    startDate: series.start_date,
    endDate: series.end_date,
    imageUrl: series.image_url,
    youtubePlaylistUrl: series.youtube_playlist_url,
    isPublished: series.is_published,
  }));
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [
      {
        id: "fallback",
        headline: homeContent.hero.headline,
        subheadline: homeContent.hero.subheadline,
        imageUrl: homeContent.hero.imageUrl,
        videoUrl: null,
        ctaLabel: "Plan Your Visit",
        ctaHref: "/get-connected",
      },
    ];
  }

  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return [
      {
        id: "fallback",
        headline: homeContent.hero.headline,
        subheadline: homeContent.hero.subheadline,
        imageUrl: homeContent.hero.imageUrl,
        videoUrl: null,
        ctaLabel: "Plan Your Visit",
        ctaHref: "/get-connected",
      },
    ];
  }

  return data.map((slide) => ({
    id: slide.id,
    headline: slide.headline,
    subheadline: slide.subheadline,
    imageUrl: slide.image_url,
    videoUrl: slide.video_url,
    ctaLabel: slide.cta_label,
    ctaHref: slide.cta_href,
  }));
}
