"use client";

import { useState, type FormEvent } from "react";
import { Button, ErrorText, StepHeading } from "@/components/ui";
import { isValidNigerianPhone } from "@/lib/format";

interface PhoneStepProps {
  initialPhone: string;
  /** Shown on arrival, e.g. why the user was sent back here. */
  notice?: string;
  onSubmit: (phone: string) => Promise<void>;
}

export function PhoneStep({ initialPhone, notice, onSubmit }: PhoneStepProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState(notice ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidNigerianPhone(phone)) {
      setError("Enter a valid 11-digit Nigerian phone number, e.g. 08012345678.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit(phone);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StepHeading
        title="Enter your phone number"
        subtitle="Use the number linked to your salary account. We'll send you a 6-digit code."
      />

      <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-ink">
        Phone number
      </label>
      <div
        className={`flex h-14 items-center overflow-hidden rounded-2xl border bg-white transition-colors focus-within:ring-4 ${
          error ? "border-brand-500 focus-within:ring-brand-100" : "border-line focus-within:border-brand-500 focus-within:ring-brand-100"
        }`}
      >
        <span className="flex h-full items-center gap-2 border-r border-line bg-brand-50/60 px-4 text-sm font-semibold text-ink">
          <span aria-hidden="true">🇳🇬</span> NG
        </span>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="080 0000 0000"
          maxLength={11}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 11));
            setError("");
          }}
          className="h-full flex-1 bg-transparent px-4 text-lg font-medium tracking-wide text-ink outline-none placeholder:text-muted/50"
          autoFocus
        />
      </div>
      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading} disabled={phone.length !== 11} className="mt-6">
        {loading ? "Sending code…" : "Send code"}
      </Button>
    </form>
  );
}
