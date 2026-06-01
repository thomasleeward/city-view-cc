import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <Link href="/" className="relative block h-16 w-64 max-w-full">
            <Image
              src="/cityviewlogo.png"
              alt={siteConfig.name}
              fill
              sizes="256px"
              className="object-contain object-left brightness-0 invert"
            />
          </Link>
          <p className="mt-4 max-w-md text-white/70">
            Discover your purpose. Live on mission. We would love to meet you
            this Sunday in Santee.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">
            Sundays
          </p>
          <p className="mt-3">{siteConfig.serviceTimes}</p>
          <p className="mt-2 text-white/70">
            {siteConfig.address.line1}
            <br />
            {siteConfig.address.city}, {siteConfig.address.state}{" "}
            {siteConfig.address.postalCode}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">
            Follow
          </p>
          <div className="mt-4 flex gap-3">
            <Link className="font-bold hover:text-gold" href={siteConfig.social.facebook}>
              Facebook
            </Link>
            <Link className="font-bold hover:text-gold" href={siteConfig.social.instagram}>
              Instagram
            </Link>
            <Link className="font-bold hover:text-gold" href={siteConfig.social.youtube}>
              YouTube
            </Link>
          </div>
          <div className="mt-5 grid gap-2 text-white/70">
            <Link className="hover:text-gold" href="/assessments">
              Assessments
            </Link>
            <Link className="hover:text-gold" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-sm text-white/50">
        (c) {new Date().getFullYear()} City View Community Church
      </div>
    </footer>
  );
}
