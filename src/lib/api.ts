// Browser-side client for the Ryght Trade web API.
//
// NEXT_PUBLIC_API_BASE is the backend origin, e.g. https://api.example.com. When it is
// empty, requests go to this app's own mock routes under /api/v1/web/ (see src/lib/server).
//
// Never log or persist the token, OTP or account numbers handled here.
import type {
  AccountOptionsResponse,
  ApplyResponse,
  EligibilityResponse,
  LoanApplication,
  SendOtpResponse,
  VerifyOtpResponse,
} from "./types";

const API_ROOT = `${(process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/+$/, "")}/api/v1/web/`;

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Backend reason code, e.g. ACCOUNT_MISMATCH. */
    readonly reason?: string,
    readonly attemptsLeft?: number,
  ) {
    super(message);
  }
}

/** Picks the text to show: `message`, then DRF's `detail`, then the first per-field error. */
function errorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return FALLBACK_MESSAGE;
  const body = data as Record<string, unknown>;
  if (typeof body.message === "string" && body.message) return body.message;
  if (typeof body.detail === "string" && body.detail) return body.detail;
  for (const value of Object.values(body)) {
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }
  return FALLBACK_MESSAGE;
}

async function request<T>(method: "GET" | "POST", path: string, token?: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_ROOT + path, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Network error. Please check your connection and try again.", 0);
  }

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const fields = (data ?? {}) as { reason?: unknown; attempts_left?: unknown };
    throw new ApiError(
      errorMessage(data),
      res.status,
      typeof fields.reason === "string" ? fields.reason : undefined,
      typeof fields.attempts_left === "number" ? fields.attempts_left : undefined,
    );
  }
  return data as T;
}

export const api = {
  sendOtp: (phone: string) => request<SendOtpResponse>("POST", "otp/send/", undefined, { phone_number: phone }),
  verifyOtp: (phone: string, otp: string) =>
    request<VerifyOtpResponse>("POST", "otp/verify/", undefined, { phone_number: phone, otp }),
  checkEligibility: (token: string) => request<EligibilityResponse>("POST", "eligibility/", token, {}),
  accountOptions: (token: string) => request<AccountOptionsResponse>("GET", "loan/account-options/", token),
  applyForLoan: (token: string, application: LoanApplication) =>
    request<ApplyResponse>("POST", "loan/apply/", token, application),
};
