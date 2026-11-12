"use client";

import { useState } from "react";
import { Button, ErrorText, StepHeading } from "@/components/ui";
import { formatNaira, formatPercent, tenorLabel } from "@/lib/format";
import type { LoanOffer } from "@/lib/types";

interface OffersStepProps {
  offers: LoanOffer[];
  initialOffer?: LoanOffer;
  onSubmit: (offer: LoanOffer) => Promise<void>;
}

export function OffersStep({ offers, initialOffer, onSubmit }: OffersStepProps) {
  const sorted = [...offers].sort((a, b) => a.tenure - b.tenure);
  const [selected, setSelected] = useState<LoanOffer | null>(initialOffer ?? null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!selected) return;
    setError("");
    setLoading(true);
    try {
      await onSubmit(selected);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div>
      <StepHeading title="You're eligible!" subtitle="Choose how long you'd like to repay." />

      <div role="radiogroup" aria-label="Loan offers" className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {sorted.map((offer) => {
          const active = selected?.tenure === offer.tenure;
          return (
            <button
              key={offer.tenure}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={loading}
              onClick={() => {
                setSelected(offer);
                setError("");
              }}
              className={`relative min-w-0 rounded-2xl border-2 p-3.5 text-left sm:p-4 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed ${
                active
                  ? "border-brand-600 bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lg shadow-brand-600/30"
                  : "border-line bg-white hover:border-brand-300"
              }`}
            >
              <span
                className={`absolute top-3 right-3 grid size-4.5 sm:size-5 place-items-center rounded-full border-2 ${
                  active ? "border-white bg-white" : "border-brand-200"
                }`}
                aria-hidden="true"
              >
                {active && <span className="size-2 rounded-full bg-brand-600 sm:size-2.5" />}
              </span>
              <span className={`block pr-6 text-[11px] font-semibold tracking-wide uppercase sm:text-xs ${active ? "text-brand-100" : "text-muted"}`}>
                {tenorLabel(offer.tenure)}
              </span>
              <span className="mt-1 block text-lg font-bold tracking-tight min-[360px]:text-xl sm:text-2xl">{formatNaira(offer.principal)}</span>
              <span className={`mt-1.5 block text-[11px] leading-snug sm:mt-2 sm:text-xs ${active ? "text-brand-100" : "text-muted"}`}>
                {formatNaira(offer.monthly_repayment)}/month
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <dl className="mt-5 animate-fade-up space-y-2.5 rounded-2xl bg-brand-50/70 p-4 text-sm">
          <Row label="Loan amount" value={formatNaira(selected.principal)} />
          <Row label="Tenure" value={tenorLabel(selected.tenure)} />
          <Row label="Monthly repayment" value={formatNaira(selected.monthly_repayment)} />
          <Row label="Management fee" value={formatPercent(selected.management_fee_percent)} />
          <div className="border-t border-brand-100 pt-2.5">
            <Row label="Amount paid to you" value={formatNaira(selected.disbursement_amount)} strong />
          </div>
        </dl>
      )}

      <ErrorText>{error}</ErrorText>

      <Button loading={loading} disabled={!selected} onClick={handleSubmit} className="mt-6">
        {selected ? "Continue" : "Select an offer"}
      </Button>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right ${strong ? "font-bold text-ink" : "font-semibold text-ink"}`}>{value}</dd>
    </div>
  );
}
