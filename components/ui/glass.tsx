import React from 'react';
import { cn } from '@/lib/utils';

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 'heavy' | 'medium' | 'subtle';
  children: React.ReactNode;
}

export function Glass({ level = 'medium', className, children, ...props }: GlassProps) {
  const levelClass = {
    heavy: 'glass-heavy',
    medium: 'glass-medium',
    subtle: 'glass-subtle',
  }[level];

  return (
    <div className={cn(levelClass, 'relative overflow-hidden', className)} {...props}>
      {/* Inner top shimmer/highlight for heavy glass */}
      {level === 'heavy' && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-[#FFDC64]/20 to-transparent" />
      )}
      {children}
    </div>
  );
}
