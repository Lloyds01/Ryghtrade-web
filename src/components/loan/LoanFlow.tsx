"use client";

import { useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { AccountOptionsResponse, AppliedLoan, LoanOffer } from "@/lib/types";
import { AccountStep } from "./AccountStep";
import { ConsentStep } from "./ConsentStep";
import { OffersStep } from "./OffersStep";
import { OtpStep } from "./OtpStep";
import { PhoneStep } from "./PhoneStep";
import { RemitaStep } from "./RemitaStep";
import { ErrorStep, LockedStep, NotEligibleStep, NotRemitaStep, ProcessingStep, SuccessStep } from "./StatusSteps";
import { Stepper } from "./Stepper";

/** The backend allows one OTP send per 60 seconds. */
const RESEND_SECONDS = 60;
/** Wait before retrying once when an eligibility check is already running (409). */
const CHECK_RETRY_DELAY_MS = 5000;

type Step =
  | { name: "consent" }
  | { name: "remita" }
  | { name: "not-remita" }
  | { name: "phone"; notice?: string }
  | { name: "otp" }
  | { name: "checking" }
  | { name: "eligibility-error"; message: string }
  | { name: "not-eligible"; message: string }
  | { name: "offers"; offers: LoanOffer[]; selected?: LoanOffer }
  | { name: "account"; offers: LoanOffer[]; offer: LoanOffer; options: AccountOptionsResponse }
  | { name: "locked"; message: string }
  | { name: "success"; message: string; loan: AppliedLoan };

const PROGRESS: Record<Step["name"], number> = {
  consent: 0,
  remita: 0,
  "not-remita": 0,
  phone: 0,
  otp: 0,
  checking: 1,
  "eligibility-error": 1,
  "not-eligible": 1,
  offers: 1,
  account: 2,
  locked: 2,
  success: 3,
};

/** Where the back arrow leads from each step; null hides it. */
function previousStep(step: Step): Step | null {
  switch (step.name) {
    case "remita":
      return { name: "consent" };
    case "not-remita":
    case "phone":
      return { name: "remita" };
    // Steps after verification go back to the number, which starts a fresh session.
    case "otp":
    case "offers":
    case "eligibility-error":
      return { name: "phone" };
    case "account":
      return { name: "offers", offers: step.offers, selected: step.offer };
    default:
      return null;
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function LoanFlow() {
  const [step, setStep] = useState<Step>({ name: "consent" });
  const [phone, setPhone] = useState("");
  // Held in memory only, per the backend's rules: never persisted or logged.
  const [token, setToken] = useState("");
  // Bumped whenever the user navigates away, so late responses don't move them forward again.
  const navigation = useRef(0);
  const back = previousStep(step);

  function navigate(next: Step) {
    navigation.current++;
    // Going back to the number screen or earlier discards the token.
    if (next.name === "consent" || next.name === "remita" || next.name === "phone") setToken("");
    setStep(next);
  }

  function restart() {
    navigate({ name: "consent" });
  }

  /** On any 401: drop the token and send the user back to the phone screen. */
  function handledExpiry(err: unknown): boolean {
    if (!(err instanceof ApiError) || err.status !== 401) return false;
    navigate({ name: "phone", notice: err.message });
    return true;
  }

  async function sendOtp(number: string) {
    const nav = navigation.current;
    await api.sendOtp(number);
    if (nav !== navigation.current) return;
    setPhone(number);
    setStep({ name: "otp" });
  }

  async function verifyOtp(otp: string) {
    const nav = navigation.current;
    const { token } = await api.verifyOtp(phone, otp);
    if (nav !== navigation.current) return;
    setToken(token);
    await checkEligibility(token);
  }

  async function checkEligibility(sessionToken: string, isRetry = false) {
    setStep({ name: "checking" });
    const nav = navigation.current;
    try {
      const result = await api.checkEligibility(sessionToken);
      if (nav !== navigation.current) return;
      const offers = result.offers.filter((o) => o.principal > 0);
      setStep(
        result.eligible && offers.length > 0
          ? { name: "offers", offers }
          : { name: "not-eligible", message: result.message },
      );
    } catch (err) {
      if (nav !== navigation.current || handledExpiry(err)) return;
      if (err instanceof ApiError && err.status === 409 && !isRetry) {
        await wait(CHECK_RETRY_DELAY_MS);
        if (nav === navigation.current) await checkEligibility(sessionToken, true);
        return;
      }
      setStep({ name: "eligibility-error", message: (err as Error).message });
    }
  }

  async function chooseOffer(offers: LoanOffer[], offer: LoanOffer) {
    const nav = navigation.current;
    try {
      const options = await api.accountOptions(token);
      if (nav !== navigation.current) return;
      setStep({ name: "account", offers, offer, options });
    } catch (err) {
      if (nav !== navigation.current || handledExpiry(err)) return;
      if (err instanceof ApiError && err.status === 409) return void checkEligibility(token);
      if (err instanceof ApiError && err.status === 403) return setStep({ name: "locked", message: err.message });
      throw err;
    }
  }

  async function apply(offer: LoanOffer, accountNumber: string) {
    const nav = navigation.current;
    try {
      const result = await api.applyForLoan(token, { tenure: offer.tenure, account_number: accountNumber });
      if (nav !== navigation.current) return;
      setStep({ name: "success", message: result.message, loan: result.loan });
    } catch (err) {
      if (nav !== navigation.current || handledExpiry(err)) return;
      if (err instanceof ApiError) {
        const outOfAttempts = err.reason === "ACCOUNT_MISMATCH" && err.attemptsLeft === 0;
        if (err.status === 403 || outOfAttempts) return setStep({ name: "locked", message: err.message });
        if (err.status === 409) return void checkEligibility(token);
      }
      // ACCOUNT_MISMATCH and other 400s are shown on the account screen so the user can pick again.
      throw err;
    }
  }

  return (
    <>
      <div className="mb-2 -ml-2 h-10 sm:mb-5">
        {back && (
          <button
            type="button"
            onClick={() => navigate(back)}
            aria-label="Go back"
            className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
              <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      <Stepper current={PROGRESS[step.name]} />
      <div key={step.name} className="animate-fade-up">
        {step.name === "consent" && <ConsentStep onContinue={() => setStep({ name: "remita" })} />}
        {step.name === "remita" && (
          <RemitaStep onAnswer={(yes) => setStep(yes ? { name: "phone" } : { name: "not-remita" })} />
        )}
        {step.name === "not-remita" && <NotRemitaStep onBack={() => setStep({ name: "remita" })} />}
        {step.name === "phone" && <PhoneStep initialPhone={phone} notice={step.notice} onSubmit={sendOtp} />}
        {step.name === "otp" && (
          <OtpStep
            phone={phone}
            resendAfterSeconds={RESEND_SECONDS}
            onVerify={verifyOtp}
            onResend={async () => {
              await api.sendOtp(phone);
              return RESEND_SECONDS;
            }}
            onChangeNumber={() => navigate({ name: "phone" })}
          />
        )}
        {step.name === "checking" && (
          <ProcessingStep
            title="Checking your eligibility"
            messages={[
              "Verifying your details…",
              "Checking your salary records…",
              "Calculating your offers…",
              "This can take up to a minute. Thanks for waiting…",
            ]}
          />
        )}
        {step.name === "offers" && (
          <OffersStep
            offers={step.offers}
            initialOffer={step.selected}
            onSubmit={(offer) => chooseOffer(step.offers, offer)}
          />
        )}
        {step.name === "account" && (
          <AccountStep
            options={step.options}
            offer={step.offer}
            onSubmit={(accountNumber) => apply(step.offer, accountNumber)}
          />
        )}
        {step.name === "success" && <SuccessStep message={step.message} loan={step.loan} />}
        {step.name === "not-eligible" && <NotEligibleStep message={step.message} onDone={restart} />}
        {step.name === "locked" && <LockedStep message={step.message} onDone={restart} />}
        {step.name === "eligibility-error" && (
          <ErrorStep message={step.message} onRetry={() => checkEligibility(token)} onRestart={restart} />
        )}
      </div>
    </>
  );
}
