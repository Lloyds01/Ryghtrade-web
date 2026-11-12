"use client";

import { useState } from "react";
import { Button, StepHeading } from "@/components/ui";

const HIGHLIGHTS = [
  { title: "Quick approval", body: "Know how much you can get in seconds." },
  { title: "Flexible tenor", body: "Repay over 1, 2, 3 or 4 months." },
  { title: "Paid to your salary account", body: "Funds land directly in your account." },
];

export function ConsentStep({ onContinue }: { onContinue: () => void }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div>
      <StepHeading title="Get a loan in minutes" subtitle="Verify your phone number, check your offer and receive funds instantly." />

      <ul className="mb-6 space-y-3">
        {HIGHLIGHTS.map((item) => (
          <li key={item.title} className="flex gap-3 rounded-2xl bg-brand-50/60 p-4">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
              <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">{item.title}</span>
              <span className="block text-sm text-muted">{item.body}</span>
            </span>
          </li>
        ))}
      </ul>

      <label className="mb-6 flex cursor-pointer items-center gap-3 rounded-2xl border border-line p-4 transition-colors has-checked:border-brand-500 has-checked:bg-brand-50/50">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="size-5 shrink-0 cursor-pointer accent-brand-600"
        />
        <span className="text-[15px] font-medium text-ink">I consent to all information</span>
      </label>

      <Button disabled={!agreed} onClick={onContinue}>
        Get started
      </Button>
    </div>
  );
}
