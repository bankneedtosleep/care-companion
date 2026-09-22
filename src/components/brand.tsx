import Image from "next/image";
import Link from "next/link";

type BrandProps = {
  className?: string;
  compact?: boolean;
};

export function Brand({ className = "", compact = false }: BrandProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 rounded-2xl font-bold tracking-[-0.03em] text-[#153c34] transition hover:opacity-75 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1d7665]/20 ${className}`}
    >
      <Image
        src="/care-companion-mark.svg"
        alt=""
        width={compact ? 34 : 42}
        height={compact ? 34 : 42}
        className="rounded-xl shadow-[0_10px_24px_rgba(20,100,84,0.16)]"
      />
      <span className={compact ? "text-[15px]" : "text-[17px]"}>Care Companion</span>
    </Link>
  );
}

type AppHeaderProps = {
  label?: string;
  labelClassName?: string;
  action?: React.ReactNode;
};

export function AppHeader({ label, labelClassName = "", action }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <Brand compact />
      <div className="flex items-center gap-3">
        {label ? (
          <span className={`hidden rounded-full px-3.5 py-2 text-xs font-bold sm:inline-flex ${labelClassName}`}>
            {label}
          </span>
        ) : null}
        {action}
      </div>
    </header>
  );
}
