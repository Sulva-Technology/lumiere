import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { MarketingFaqItem } from '@/lib/marketing-content';

export function FaqAccordion({
  items,
  className,
}: {
  items: readonly MarketingFaqItem[];
  className?: string;
}) {
  return (
    <div className={cn('overflow-hidden rounded-[28px] border border-border-soft bg-surface-primary shadow-shadow-soft backdrop-blur-sm divide-y divide-border-soft', className)}>
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex list-none items-center justify-between gap-6 px-6 py-5 text-left marker:hidden sm:px-8">
            <span className="font-serif text-xl text-heading-primary">{item.question}</span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold transition-transform duration-300 group-open:rotate-180">
              <ChevronDown size={18} />
            </span>
          </summary>
          <div className="px-6 pb-6 pt-0 sm:px-8">
            <p className="max-w-3xl leading-relaxed text-text-secondary">{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
