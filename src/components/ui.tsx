import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Spinner({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "ghost";
}

export function Button({ loading, variant = "primary", disabled, children, className = "", ...props }: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 disabled:bg-brand-200 disabled:shadow-none"
      : "text-brand-700 hover:bg-brand-50 disabled:text-muted";
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl px-5 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function StepHeading({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="mb-5 sm:mb-6">
      <h1 className="text-[22px] leading-tight font-bold tracking-tight text-ink sm:text-2xl">{title}</h1>
      {subtitle && <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{subtitle}</p>}
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-3 flex items-start gap-2 text-sm font-medium text-brand-700">
      <svg className="mt-0.5 size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </p>
  );
}

export function IconBadge({ tone = "brand", children }: { tone?: "brand" | "success"; children: ReactNode }) {
  const styles = tone === "success" ? "bg-emerald-50 text-emerald-600 ring-emerald-100" : "bg-brand-50 text-brand-600 ring-brand-100";
  return (
    <div className={`mx-auto mb-5 grid size-20 place-items-center rounded-full ring-8 ${styles}`}>{children}</div>
  );
}
