import Image from "next/image";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { StatementOfFaith } from "@/components/site/StatementOfFaith";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Get Connected",
  description: "Discover purpose, live on mission, and take spiritual next steps at City View.",
};

const serveTeams = [
  "City Kids",
  "Student Ministry",
  "First Impressions",
  "Worship & Production",
  "Special Events",
  "Mid-week Prep",
];

const discoverPurposeCards = [
  {
    title: "Connect Group",
    imageUrl: "/img/Connect Group.png",
    description:
      "Every May - June, we bring all of our home groups together as one on Wednesdays from 6:30-8pm. We have themed dinner nights with childcare provided. Come grow in community and faith with us! We take a break from groups in July + August and kick off Home Groups back in September.",
    cta: "View Group Events",
  },
  {
    title: "Home Group",
    imageUrl: "/img/Home Group.png",
    description:
      "Every February - March and September - October, we have groups geared towards any season you may be in. You weren't meant to do life alone, so come jump into community and let's grow together. We take a break from groups in July + August and kick off Home Groups back in September.",
    cta: "View Group Events",
  },
];

const gospelIntro =
  "If you are considering making a decision to follow Christ, please know that asking Christ to be your Savior and Lord means you are entering into a relationship with God, whose very essence is love. While it does not mean that you will not have difficulties and struggles in life, it does mean that you will never walk through those difficulties alone. God promises in His Word, \"I will never leave you or forsake you.\" Hebrews 13:5. The decision to follow Jesus is the most important decision you could ever make. At City View Community Church, we want to walk alongside you and offer resources for wherever you may currently be in your spiritual journey. The story of God's choice to redeem each of us is what we call the \"Gospel.\" Here it is, in a nutshell:";

const gospelStatements = [
  {
    title: "Our Sin",
    preview:
      "We are all born with a sin nature and need forgiveness to have a relationship with God.",
    statement:
      "Because of our sin, we are unable to have a relationship with God without forgiveness.\n\nFor everyone has sinned; we all fall short of God's glorious standard. Romans 3:23",
  },
  {
    title: "God's Gift",
    preview:
      "We can't earn God's forgiveness. Jesus gave His life so that we could be forgiven.",
    statement:
      "But God showed his great love for us by sending Christ to die for us while we were still sinners. Romans 5:8\n\nFor the wages of sin is death, but the free gift of God is eternal life through Christ Jesus our Lord. Romans 6:23",
  },
  {
    title: "Our Response",
    preview:
      "We accept this free gift from God by committing our lives and hearts to Jesus.",
    statement:
      "If you openly declare that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved. Romans 10:9",
  },
];

export default function GetConnectedPage() {
  const connectHref = "/events";
  const prayerHref = siteConfig.external.prayerRequest || `mailto:${siteConfig.email}`;

  return (
    <>
      <PageHero
        eyebrow="Get Connected"
        title="Life is better in community."
        description="Discover purpose, live on mission, and take your next step in faith."
      />
      <Section className="bg-white" title="Discover Purpose" eyebrow="Connect">
        <div className="grid gap-6 md:grid-cols-2">
          {discoverPurposeCards.map((card) => (
            <article key={card.title} className="rounded-lg bg-cream p-5">
              <div className="relative aspect-video overflow-hidden rounded-md">
                <Image
                  src={card.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <h2 className="mt-5 font-display text-3xl font-bold">
                {card.title}
              </h2>
              <p className="mt-4 leading-7 text-muted">{card.description}</p>
              <Button href={connectHref} className="mt-6">
                {card.cta}
              </Button>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Live on Mission" eyebrow="Purpose">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src="/img/Discovery Workshop.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <article className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-3xl font-bold text-ink">
              Discovery Workshop
            </h2>
            <div className="mt-4 space-y-4 leading-7 text-muted">
              <p>
                Life comes in many changing seasons and in these seasons, it
                brings many questions to the surface. In this workshop, we will
                work through those to get to the heart of how to activate and
                align with His purpose for your life in your current season!
              </p>
              <p>
                Here are a couple questions, along with more, we will be
                discovering together: What is God saying to our church? What is
                God saying to you?
              </p>
              <p>
                This is also an intentional time to learn more about our church,
                how you are uniquely gifted and wired, and take your next step
                in Living on Mission.
              </p>
              <p>
                We&apos;ll provide snacks, childcare and the resources for you!
                RSVP to let us know you are coming!
              </p>
              <p>
                This class happens the last Sunday of every month, except
                December, following the 10:30a service, upstairs in our Student
                Center.
              </p>
            </div>
            <Button href={connectHref} className="mt-6">
              RSVP for Discovery Workshop
            </Button>
          </article>
        </div>
      </Section>
      <Section title="Spiritual Next Steps" eyebrow="Faith">
        <div className="grid gap-6">
          <article className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
            <div className="mx-auto max-w-5xl text-left">
              <h2 className="font-display text-4xl font-bold text-ink">
                Following Jesus
              </h2>
              <div className="mt-6">
                <StatementOfFaith
                  intro={gospelIntro}
                  statements={gospelStatements}
                >
                  <div className="flex min-h-36 items-center rounded-lg border border-terracotta/20 bg-cream p-6 shadow-sm">
                    <p className="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
                      This is the most important decision you&apos;ll ever make.
                    </p>
                  </div>
                </StatementOfFaith>
              </div>
            </div>
          </article>

          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-3xl font-bold text-ink">
                Baptism
              </h2>
              <p className="mt-4 leading-7 text-muted">
                If you have accepted Christ as your Savior, your next step is to
                follow Christ&apos;s example and &quot;go public&quot; with your
                faith through baptism. As your church family, we love to
                celebrate this special moment with you!
              </p>
              <Button href={connectHref} className="mt-6">
                View Baptism Events
              </Button>
            </article>

            <article className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-3xl font-bold text-ink">
                Read The Bible
              </h2>
              <p className="mt-4 leading-7 text-muted">
                If you are new to Christianity or you&apos;re simply looking to
                build a solid foundation for your faith, this resource below
                could be very helpful to you.
              </p>
              <Button
                href="https://www.bible.com/reading-plans/1808-whats-next"
                className="mt-6"
              >
                Bible Study
              </Button>
            </article>
          </div>
        </div>
      </Section>
      <Section title="Need someone to pray with you?" eyebrow="Prayer">
        <p className="max-w-3xl text-lg leading-8 text-muted">
          Our Prayer Team would love to connect with you and pray for whatever
          you might need.
        </p>
        <Button href={prayerHref} className="mt-6">
          Submit Prayer Request
        </Button>
      </Section>
      <Section className="bg-green text-white">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-gold">
            Serve
          </p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-5xl">
            Join A Team
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {serveTeams.map((team) => (
            <div key={team} className="rounded-lg bg-white/10 p-4 font-semibold">
              {team}
            </div>
          ))}
        </div>
        <Button href={connectHref} variant="light" className="mt-8">
          Ready to Join a Team
        </Button>
      </Section>
    </>
  );
}
