// Response and request shapes of the Ryght Trade web API ({API_BASE}/api/v1/web/).
// Field names match the backend exactly (snake_case).

export interface SendOtpResponse {
  status: boolean;
  message: string;
  /** Seconds the code stays valid. */
  expires_in: number;
}

export interface VerifyOtpResponse {
  status: boolean;
  message: string;
  /** Bearer token for every later request. Keep in memory only. */
  token: string;
  /** Seconds the token stays valid. */
  expires_in: number;
}

export interface LoanOffer {
  /** Months. */
  tenure: number;
  principal: number;
  monthly_repayment: number;
  /** What actually lands in the salary account, after fees. */
  disbursement_amount: number;
  /** Fraction: 0.04 means 4%. */
  management_fee_percent: number;
}

export interface EligibilityResponse {
  status: boolean;
  eligible: boolean;
  reason: string | null;
  message: string;
  offers: LoanOffer[];
  checked_at: string;
  valid_until: string;
}

export interface AccountOptionsResponse {
  status: boolean;
  first_name: string;
  bank_name: string;
  /** Four account numbers; only one is the user's salary account. */
  account_options: string[];
  attempts_left: number;
}

export interface LoanApplication {
  tenure: number;
  account_number: string;
}

export interface AppliedLoan {
  reference: string;
  status: string;
  tenure: number;
  principal: number;
  monthly_repayment: number;
  disbursement_amount: number;
}

export interface ApplyResponse {
  status: boolean;
  message: string;
  loan: AppliedLoan;
}
