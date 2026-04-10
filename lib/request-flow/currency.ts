export const DEFAULT_REQUEST_CURRENCY = "USD";

export function getRequestCurrencyCode(currencyCode?: string): string {
  return currencyCode ?? DEFAULT_REQUEST_CURRENCY;
}
