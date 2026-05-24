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
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <div className="relative min-h-[680px] overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 bg-green" />
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-[1600ms] ease-in-out",
            index === activeIndex ? "opacity-100" : "opacity-0",
          )}
        >
          {slide.videoUrl ? (
            <video
              className="size-full object-cover"
              src={slide.videoUrl}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : slide.imageUrl ? (
            <Image
              src={slide.imageUrl}
              alt=""
              fill
              priority={index === 0}
              quality={95}
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/20" />
      <div className="relative mx-auto flex min-h-[680px] max-w-6xl flex-col justify-end px-5 pb-20 pt-32">
        <p className="mb-4 w-fit rounded-full bg-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-sm">
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
