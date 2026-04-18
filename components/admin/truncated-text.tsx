import { cn } from '@/lib/utils';

type TruncatedTextProps = {
  value?: string | null;
  fallback?: string;
  className?: string;
  mono?: boolean;
};

export function TruncatedText({ value, fallback = '—', className, mono = false }: TruncatedTextProps) {
  const text = value?.trim() || fallback;

  return (
    <span
      title={text}
      className={cn('block min-w-0 truncate', mono && 'font-mono text-[12px]', className)}
    >
      {text}
    </span>
  );
}
