"use client";

import { Clipboard } from "lucide-react";

export function CopyButton({ value }: { value: string }) {
  return (
    <button
      className="inline-flex size-9 items-center justify-center rounded-md border border-ink/10 bg-white text-ink transition hover:border-terracotta hover:text-terracotta"
      type="button"
      aria-label={`Copy ${value}`}
      title={`Copy ${value}`}
      onClick={() => navigator.clipboard.writeText(value)}
    >
      <Clipboard size={16} />
    </button>
  );
}

