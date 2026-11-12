"use client";

import { useState } from "react";
import { Button, ErrorText, StepHeading } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { formatNaira } from "@/lib/format";
import type { AccountOptionsResponse, LoanOffer } from "@/lib/types";

interface AccountStepProps {
  options: AccountOptionsResponse;
  offer: LoanOffer;
  onSubmit: (accountNumber: string) => Promise<void>;
}

export function AccountStep({ options, offer, onSubmit }: AccountStepProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(options.attempts_left);
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
      if (err instanceof ApiError && err.attemptsLeft !== undefined) setAttemptsLeft(err.attemptsLeft);
      if (err instanceof ApiError && err.reason === "ACCOUNT_MISMATCH") setSelected(null);
      setLoading(false);
    }
  }

  return (
    <div>
      <StepHeading
        title={`Hi ${options.first_name}, select your ${options.bank_name} salary account`}
        subtitle="Choose the account your salary is paid into."
      />

      <div role="radiogroup" aria-label="Salary accounts" className="space-y-3">
        {options.account_options.map((accountNumber) => {
          const active = selected === accountNumber;
          return (
            <button
              key={accountNumber}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={loading}
              onClick={() => {
                setSelected(accountNumber);
                setError("");
              }}
              className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed ${
                active ? "border-brand-600 bg-brand-50/70" : "border-line bg-white hover:border-brand-300"
              }`}
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                  active ? "border-brand-600" : "border-brand-200"
                }`}
                aria-hidden="true"
              >
                {active && <span className="size-2.5 rounded-full bg-brand-600" />}
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-base font-semibold tracking-wider text-ink">{accountNumber}</span>
                <span className="block text-sm text-muted">{options.bank_name}</span>
              </span>
            </button>
          );
        })}
      </div>

      <ErrorText>{error}</ErrorText>
      <p className="mt-3 text-sm text-muted">
        {attemptsLeft === 1 ? "You have 1 attempt left." : `You have ${attemptsLeft} attempts left.`}
      </p>

      <Button loading={loading} disabled={!selected} onClick={handleSubmit} className="mt-6">
        {loading ? "Submitting…" : `Get ${formatNaira(offer.disbursement_amount)}`}
      </Button>
    </div>
  );
}
