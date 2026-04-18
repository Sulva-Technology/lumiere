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
          ? 'border-rose-400/20 bg-rose-500/8 text-rose-200 hover:border-rose-300/40 hover:bg-rose-500/14'
          : 'border-[rgba(154,177,143,0.22)] bg-[rgba(108,139,103,0.12)] text-[#e4eadf] hover:border-[rgba(154,177,143,0.4)] hover:bg-[rgba(108,139,103,0.2)]',
        className
      )}
    >
      {children}
    </button>
  );
}
