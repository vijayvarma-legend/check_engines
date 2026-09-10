import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  intro,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {(index || eyebrow) && (
        <Reveal className="flex items-center gap-3">
          {index && (
            <span className="font-mono text-[11px] tracking-wide2 text-chalk-dim">
              {index}
            </span>
          )}
          {index && eyebrow && <span className="h-px w-8 bg-white/20" />}
          {eyebrow && <span className="ce-eyebrow">{eyebrow}</span>}
        </Reveal>
      )}
      <Reveal delay={60}>
        <h2 className="ce-h2 max-w-3xl">{title}</h2>
      </Reveal>
      {intro && (
        <Reveal delay={120}>
          <p className={cn('ce-body max-w-xl', align === 'center' && 'mx-auto')}>
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  );
}
