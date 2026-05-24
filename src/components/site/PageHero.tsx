import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function PageHero({ eyebrow, title, description, className }: PageHeroProps) {
  return (
    <section className={cn("bg-green py-16 text-white sm:py-24", className)}>
      <div className="mx-auto max-w-6xl px-5">
        {eyebrow && (
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gold">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl font-display text-5xl font-bold sm:text-7xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
