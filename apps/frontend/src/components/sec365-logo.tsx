import { cn } from "@retekapp/ui";

interface Sec365LogoProps {
  /** Sizing for the logo mark — set a height (e.g. "h-7"). Defaults to h-7. */
  className?: string;
  /** Optional small caption rendered above the mark (e.g. "Parceria"). */
  caption?: string;
  /** Wrap in a rounded chip. The source image already has a black background. */
  chip?: boolean;
}

/**
 * SEC365 brand mark — cybersecurity partner / parent company of Retek.
 * The source image carries a solid black background, so it renders as a
 * self-contained logo on both light and dark surfaces.
 */
export function Sec365Logo({ className, caption, chip = true }: Sec365LogoProps) {
  const mark = (
    <img
      src="/sec365.png"
      alt="SEC365 — Cybersecurity Technology"
      title="SEC365 — Cybersecurity Technology"
      className={cn(
        "h-7 w-auto object-contain",
        chip && "rounded-md ring-1 ring-black/10 dark:ring-white/10",
        className,
      )}
    />
  );

  if (!caption) return mark;

  return (
    <span className="inline-flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {caption}
      </span>
      {mark}
    </span>
  );
}
