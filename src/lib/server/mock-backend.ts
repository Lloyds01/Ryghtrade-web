// Local stand-in for the Ryght Trade web API, following the same contract.
// Only active when NEXT_PUBLIC_API_BASE is empty (see handler.ts).
//
// Test values:
//   - OTP is always 123456
//   - Phone ending 0000: not eligible
//   - Phone ending 9999: salary check fails (503)
//   - Salary account is always 0123456789 (Access Bank); 3 wrong picks lock verification
import type {
  AccountOptionsResponse,
  ApplyResponse,
  EligibilityResponse,
  LoanOffer,
  SendOtpResponse,
  VerifyOtpResponse,
} from "@/lib/types";

export const MOCK_OTP = "123456";

/** Error with the exact JSON body the backend would send. */
export class BackendError extends Error {
  constructor(
    readonly status: number,
    readonly body: Record<string, unknown>,
  ) {
    super(typeof body.message === "string" ? body.message : `HTTP ${status}`);
  }
}

const fail = (status: number, reason: string, message: string, extra: Record<string, unknown> = {}) =>
  new BackendError(status, { status: false, reason, message, ...extra });

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Session {
  phone: string;
  expiresAt: number;
  offers?: LoanOffer[];
  attemptsLeft: number;
  applied: boolean;
}

// Kept on globalThis so the dev server's module reloads don't wipe it.
const store = globalThis as unknown as { __mockSessions?: Map<string, Session>; __mockOtpSentAt?: Map<string, number> };
const sessions = (store.__mockSessions ??= new Map());
const otpSentAt = (store.__mockOtpSentAt ??= new Map());

const SALARY_ACCOUNT = "0123456789";
const DECOY_ACCOUNTS = ["0123457812", "0112456789", "0129456703"];

function normalizePhone(raw: unknown): string {
  const digits = typeof raw === "string" ? raw.replace(/^\+/, "") : "";
  const local = digits.startsWith("234") ? `0${digits.slice(3)}` : digits;
  if (!/^0[789][01]\d{8}$/.test(local)) {
    throw new BackendError(400, { phone_number: ["Enter a valid Nigerian phone number."] });
  }
  return local;
}

function session(token: string | null): Session {
  const found = token ? sessions.get(token) : undefined;
  if (!found || found.expiresAt < Date.now()) {
    throw new BackendError(401, { detail: "Your session has expired. Please verify your phone number again." });
  }
  return found;
}

export async function sendOtp(body: { phone_number?: unknown }): Promise<SendOtpResponse> {
  const phone = normalizePhone(body.phone_number);
  if (Date.now() - (otpSentAt.get(phone) ?? 0) < 60_000) {
    throw new BackendError(429, { status: false, message: "Please wait a minute before requesting another code." });
  }
  await delay(800);
  otpSentAt.set(phone, Date.now());
  return { status: true, message: "OTP sent", expires_in: 300 };
}

export async function verifyOtp(body: { phone_number?: unknown; otp?: unknown }): Promise<VerifyOtpResponse> {
  const phone = normalizePhone(body.phone_number);
  await delay(800);
  if (body.otp !== MOCK_OTP) throw new BackendError(400, { status: false, message: "Invalid or expired OTP" });
  const token = crypto.randomUUID();
  sessions.set(token, { phone, expiresAt: Date.now() + 1800_000, attemptsLeft: 3, applied: false });
  return { status: true, message: "Phone number verified", token, expires_in: 1800 };
}

export async function checkEligibility(token: string | null): Promise<EligibilityResponse> {
  const s = session(token);
  await delay(3000);
  const checked_at = new Date().toISOString();
  const valid_until = new Date(Date.now() + 86_400_000).toISOString();

  if (s.phone.endsWith("9999")) {
    throw fail(503, "SALARY_CHECK_FAILED", "We couldn't confirm your salary details right now. Please try again.");
  }
  if (s.phone.endsWith("0000")) {
    return {
      status: true,
      eligible: false,
      reason: "NOT_ELIGIBLE",
      message: "You are not eligible for a loan at the moment, please try again later.",
      offers: [],
      checked_at,
      valid_until,
    };
  }

  const fee = 0.04;
  s.offers = [
    [1, 50_000],
    [2, 120_000],
    [3, 200_000],
    [4, 300_000],
  ].map(([tenure, principal]) => ({
    tenure,
    principal,
    monthly_repayment: Math.round((principal * (1 + 0.05 * tenure) * 100) / tenure) / 100,
    disbursement_amount: principal * (1 - fee),
    management_fee_percent: fee,
  }));
  return { status: true, eligible: true, reason: null, message: "", offers: s.offers, checked_at, valid_until };
}

function accountOptions(phone: string): string[] {
  const options = [...DECOY_ACCOUNTS];
  options.splice(Number(phone.at(-1)) % 4, 0, SALARY_ACCOUNT);
  return options;
}

const locked = () =>
  fail(403, "ACCOUNT_VERIFICATION_LOCKED", "Account verification is locked. Please contact support.");

export async function getAccountOptions(token: string | null): Promise<AccountOptionsResponse> {
  const s = session(token);
  await delay(600);
  if (!s.offers) throw fail(409, "NO_VALID_OFFER", "Your offers have expired. Please check your eligibility again.");
  if (s.attemptsLeft <= 0) throw locked();
  return {
    status: true,
    first_name: "Ada",
    bank_name: "Access Bank",
    account_options: accountOptions(s.phone),
    attempts_left: s.attemptsLeft,
  };
}

export async function applyForLoan(
  token: string | null,
  body: { tenure?: unknown; account_number?: unknown },
): Promise<ApplyResponse> {
  const s = session(token);
  await delay(2000);
  if (s.applied) throw fail(400, "LOAN_PROCESSING", "You already have a loan being processed.");
  if (!s.offers) throw fail(409, "NO_VALID_OFFER", "Your offers have expired. Please check your eligibility again.");
  if (s.attemptsLeft <= 0) throw locked();

  const offer = s.offers.find((o) => o.tenure === body.tenure);
  if (!offer) throw fail(400, "INVALID_TENURE", "Select a valid loan offer.");
  if (typeof body.account_number !== "string" || !accountOptions(s.phone).includes(body.account_number)) {
    throw fail(400, "INVALID_ACCOUNT_SELECTION", "Select one of the accounts shown.");
  }
  if (body.account_number !== SALARY_ACCOUNT) {
    s.attemptsLeft--;
    if (s.attemptsLeft <= 0) throw locked();
    throw fail(400, "ACCOUNT_MISMATCH", "The account you selected doesn't match our records.", {
      attempts_left: s.attemptsLeft,
    });
  }

  s.applied = true;
  return {
    status: true,
    message: "Your loan is processing. You will receive credit in your salary account.",
    loan: {
      reference: `RT-${Date.now().toString(36).toUpperCase()}`,
      status: "processing",
      tenure: offer.tenure,
      principal: offer.principal,
      monthly_repayment: offer.monthly_repayment,
      disbursement_amount: offer.disbursement_amount,
    },
  };
}
