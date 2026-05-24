import Image from "next/image";
import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { beliefSummaries, teamMembers } from "@/lib/content/site";

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
              src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TgdpRjDTCwsCEKFTusIi/media/62fcb98770c46d457a17882c.jpeg"
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="font-semibold text-terracotta">{person.role}</p>
              <a className="mt-2 block text-sm text-muted" href={`mailto:${person.email}`}>
                {person.email}
              </a>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Statement of Faith" eyebrow="Beliefs">
        <div className="grid gap-4 md:grid-cols-2">
          {beliefSummaries.map((belief) => (
            <div key={belief} className="rounded-lg border border-ink/10 bg-white p-5">
              <p className="leading-7 text-muted">{belief}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-6 text-muted">
          TODO: Copy the full Statement of Faith from the current About Us page
          into a dedicated long-form section or CMS-managed content block.
        </p>
      </Section>
    </>
  );
}
