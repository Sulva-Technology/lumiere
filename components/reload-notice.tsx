'use client';

import { RotateCw } from 'lucide-react';

type ReloadNoticeProps = {
  message?: string;
  className?: string;
  /** Retry in place (keeps what the visitor entered). Without it, the page reloads. */
  onRetry?: () => void;
};

/** Friendly stand-in for any failed request: a short line and a way to try again. */
export function ReloadNotice({ message = 'Something didn’t load right.', className = '', onRetry }: ReloadNoticeProps) {
  return (
    <p role="alert" className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-[var(--text-secondary)] ${className}`}>
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry ?? (() => window.location.reload())}
        className="inline-flex items-center gap-1 font-semibold text-[#8B4411] underline underline-offset-4"
      >
        <RotateCw size={14} aria-hidden="true" />
        {onRetry ? 'Try again' : 'Reload page'}
      </button>
    </p>
  );
}
