import { LoanFlow } from "@/components/loan/LoanFlow";

export default function Home() {
  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Brand panel: compact header on mobile, full-height side panel on desktop */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-5 pt-6 pb-20 text-white sm:px-6 sm:pt-8 sm:pb-24 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-brand-400/30 blur-3xl" />

        <div className="relative mx-auto flex w-full max-w-lg items-center gap-2.5 lg:mx-0 lg:max-w-none">
          <span className="grid size-9 place-items-center rounded-xl bg-white text-lg font-extrabold text-brand-600 shadow-lg sm:size-10">R</span>
          <span className="text-lg font-bold tracking-tight">Ryghtrade</span>
        </div>

        <div className="relative mx-auto mt-5 w-full max-w-lg sm:mt-8 lg:mx-0 lg:mt-0 lg:max-w-md">
          <p className="mb-3 hidden items-center sm:inline-flex gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide uppercase ring-1 ring-white/20 backdrop-blur">
            <span className="size-1.5 rounded-full bg-white" /> Salary loans
          </p>
          <h2 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Cash when you need it, paid straight to your salary account.
          </h2>
          <p className="mt-4 hidden text-base leading-relaxed text-brand-100 lg:block">
            No paperwork. No queues. Verify your number, see your offer and get funded in minutes.
          </p>
        </div>

        <ul className="relative mt-10 hidden grid-cols-3 gap-4 lg:grid">
          {[
            ["2 min", "To apply"],
            ["1–4", "Months tenor"],
            ["24/7", "Availability"],
          ].map(([value, label]) => (
            <li key={label} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
              <span className="block text-2xl font-bold">{value}</span>
              <span className="block text-sm text-brand-100">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Application card */}
      <section className="relative -mt-14 px-3 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:-mt-16 sm:px-4 lg:mt-0 lg:flex lg:items-center lg:justify-center lg:p-12">
        <div className="mx-auto w-full max-w-md rounded-3xl sm:max-w-lg lg:max-w-md bg-white p-5 shadow-xl shadow-brand-900/10 ring-1 ring-line sm:p-8 lg:shadow-2xl">
          <LoanFlow />
        </div>
      </section>
    </main>
  );
}
