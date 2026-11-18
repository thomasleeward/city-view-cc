import {withSectionBackground,type BackgroundSection} from '@/lib/proofadmin/section-background-surface';

import {RichInline,richPlainText} from "@/lib/proofadmin/rich-text";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  backgroundSection?:BackgroundSection;
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function PageHero({backgroundSection, eyebrow, title, description, className }: PageHeroProps) {
  return withSectionBackground((
    <section className={cn("bg-green py-16 text-white sm:py-24", className)}>
      <div className="mx-auto max-w-6xl px-5">
        {eyebrow && (
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gold">
            <RichInline text={eyebrow}/>
          </p>
        )}
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl lg:text-7xl">
          <RichInline text={title}/>
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            <RichInline text={description}/>
          </p>
        )}
      </div>
    </section>
  ),backgroundSection??{appearance:{background:"transparent",overlay:"#000000",opacity:0}});
}
