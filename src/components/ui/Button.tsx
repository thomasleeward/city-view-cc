import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "light";
  className?: string;
  type?: "button" | "submit";
};

const variants = {
  primary: "bg-terracotta text-white hover:bg-[#a65735]",
  secondary: "bg-green text-white hover:bg-[#4a6f63]",
  ghost: "border border-ink/15 text-ink hover:border-terracotta hover:text-terracotta",
  light: "bg-white text-ink hover:bg-cream",
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
  type = "button",
}: ButtonProps) {
  const classes = cn(
    "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-bold uppercase tracking-wide transition",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type}>
      {children}
    </button>
  );
}
