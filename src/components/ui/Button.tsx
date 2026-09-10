'use client';

import type { ButtonHTMLAttributes } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  withArrow?: boolean;
}

export function Button({
  variant = 'primary',
  withArrow = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'ce-btn group',
        variant === 'primary' ? 'ce-btn-primary' : 'ce-btn-ghost',
        className,
      )}
      {...rest}
    >
      {children}
      {withArrow && (
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </button>
  );
}
