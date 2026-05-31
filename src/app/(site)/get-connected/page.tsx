import Image from "next/image";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Get Connected",
  description: "Kids, students, groups, baptism, prayer, and serving at City View.",
};

const serveTeams = [
  "City Kids",
  "Student Ministry",
  "First Impressions",
  "Worship & Production",
  "Special Events",
  "Mid-week Prep",
];

export default function GetConnectedPage() {
  const connectHref = siteConfig.external.connect || "/events";
  const prayerHref = siteConfig.external.prayerRequest || `mailto:${siteConfig.email}`;

  return (
    <>
      <PageHero
        eyebrow="Get Connected"
        title="Life is better in community."
        description="Take your next step through kids, students, groups, baptism, serving, or prayer."
      />
      <Section title="Kids & Students" eyebrow="Families">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-lg bg-white p-5 shadow-sm">
            <div className="relative aspect-video overflow-hidden rounded-md">
              <Image
                src="/CityViewKids.png"
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <h2 className="mt-5 font-display text-3xl font-bold">City Kids</h2>
            <p className="mt-2 font-bold text-terracotta">Birth - 5th Grade</p>
            <p className="mt-4 leading-7 text-muted">
              Every Sunday, City Kids creates an age-specific experience where
              kids play, learn about Jesus, and learn they were born with a
              purpose.
            </p>
          </article>
          <article className="rounded-lg bg-white p-5 shadow-sm">
            <div className="relative aspect-video overflow-hidden rounded-md">
              <Image
                src="/CityViewStudents.png"
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <h2 className="mt-5 font-display text-3xl font-bold">Student Meetup</h2>
            <p className="mt-2 font-bold text-terracotta">
              Middle - High School
            </p>
            <p className="mt-4 leading-7 text-muted">
              Students meet upstairs after worship to talk through doubts,
              ideas, wins, and struggles while discovering how God is involved
              in their lives.
            </p>
          </article>
        </div>
      </Section>
      <Section className="bg-white" title="Connect Groups & Class" eyebrow="Connect">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-cream p-6">
            <h2 className="font-display text-3xl font-bold">Connect Groups</h2>
            <p className="mt-4 leading-7 text-muted">
              We were never meant to do life alone. Groups help you grow deeper
              in faith, build friendships, and feel right at home.
            </p>
            <Button href={connectHref} className="mt-6">
              Sign Up for a Group
            </Button>
          </div>
          <div className="rounded-lg bg-cream p-6">
            <h2 className="font-display text-3xl font-bold">Connect Class</h2>
            <p className="mt-4 leading-7 text-muted">
              Learn more about who we are, who God created you to be, and how
              you can connect and live on mission.
            </p>
            <Button href={connectHref} className="mt-6">
              Sign Up for Connect Class
            </Button>
          </div>
        </div>
      </Section>
      <Section title="Spiritual Next Steps" eyebrow="Faith">
        <div className="grid gap-6 md:grid-cols-3">
          {["Following Jesus", "Baptism", "Read The Bible"].map((title) => (
            <div key={title} className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl font-bold">{title}</h2>
              <p className="mt-3 leading-7 text-muted">
                TODO: Expand this with the full copied content from the current
                Get Connected page and Planning Center form links.
              </p>
            </div>
          ))}
        </div>
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
      <Section title="Need someone to pray with you?" eyebrow="Prayer">
        <p className="max-w-3xl text-lg leading-8 text-muted">
          Our Prayer Team would love to connect with you and pray for whatever
          you might need.
        </p>
        <Button href={prayerHref} className="mt-6">
          Submit Prayer Request
        </Button>
      </Section>
    </>
  );
}
