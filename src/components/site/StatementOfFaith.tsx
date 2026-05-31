"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

type BeliefStatement = {
  title: string;
  preview: string;
  statement: string;
};

type StatementOfFaithProps = {
  intro: string;
  statements: BeliefStatement[];
};

export function StatementOfFaith({
  intro,
  statements,
}: StatementOfFaithProps) {
  const [openTitles, setOpenTitles] = useState<Set<string>>(new Set());

  function toggleStatement(title: string) {
    setOpenTitles((current) => {
      const next = new Set(current);

      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }

      return next;
    });
  }

  return (
    <div className="space-y-6">
      <p className="max-w-5xl text-lg leading-8 text-muted">{intro}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {statements.map((belief) => {
          const isOpen = openTitles.has(belief.title);
          const statementId = `belief-${belief.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}`;

          return (
            <article
              key={belief.title}
              className="rounded-lg border border-ink/10 bg-white shadow-sm transition hover:border-terracotta/40"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={statementId}
                onClick={() => toggleStatement(belief.title)}
                className="flex h-full min-h-36 w-full items-start gap-4 p-5 text-left"
              >
                <span className="flex-1">
                  <span className="block text-sm font-bold uppercase tracking-[0.16em] text-terracotta">
                    {belief.title}
                  </span>
                  <span className="mt-3 block text-lg leading-8 text-muted">
                    {belief.preview}
                  </span>
                </span>
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink transition">
                  <Plus
                    aria-hidden="true"
                    className={`size-5 transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </span>
              </button>
              {isOpen ? (
                <div
                  id={statementId}
                  className="border-t border-ink/10 px-5 pb-5 pt-4"
                >
                  <p className="leading-7 text-muted">{belief.statement}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
