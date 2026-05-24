import { fallbackSermonSeries, type SermonSeries } from "@/lib/content/sermons";
import { homeContent } from "@/lib/content/site";
import { createClient } from "@/lib/supabase/server";

export type HeroSlide = {
  id: string;
  imageUrl: string | null;
  videoUrl: string | null;
};

export type HeroContent = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
};

const fallbackHeroContent: HeroContent = {
  eyebrow: "City View Community Church",
  headline: homeContent.hero.headline,
  subheadline: homeContent.hero.subheadline,
  ctaLabel: "Plan Your Visit",
  ctaHref: "/get-connected",
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
        imageUrl: homeContent.hero.imageUrl,
        videoUrl: null,
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
        imageUrl: homeContent.hero.imageUrl,
        videoUrl: null,
      },
    ];
  }

  return data.map((slide) => ({
    id: slide.id,
    imageUrl: slide.image_url,
    videoUrl: slide.video_url,
  }));
}

export async function getHeroContent(): Promise<HeroContent> {
  const supabase = await createClient();

  if (!supabase) {
    return fallbackHeroContent;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "homepage_hero")
    .maybeSingle();

  if (error || !data?.value) {
    return fallbackHeroContent;
  }

  const value = data.value;

  return {
    eyebrow:
      typeof value.eyebrow === "string" && value.eyebrow
        ? value.eyebrow
        : fallbackHeroContent.eyebrow,
    headline:
      typeof value.headline === "string" && value.headline
        ? value.headline
        : fallbackHeroContent.headline,
    subheadline:
      typeof value.subheadline === "string" && value.subheadline
        ? value.subheadline
        : fallbackHeroContent.subheadline,
    ctaLabel:
      typeof value.ctaLabel === "string" && value.ctaLabel
        ? value.ctaLabel
        : fallbackHeroContent.ctaLabel,
    ctaHref:
      typeof value.ctaHref === "string" && value.ctaHref
        ? value.ctaHref
        : fallbackHeroContent.ctaHref,
  };
}
