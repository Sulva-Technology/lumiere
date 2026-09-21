import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ActionIconButtonProps = {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
  children: ReactNode;
  className?: string;
};

export function ActionIconButton({
  title,
  onClick,
  disabled = false,
  variant = 'default',
  children,
  className,
}: ActionIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all disabled:cursor-not-allowed disabled:opacity-45',
        variant === 'danger'
          ? 'border-red-500/25 bg-red-500/10 text-red-600 hover:border-red-500/40 hover:bg-red-500/20'
          : 'border-[#8B4411]/20 bg-white/40 text-[#713813] hover:border-[#8B4411]/40 hover:bg-white/70',
        className
      )}
    >
      {children}
    </button>
  );
}
