const STEPS = [
  { label: "Verify", short: "Verify" },
  { label: "Choose offer", short: "Offer" },
  { label: "Confirm account", short: "Account" },
];

/** `current` is the index of the active step; STEPS.length means all complete. */
export function Stepper({ current }: { current: number }) {
  return (
    <ol className="mb-6 flex items-start gap-2 sm:mb-8" aria-label="Progress">
      {STEPS.map(({ label, short }, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 flex-col gap-2" aria-current={active ? "step" : undefined}>
            <span className="h-1.5 overflow-hidden rounded-full bg-brand-100">
              <span
                className={`block h-full rounded-full bg-brand-600 transition-all duration-500 ${
                  done ? "w-full" : active ? "w-1/2" : "w-0"
                }`}
              />
            </span>
            <span className={`text-xs font-semibold whitespace-nowrap ${done || active ? "text-brand-700" : "text-muted/70"}`}>
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
