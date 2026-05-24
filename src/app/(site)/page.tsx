import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { HomeHero } from "@/components/site/HomeHero";
import { Section } from "@/components/site/Section";
import { SermonSeriesCard } from "@/components/site/SermonSeriesCard";
import { siteConfig } from "@/lib/config";
import { homeContent, ministryCards } from "@/lib/content/site";
import { getHeroSlides, getSermonSeries } from "@/lib/supabase/queries";

export default async function Home() {
  const [slides, sermonSeries] = await Promise.all([
    getHeroSlides(),
    getSermonSeries(),
  ]);
  const latestSeries = sermonSeries.slice(0, 3);

  return (
    <>
      <HomeHero slides={slides} />

      <Section className="bg-white" title="We saved you a seat." eyebrow="Welcome">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div className="space-y-5 text-lg leading-8 text-muted">
            <p>{homeContent.intro}</p>
            <p>
              Thanks for checking out our website. Below you will find our
              service times and location, but there is something we really want
              you to know: your story matters to God, and it matters to us.
            </p>
          </div>
          <div className="rounded-lg bg-cream p-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">
              Service Info
            </p>
            <p className="mt-3 text-2xl font-bold text-ink">
              {siteConfig.serviceTimes}
            </p>
            <p className="mt-3 text-muted">
              {siteConfig.address.line1}
              <br />
              {siteConfig.address.city}, {siteConfig.address.state}{" "}
              {siteConfig.address.postalCode}
            </p>
            <Button href="/get-connected" className="mt-6">
              Plan Your Visit
            </Button>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="#ForSantee"
        title="Find your people. Take your next step."
        description="Kids, students, groups, serving, prayer, and spiritual next steps are all part of getting connected at City View."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {ministryCards.map((card) => (
            <article
              key={card.title}
              className="overflow-hidden rounded-lg bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={card.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl font-bold">{card.title}</h3>
                <p className="mt-3 text-muted">{card.description}</p>
                <Button href={card.href} variant="ghost" className="mt-5">
                  Learn More
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        className="bg-green text-white"
        eyebrow="Current Series"
        title="Catch up on recent messages."
        description="Browse current and past sermon series from City View."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {latestSeries.map((series) => (
            <SermonSeriesCard key={series.id} series={series} />
          ))}
        </div>
        <Button href="/sermon-archive" variant="light" className="mt-8">
          Sermon Archive
        </Button>
      </Section>

      <Section className="bg-white" title="Generosity fuels the mission." eyebrow="Giving">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <p className="max-w-3xl text-lg leading-8 text-muted">
            Your giving helps City View serve families, students, the Santee
            community, and mission partners near and far.
          </p>
          <Button href="/giving" variant="secondary">
            Give Online
          </Button>
        </div>
      </Section>
    </>
  );
}
