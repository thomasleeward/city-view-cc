"use client";

import type {SiteConfiguration} from "@/lib/proofadmin/site-configuration";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const defaultNavItems = [
  { label: "About", href: "/about" },
  { label: "Connect", href: "/get-connected" },
  { label: "Sermons", href: "/sermon-archive" },
  { label: "Events", href: siteConfig.external.events },
];

export function Header({configuration}:{configuration?:SiteConfiguration}) {
  const navItems=configuration?configuration.navigation.filter(n=>n.location==='header'&&n.is_visible).sort((a,b)=>a.sort_order-b.sort_order).map(n=>({label:n.label,href:n.action_kind==='url'?n.action_value:n.action_kind==='page'?'/'+n.action_value:n.action_kind==='section'?'/#'+n.action_value:'/?screen='+n.action_value})):defaultNavItems;
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="relative block h-16 w-56 sm:w-72">
          <Image
            src="/cityviewlogo.png"
            alt="City View Community Church"
            fill
            priority
            sizes="(min-width: 640px) 288px, 224px"
            className="object-contain object-left"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-bold uppercase tracking-wide text-ink/75 transition hover:text-terracotta"
            >
              {item.label}
            </Link>
          ))}
          <Button href="/giving" variant="secondary" className="min-h-10 px-4 py-2">
            Give
          </Button>
        </nav>

        <button
          aria-label="Toggle navigation"
          className="inline-flex size-11 items-center justify-center rounded-md border border-ink/10 md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-ink/10 bg-cream px-5 py-4 md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto grid max-w-6xl gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-3 text-sm font-bold uppercase tracking-wide text-ink hover:bg-white"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Button href="/giving" variant="secondary" className="mt-2 w-full">
            Give
          </Button>
        </nav>
      </div>
    </header>
  );
}
