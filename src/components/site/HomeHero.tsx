import { HeroCarousel } from "@/components/site/HeroCarousel";
import type { HeroSlide } from "@/lib/supabase/queries";

export function HomeHero({ slides }: { slides: HeroSlide[] }) {
  return <HeroCarousel slides={slides} />;
}
