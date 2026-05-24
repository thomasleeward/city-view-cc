import { HeroCarousel } from "@/components/site/HeroCarousel";
import type { HeroContent, HeroSlide } from "@/lib/supabase/queries";

export function HomeHero({
  content,
  slides,
}: {
  content: HeroContent;
  slides: HeroSlide[];
}) {
  return <HeroCarousel content={content} slides={slides} />;
}
