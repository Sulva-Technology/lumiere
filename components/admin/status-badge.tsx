import { cn } from '@/lib/utils';

const BRAND_TONE = 'border border-[#8B4411]/20 bg-[rgba(139,68,17,0.12)] text-[#8B4411]';
const NEUTRAL_TONE = 'border border-[#8B4411]/15 bg-white/50 text-[var(--text-secondary)]';
const PENDING_TONE = 'border border-amber-500/25 bg-amber-500/10 text-amber-700';
const NEGATIVE_TONE = 'border border-red-500/25 bg-red-500/10 text-red-600';

const STATUS_TONES: Record<string, string> = {
  paid: BRAND_TONE,
  processing: 'border border-sky-500/25 bg-sky-500/10 text-sky-700',
  confirmed: 'border border-sky-500/25 bg-sky-500/10 text-sky-700',
  delivered: BRAND_TONE,
  shipped: 'border border-violet-500/25 bg-violet-500/10 text-violet-700',
  pending: PENDING_TONE,
  pending_payment: PENDING_TONE,
  authorized: PENDING_TONE,
  reserved: PENDING_TONE,
  refunded: 'border border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-700',
  cancelled: NEUTRAL_TONE,
  expired: NEUTRAL_TONE,
  payment_failed: NEGATIVE_TONE,
  failed: NEGATIVE_TONE,
  unfulfilled: NEUTRAL_TONE,
  completed: BRAND_TONE,
};

type AdminStatusBadgeProps = {
  status: string;
  label?: string;
  className?: string;
};

function prettifyStatus(status: string) {
  return status.replace(/_/g, ' ');
}

export function AdminStatusBadge({ status, label, className }: AdminStatusBadgeProps) {
  const normalized = status.trim().toLowerCase();
  const text = label ?? prettifyStatus(status);

  return (
    <span
      title={text}
      className={cn(
        'inline-flex max-w-full items-center truncate rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em]',
        STATUS_TONES[normalized] ?? NEUTRAL_TONE,
        className
      )}
    >
      {text}
    </span>
  );
}
