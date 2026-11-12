"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Button, ErrorText, StepHeading } from "@/components/ui";
import { maskPhone } from "@/lib/format";

const OTP_LENGTH = 6;

interface OtpStepProps {
  phone: string;
  resendAfterSeconds: number;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<number>;
  onChangeNumber: () => void;
}

export function OtpStep({ phone, resendAfterSeconds, onVerify, onResend, onChangeNumber }: OtpStepProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(resendAfterSeconds);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const otp = digits.join("");

  async function verify(code: string) {
    setError("");
    setLoading(true);
    try {
      await onVerify(code);
    } catch (err) {
      setError((err as Error).message);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
      setLoading(false);
    }
  }

  function update(next: string[]) {
    setDigits(next);
    setError("");
    const code = next.join("");
    if (code.length === OTP_LENGTH && !loading) void verify(code);
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    update(next);
    if (digit && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? "");
    update(next);
    inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleResend() {
    setResending(true);
    setError("");
    try {
      setCountdown(await onResend());
      setDigits(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div>
      <StepHeading
        title="Verify your number"
        subtitle={
          <>
            Enter the 6-digit code sent to <span className="font-semibold text-ink">{maskPhone(phone)}</span>.{" "}
            <button type="button" onClick={onChangeNumber} className="font-semibold text-brand-600 hover:underline">
              Change
            </button>
          </>
        }
      />

      <div className="flex justify-between gap-2" role="group" aria-label="One-time password">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={loading}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            autoFocus={i === 0}
            className={`aspect-square w-full max-w-14 rounded-2xl border bg-white text-center text-2xl font-bold text-ink outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:opacity-60 ${
              error ? "border-brand-500" : digit ? "border-brand-300" : "border-line"
            }`}
          />
        ))}
      </div>
      <ErrorText>{error}</ErrorText>

      <p className="mt-5 text-center text-sm text-muted">
        Didn&apos;t get the code?{" "}
        {countdown > 0 ? (
          <span className="font-semibold text-ink">
            Resend in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-brand-600 hover:underline disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        )}
      </p>

      <Button
        loading={loading}
        disabled={otp.length !== OTP_LENGTH}
        onClick={() => verify(otp)}
        className="mt-6"
      >
        {loading ? "Verifying…" : "Verify"}
      </Button>
    </div>
  );
}
