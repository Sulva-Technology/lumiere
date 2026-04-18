import { cn } from '@/lib/utils';

const STATUS_TONES: Record<string, string> = {
  paid: 'border border-emerald-300/20 bg-emerald-400/12 text-emerald-100',
  processing: 'border border-sky-300/20 bg-sky-400/12 text-sky-100',
  confirmed: 'border border-sky-300/20 bg-sky-400/12 text-sky-100',
  delivered: 'border border-emerald-300/20 bg-emerald-400/12 text-emerald-100',
  shipped: 'border border-violet-300/20 bg-violet-400/12 text-violet-100',
  pending: 'border border-[rgba(212,168,71,0.22)] bg-[rgba(212,168,71,0.12)] text-[#f4ddb2]',
  pending_payment: 'border border-[rgba(212,168,71,0.22)] bg-[rgba(212,168,71,0.12)] text-[#f4ddb2]',
  authorized: 'border border-[rgba(212,168,71,0.22)] bg-[rgba(212,168,71,0.12)] text-[#f4ddb2]',
  reserved: 'border border-[rgba(212,168,71,0.22)] bg-[rgba(212,168,71,0.12)] text-[#f4ddb2]',
  refunded: 'border border-fuchsia-300/20 bg-fuchsia-400/12 text-fuchsia-100',
  cancelled: 'border border-white/10 bg-white/6 text-white/65',
  expired: 'border border-white/10 bg-white/6 text-white/65',
  payment_failed: 'border border-rose-300/20 bg-rose-400/12 text-rose-100',
  failed: 'border border-rose-300/20 bg-rose-400/12 text-rose-100',
  unfulfilled: 'border border-white/10 bg-white/6 text-white/65',
  completed: 'border border-emerald-300/20 bg-emerald-400/12 text-emerald-100',
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
        STATUS_TONES[normalized] ?? 'bg-white/10 text-white/65',
        className
      )}
    >
      {text}
    </span>
  );
}
