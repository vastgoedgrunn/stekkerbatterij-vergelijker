import { ChevronDown } from "lucide-react";
import type { Faq } from "@/features/content/types";

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <div className="divide-border border-border divide-y rounded-xl border">
      {faqs.map((faq) => (
        <details key={faq.id} className="group">
          <summary className="hover:bg-accent/50 flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-medium [&::-webkit-details-marker]:hidden">
            {faq.question}
            <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div className="text-muted-foreground px-4 pb-4">{faq.answer}</div>
        </details>
      ))}
    </div>
  );
}
