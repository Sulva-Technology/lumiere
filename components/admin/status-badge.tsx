import { cn } from '@/lib/utils';

const STATUS_TONES: Record<string, string> = {
  paid: 'bg-emerald-500/15 text-emerald-300',
  processing: 'bg-sky-500/15 text-sky-300',
  confirmed: 'bg-sky-500/15 text-sky-300',
  delivered: 'bg-emerald-500/15 text-emerald-300',
  shipped: 'bg-violet-500/15 text-violet-300',
  pending: 'bg-amber-500/15 text-amber-300',
  pending_payment: 'bg-amber-500/15 text-amber-300',
  authorized: 'bg-amber-500/15 text-amber-300',
  reserved: 'bg-amber-500/15 text-amber-300',
  refunded: 'bg-fuchsia-500/15 text-fuchsia-300',
  cancelled: 'bg-white/10 text-white/60',
  expired: 'bg-white/10 text-white/60',
  payment_failed: 'bg-red-500/15 text-red-300',
  failed: 'bg-red-500/15 text-red-300',
  unfulfilled: 'bg-white/10 text-white/60',
  completed: 'bg-emerald-500/15 text-emerald-300',
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
