export const DEFAULT_CURRENCY_CODE = "USD";

export function normalizeCurrencyCode(currencyCode?: string): string {
  const normalized = currencyCode?.trim().toUpperCase();

  if (!normalized) {
    return DEFAULT_CURRENCY_CODE;
  }

  return normalized;
}

export function formatAmountFromCents(
  amountCents: number,
  currencyCode?: string,
  locale = "en-US",
): string {
  if (!Number.isInteger(amountCents)) {
    throw new Error("Amount cents must be an integer.");
  }

  return new Intl.NumberFormat(locale, {
    currency: normalizeCurrencyCode(currencyCode),
    style: "currency",
  }).format(amountCents / 100);
}

export function formatCurrencyCodeLabel(currencyCode?: string): string {
  return normalizeCurrencyCode(currencyCode);
}
