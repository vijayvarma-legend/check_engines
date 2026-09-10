import { cn } from '@/lib/cn';

/** Fine technical corner marks + coordinate label. Restrained HUD dressing. */
export function HudFrame({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
    >
      <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-white/25" />
      <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-white/25" />
      <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-white/25" />
      <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-white/25" />
      {label && (
        <span className="absolute -top-2 left-4 bg-ink-900 px-1 font-mono text-[9px] uppercase tracking-wide2 text-chalk-dim">
          {label}
        </span>
      )}
    </div>
  );
}
