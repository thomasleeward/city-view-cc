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
        <div className="grid gap-6">
          <article className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-center font-display text-4xl font-bold text-ink">
                Following Jesus
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-8 text-muted">
                <p>
                  If you are considering making a decision to follow Christ,
                  please know that asking Christ to be your Savior and Lord means
                  you are entering into a relationship with God, whose very
                  essence is love. While it does not mean that you will not have
                  difficulties and struggles in life, it does mean that you will
                  never walk through those difficulties alone. God promises in
                  His Word, &quot;I will never leave you or forsake you.&quot;
                  Hebrews 13:5.
                </p>
                <p>
                  The decision to follow Jesus is the most important decision you
                  could ever make. At City View Community Church, we want to walk
                  alongside you and offer resources for wherever you may
                  currently be in your spiritual journey. The story of God&apos;s
                  choice to redeem each of us is what we call the
                  &quot;Gospel.&quot; Here it is, in a nutshell:
                </p>
              </div>

              <div className="mt-10 grid gap-8 text-center">
                <div>
                  <h3 className="font-display text-3xl font-bold text-ink">
                    Our Sin
                  </h3>
                  <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-muted">
                    We are all born with a sin nature. Because of our sin, we
                    are unable to have a relationship with God without
                    forgiveness.
                  </p>
                  <p className="mx-auto mt-5 max-w-2xl text-lg italic leading-8 text-green">
                    For everyone has sinned; we all fall short of God&apos;s
                    glorious standard. Romans 3:23
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-3xl font-bold text-ink">
                    God&apos;s Gift
                  </h3>
                  <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-muted">
                    We can&apos;t earn God&apos;s forgiveness - it must be
                    given. Jesus gave His life as a sacrifice so that we could be
                    forgiven.
                  </p>
                  <p className="mx-auto mt-5 max-w-2xl text-lg italic leading-8 text-green">
                    But God showed his great love for us by sending Christ to die
                    for us while we were still sinners. Romans 5:8
                  </p>
                  <p className="mx-auto mt-4 max-w-2xl text-lg italic leading-8 text-green">
                    For the wages of sin is death, but the free gift of God is
                    eternal life through Christ Jesus our Lord. Romans 6:23
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-3xl font-bold text-ink">
                    Our Response
                  </h3>
                  <p className="mx-auto mt-3 max-w-3xl text-lg leading-8 text-muted">
                    We must accept this free gift from God by committing our
                    lives and heart to Jesus.
                  </p>
                  <p className="mx-auto mt-5 max-w-2xl text-lg italic leading-8 text-green">
                    If you openly declare that Jesus is Lord and believe in your
                    heart that God raised him from the dead, you will be saved.
                    Romans 10:9
                  </p>
                </div>
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
              <button
                className="mt-6 inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md bg-terracotta/60 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white"
                disabled
                type="button"
              >
                Registration Coming Soon
              </button>
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
