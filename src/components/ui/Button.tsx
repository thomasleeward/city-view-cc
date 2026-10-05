import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "light";
  className?: string;
  type?: "button" | "submit";
  style?: React.CSSProperties;
};

const variants = {
  primary: "bg-terracotta text-white hover:bg-[#a65735]",
  secondary: "bg-green text-white hover:bg-[#4a6f63]",
  ghost: "border border-ink/15 text-ink hover:border-terracotta hover:text-terracotta",
  light: "bg-white text-ink hover:bg-cream",
};

function isExternalHref(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

export function Button({
  href,
  children,
  variant = "primary",
  className,
  type = "button",
  style,
}: ButtonProps) {
  const classes = cn(
    "inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-center text-sm font-bold uppercase leading-tight tracking-wide whitespace-normal transition",
    variants[variant],
    className,
  );

  if (href) {
    if (isExternalHref(href)) {
      return (
        <a className={classes} style={style} href={href}>
          {children}
        </a>
      );
    }

    return (
      <Link className={classes} style={style} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} style={style} type={type}>
      {children}
    </button>
  );
}
