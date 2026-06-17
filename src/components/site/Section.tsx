import { cn } from "@/lib/utils";

type SectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
};

export function Section({
  eyebrow,
  title,
  description,
  children,
  className,
  innerClassName,
}: SectionProps) {
  return (
    <section className={cn("py-16 sm:py-24", className)}>
      <div className={cn("mx-auto w-full max-w-6xl px-5", innerClassName)}>
        {(eyebrow || title || description) && (
          <div className="mb-10 max-w-3xl">
            {eyebrow && (
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-terracotta">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-lg leading-8 text-muted">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
