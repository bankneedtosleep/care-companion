import Image from "next/image";
import Link from "next/link";

type BrandProps = {
  className?: string;
  compact?: boolean;
  href?: string;
};

export function Brand({ className = "", compact = false, href = "/" }: BrandProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-3 font-black tracking-[-0.03em] text-ink transition hover:opacity-80 ${className}`}
    >
      <div className="relative">
        <Image
          src="/care-companion-mark.svg"
          alt=""
          width={compact ? 34 : 42}
          height={compact ? 34 : 42}
          className="rounded-xl border-[3px] border-ink bg-pastel-mint"
        />
      </div>
      <span className={compact ? "text-[15px]" : "text-[19px]"}>
        Care Companion
      </span>
    </Link>
  );
}

type AppHeaderProps = {
  label?: string;
  labelClassName?: string;
  action?: React.ReactNode;
  href?: string;
};

export function AppHeader({ label, labelClassName = "", action, href = "/" }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <Brand compact href={href} />
      <div className="flex items-center gap-3">
        {label ? (
          <span className={`hidden badge-cartoon sm:inline-flex ${labelClassName}`}>
            {label}
          </span>
        ) : null}
        {action}
      </div>
    </header>
  );
}
