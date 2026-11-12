"use client";

import { useEffect, useState } from "react";
import { Button, IconBadge, Spinner } from "@/components/ui";
import { formatNaira, tenorLabel } from "@/lib/format";
import type { AppliedLoan } from "@/lib/types";

/** Full-card loader that cycles through reassuring status messages. */
export function ProcessingStep({ title, messages }: { title: string; messages: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= messages.length - 1) return;
    const timer = setTimeout(() => setIndex((i) => i + 1), 1400);
    return () => clearTimeout(timer);
  }, [index, messages.length]);

  return (
    <div className="py-8 text-center" aria-live="polite">
      <div className="relative mx-auto mb-6 grid size-20 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-200 opacity-60" />
        <span className="relative grid size-20 place-items-center rounded-full bg-brand-600 text-white">
          <Spinner className="size-8" />
        </span>
      </div>
      <h1 className="text-xl font-bold text-ink">{title}</h1>
      <p key={index} className="mt-2 animate-fade-up text-[15px] text-muted">
        {messages[index]}
      </p>
      <p className="mt-6 text-xs text-muted">Please don&apos;t close or refresh this page.</p>
    </div>
  );
}

export function SuccessStep({ message, loan }: { message: string; loan: AppliedLoan }) {
  return (
    <div className="text-center">
      <IconBadge tone="success">
        <svg className="size-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </IconBadge>
      <h1 className="text-2xl font-bold tracking-tight text-ink">Application received</h1>
      <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{message}</p>

      <dl className="mt-6 space-y-3 rounded-2xl border border-line bg-white p-5 text-left text-sm">
        <Detail label="Reference" value={loan.reference} mono />
        <Detail label="Loan amount" value={formatNaira(loan.principal)} />
        <Detail label="Tenure" value={tenorLabel(loan.tenure)} />
        <Detail label="Monthly repayment" value={formatNaira(loan.monthly_repayment)} />
        <Detail label="Amount paid to you" value={formatNaira(loan.disbursement_amount)} />
      </dl>
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right font-semibold text-ink ${mono ? "font-mono text-[13px]" : ""}`}>{value}</dd>
    </div>
  );
}

export function NotEligibleStep({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div className="text-center">
      <IconBadge>
        <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5M12 16h.01" strokeLinecap="round" />
        </svg>
      </IconBadge>
      <h1 className="text-2xl font-bold tracking-tight text-ink">Not eligible right now</h1>
      <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
        {message || "You are not eligible for a loan at the moment, please try again later."}
      </p>
      <Button variant="ghost" onClick={onDone} className="mt-6">
        Back to start
      </Button>
    </div>
  );
}

export function NotRemitaStep({ onBack }: { onBack: () => void }) {
  return (
    <div className="text-center">
      <IconBadge>
        <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5M12 16h.01" strokeLinecap="round" />
        </svg>
      </IconBadge>
      <h1 className="text-2xl font-bold tracking-tight text-ink">Sorry</h1>
      <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
        Sorry, this loan is only available to government workers whose salaries are paid through Remita.
      </p>
      <Button variant="ghost" onClick={onBack} className="mt-6">
        Go back
      </Button>
    </div>
  );
}

export function LockedStep({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div className="text-center">
      <IconBadge>
        <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5M12 16h.01" strokeLinecap="round" />
        </svg>
      </IconBadge>
      <h1 className="text-2xl font-bold tracking-tight text-ink">We couldn&apos;t verify your account</h1>
      <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
        {message}
      </p>
      <Button variant="ghost" onClick={onDone} className="mt-6">
        Back to start
      </Button>
    </div>
  );
}

export function ErrorStep({ message, onRetry, onRestart }: { message: string; onRetry: () => void; onRestart: () => void }) {
  return (
    <div className="text-center">
      <IconBadge>
        <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </IconBadge>
      <h1 className="text-2xl font-bold tracking-tight text-ink">Something went wrong</h1>
      <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{message}</p>
      <Button onClick={onRetry} className="mt-6">
        Try again
      </Button>
      <Button variant="ghost" onClick={onRestart} className="mt-2">
        Start over
      </Button>
    </div>
  );
}
