import {type BackgroundSection} from '@/lib/proofadmin/section-background-surface';
import { HeroCarousel } from "@/components/site/HeroCarousel";
import type { HeroContent, HeroSlide } from "@/lib/supabase/queries";

export function HomeHero({backgroundSection,
  content,
  slides,
}: {
  backgroundSection?:BackgroundSection;
  content: HeroContent;
  slides: HeroSlide[];
}) {
  return <HeroCarousel backgroundSection={backgroundSection} content={content} slides={slides} />;
}
