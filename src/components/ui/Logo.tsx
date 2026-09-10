import { cn } from '@/lib/cn';

/**
 * Check Engines identity — the "check engine" engine-block mark plus the
 * wordmark. Mark shape is the Material Design Icons `engine` glyph (Apache-2.0),
 * which matches the malfunction-lamp silhouette in the Instagram logo. It uses
 * `currentColor`; the demo tints it brand red.
 *
 * Swap for the official vector file when available.
 */

export function CheckEngineMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M7,4V6H10V8H7L5,10V13H3V10H1V18H3V15H5V18H8L10,20H18V16H20V19H23V9H20V12H18V8H12V6H15V4H7Z" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  variant?: 'mark' | 'full';
  markClassName?: string;
}

export function Logo({ className, variant = 'full', markClassName }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <CheckEngineMark
        className={cn('h-[18px] w-[18px] shrink-0 text-ignition', markClassName)}
      />
      {variant === 'full' && (
        <span className="font-mono text-[13px] tracking-brand text-chalk">
          CHECK&nbsp;ENGINES
        </span>
      )}
    </span>
  );
}
