import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { HomeHero } from "@/components/site/HomeHero";
import { Section } from "@/components/site/Section";
import { SermonSeriesCard } from "@/components/site/SermonSeriesCard";
import { siteConfig } from "@/lib/config";
import { homeContent, ministryCards } from "@/lib/content/site";
import {
  getHeroContent,
  getHeroSlides,
  getSermonSeries,
} from "@/lib/supabase/queries";

export default async function Home() {
  const [heroContent, slides, sermonSeries] = await Promise.all([
    getHeroContent(),
    getHeroSlides(),
    getSermonSeries(),
  ]);
  const latestSeries = sermonSeries.slice(0, 3);

  return (
    <>
      <HomeHero content={heroContent} slides={slides} />

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
        title="A church for the whole family."
        description="A place where your kids can also discover purpose and learn how to live on mission."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {ministryCards.map((card) => (
            <article
              key={card.title}
              className="overflow-hidden rounded-lg bg-white shadow-sm"
            >
              <div className="relative aspect-video">
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
                {"details" in card && card.details ? (
                  <div className="mt-3 space-y-1 font-bold text-terracotta">
                    {card.details.map((detail) => (
                      <p key={detail}>{detail}</p>
                    ))}
                  </div>
                ) : null}
                <p className="mt-3 text-muted">{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section className="bg-green text-white">
        <div className="mb-10 max-w-4xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-gold">
            Current Series
          </p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-5xl">
            Catch up on recent messages.
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/80">
            Browse current and past sermon series from City View.
          </p>
        </div>
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

      <section className="bg-[#ee5f01] py-12 text-white sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">
              RightNow Media
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">
              Free access for City View members.
            </h2>
            <p className="mt-5 max-w-4xl text-lg leading-8 text-white/90">
              Our church believes that RightNow Media is a tool that can help
              you live out your faith in every area of your life: at home, at
              work, and in your community. In addition to series on books of the
              Bible, RightNow Media has videos for everyone in your family on a
              variety of topics like marriage, parenting, personal finances,
              mental health, and more. There&apos;s even a library just for kids
              with over 2,000 safe, entertaining videos. RightNow Media has a
              free app that&apos;s available on all major streaming devices so you
              and your family can access content anywhere, anytime.
            </p>
          </div>
          <Button
            href="https://app.rightnowmedia.org/en/join/cityviewcommunitychurch"
            variant="light"
            className="w-full lg:w-auto"
          >
            Login or Sign Up
          </Button>
        </div>
      </section>
    </>
  );
}
