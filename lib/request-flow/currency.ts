export const DEFAULT_REQUEST_CURRENCY = "USD";

export function normalizeRequestCurrencyCode(currencyCode?: string): string {
  const normalized = currencyCode?.trim().toUpperCase();

  if (!normalized) {
    return DEFAULT_REQUEST_CURRENCY;
  }

  return normalized;
}

export function getRequestCurrencyCode(currencyCode?: string): string {
  return normalizeRequestCurrencyCode(currencyCode);
}
