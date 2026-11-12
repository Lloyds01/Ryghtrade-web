const nairaWhole = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const nairaKobo = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 });

/** ₦50,000 for whole amounts, ₦18,333.34 when there are kobo. */
export function formatNaira(amount: number): string {
  return (Number.isInteger(amount) ? nairaWhole : nairaKobo).format(amount);
}

/** 0.04 -> 4% */
export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 10000) / 100}%`;
}

/** Nigerian mobile number in local format, e.g. 08012345678. */
export const NIGERIAN_PHONE_REGEX = /^0[789][01]\d{8}$/;

export function isValidNigerianPhone(phone: string): boolean {
  return NIGERIAN_PHONE_REGEX.test(phone);
}

/** 08012345678 -> 0801 *** 5678 */
export function maskPhone(phone: string): string {
  if (phone.length < 8) return phone;
  return `${phone.slice(0, 4)} *** ${phone.slice(-4)}`;
}

/** 0123456789 -> ******6789 */
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return "*".repeat(accountNumber.length - 4) + accountNumber.slice(-4);
}

export function tenorLabel(months: number): string {
  return months === 1 ? "1 month" : `${months} months`;
}
