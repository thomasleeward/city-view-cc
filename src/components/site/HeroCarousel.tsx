"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { HeroContent, HeroSlide } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";

type HeroCarouselProps = {
  content: HeroContent;
  slides: HeroSlide[];
};

export function HeroCarousel({ content, slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex] ?? slides[0];

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!activeSlide) return null;

  return (
    <div className="relative min-h-[680px] overflow-hidden bg-ink text-white">
      {activeSlide.videoUrl ? (
        <video
          className="absolute inset-0 size-full object-cover"
          src={activeSlide.videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : activeSlide.imageUrl ? (
        <Image
          src={activeSlide.imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-green" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/20" />
      <div className="relative mx-auto flex min-h-[680px] max-w-6xl flex-col justify-end px-5 pb-20 pt-32">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gold">
          {content.eyebrow}
        </p>
        <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.02] sm:text-7xl">
          {content.headline}
        </h1>
        {content.subheadline && (
          <p className="mt-6 max-w-2xl text-xl leading-8 text-white/85">
            {content.subheadline}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href={content.ctaHref} variant="light">
            {content.ctaLabel}
          </Button>
          <Button href="/sermon-archive" variant="secondary">
            Watch Sermons
          </Button>
        </div>
        {slides.length > 1 && (
          <div className="mt-10 flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                aria-label={`Show slide ${index + 1}`}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  index === activeIndex ? "w-10 bg-gold" : "w-2.5 bg-white/50",
                )}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
