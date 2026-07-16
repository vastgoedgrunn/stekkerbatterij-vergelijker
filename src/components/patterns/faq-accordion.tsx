import { Plus } from "lucide-react";
import type { Faq } from "@/features/content/types";

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <details
          key={faq.id}
          className="border-border bg-card group rounded-2xl border px-5 transition-colors open:shadow-[var(--shadow-sm)]"
        >
          <summary className="focus-visible:ring-ring/50 flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl py-4 font-semibold outline-none focus-visible:ring-[3px] [&::-webkit-details-marker]:hidden">
            {faq.question}
            <span
              aria-hidden
              className="bg-muted text-muted-foreground group-open:bg-primary group-open:text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full transition-all group-open:rotate-45"
            >
              <Plus className="size-4" />
            </span>
          </summary>
          <div className="text-muted-foreground pb-5 leading-relaxed">{faq.answer}</div>
        </details>
      ))}
    </div>
  );
}
