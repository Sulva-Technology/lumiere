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
    <div className={cn('divide-y divide-[rgba(58,77,57,0.14)] overflow-hidden rounded-[28px] border border-[rgba(58,77,57,0.14)] bg-white/70 shadow-[0_24px_80px_rgba(43,49,38,0.08)] backdrop-blur-sm dark:divide-[rgba(154,177,143,0.14)] dark:border-[rgba(154,177,143,0.18)] dark:bg-[rgba(12,21,16,0.72)]', className)}>
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex list-none items-center justify-between gap-6 px-6 py-5 text-left marker:hidden sm:px-8">
            <span className="font-serif text-xl text-[var(--heading-primary)] dark:text-white">{item.question}</span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(139,105,20,0.12)] text-[#8B6914] transition-transform duration-300 group-open:rotate-180 dark:bg-[rgba(212,168,71,0.14)] dark:text-[#F0D080]">
              <ChevronDown size={18} />
            </span>
          </summary>
          <div className="px-6 pb-6 pt-0 sm:px-8">
            <p className="max-w-3xl leading-relaxed text-[var(--text-secondary)]">{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
