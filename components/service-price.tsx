import { formatCurrency } from '@/lib/format';
import { formatSpecialWindow } from '@/lib/specials';
import type { BookingService } from '@/lib/types';

type ServicePriceProps = {
  service: Pick<BookingService, 'price' | 'special'>;
  className?: string;
  priceClassName?: string;
  /** Show the "for appointments Oct 1 – Oct 31" line under the price. */
  showWindow?: boolean;
};

/** Regular price, or the regular price struck through beside a limited-time special. */
export function ServicePrice({ service, className = '', priceClassName = '', showWindow = true }: ServicePriceProps) {
  const { special } = service;

  if (!special) {
    return <span className={`${className} ${priceClassName}`}>{formatCurrency(service.price)}</span>;
  }

  return (
    <span className={`inline-flex flex-col ${className}`}>
      <span className="inline-flex flex-wrap items-baseline gap-x-2">
        <s className="text-[0.8em] font-normal opacity-60" aria-label={`Regular price ${formatCurrency(service.price)}`}>
          {formatCurrency(service.price)}
        </s>
        <span className={priceClassName}>{formatCurrency(special.price)}</span>
      </span>
      {showWindow && (
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8B4411]">
          {special.label ? `${special.label} · ` : ''}Appointments {formatSpecialWindow(special)}
        </span>
      )}
    </span>
  );
}
