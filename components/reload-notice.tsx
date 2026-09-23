'use client';

import { RotateCw } from 'lucide-react';

type ReloadNoticeProps = {
  message?: string;
  className?: string;
};

/** Friendly stand-in for any failed request: a short line and a way to reload. */
export function ReloadNotice({ message = 'Something didn’t load right.', className = '' }: ReloadNoticeProps) {
  return (
    <p role="alert" className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-[var(--text-secondary)] ${className}`}>
      <span>{message}</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-1 font-semibold text-[#8B4411] underline underline-offset-4"
      >
        <RotateCw size={14} aria-hidden="true" />
        Reload page
      </button>
    </p>
  );
}
