import { getRequestCurrencyCode } from "@/lib/request-flow/currency";

export function formatAmountFromCents(
  amountCents: number,
  currencyCode?: string,
  locale = "en-US",
): string {
  if (!Number.isInteger(amountCents)) {
    throw new Error("Amount cents must be an integer.");
  }

  return new Intl.NumberFormat(locale, {
    currency: getRequestCurrencyCode(currencyCode),
    style: "currency",
  }).format(amountCents / 100);
}

export function formatCurrencyCodeLabel(currencyCode?: string): string {
  return getRequestCurrencyCode(currencyCode);
}
