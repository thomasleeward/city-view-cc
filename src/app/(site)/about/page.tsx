import Image from "next/image";
import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { StatementOfFaith } from "@/components/site/StatementOfFaith";
import {
  beliefIntro,
  beliefStatements,
  leadPastors,
  teamMembers,
} from "@/lib/content/site";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn the story, vision, values, team, and beliefs of City View.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Your story matters here."
        description="City View launched in August 2021 with a heart for people to discover their purpose and live on mission."
      />
      <Section title="Our Story">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src="https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/site-images/site/our-story.jpeg"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-5 text-lg leading-8 text-muted">
            <p>
              City View Community Church launched in August of 2021, but that
              was not where the story begins. Our church is the culmination of
              two great churches coming together on the other side of our world
              changing in 2020.
            </p>
            <p>
              From the start, our church has had a deep heart for people to
              discover their purpose and to live on mission. Our hope is that
              the moment you connect with us, whether online or in person, you
              recognize that your story really matters.
            </p>
          </div>
        </div>
      </Section>
      <Section className="bg-white" title="Meet Our Team" eyebrow="People">
        <article className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-full">
            <Image
              src={leadPastors.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="text-center lg:text-left">
            <h2 className="font-display text-4xl font-bold">
              {leadPastors.name}
            </h2>
            <p className="mt-2 text-2xl text-ink">{leadPastors.role}</p>
            <a
              className="mt-2 block font-semibold text-terracotta"
              href={`mailto:${leadPastors.email}`}
            >
              {leadPastors.email}
            </a>
            <div className="mx-auto my-6 h-px w-64 max-w-full bg-ink/20 lg:mx-0" />
            <div className="space-y-5 text-lg leading-8 text-muted">
              {leadPastors.bio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((person) => (
            <article key={person.name} className="rounded-lg bg-cream p-4">
              <div className="relative aspect-square overflow-hidden rounded-md">
                <Image
                  src={person.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold">{person.name}</h3>
              {person.role ? (
                <p className="font-semibold text-terracotta">{person.role}</p>
              ) : null}
              <a className="mt-2 block text-sm text-muted" href={`mailto:${person.email}`}>
                {person.email}
              </a>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Statement of Faith" eyebrow="Beliefs">
        <StatementOfFaith intro={beliefIntro} statements={beliefStatements} />
      </Section>
    </>
  );
}
