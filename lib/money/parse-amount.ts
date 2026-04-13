const TWO_DECIMAL_AMOUNT_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;

export const MAX_REQUEST_AMOUNT_CENTS = 1_000_000_000;
export const MAX_REQUEST_AMOUNT_LABEL = "10,000,000";

export function parseAmountToCents(rawAmount: string): number {
  const normalized = rawAmount.trim();

  if (!normalized || !TWO_DECIMAL_AMOUNT_PATTERN.test(normalized)) {
    throw new Error("Enter a valid amount with up to 2 decimal places.");
  }

  const [dollarsPart, centsPart = ""] = normalized.split(".");
  const cents = Number.parseInt((centsPart + "00").slice(0, 2), 10);
  const dollars = Number.parseInt(dollarsPart, 10);
  const amountCents = dollars * 100 + cents;

  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  if (amountCents > MAX_REQUEST_AMOUNT_CENTS) {
    throw new Error(`Amount must be ${MAX_REQUEST_AMOUNT_LABEL} or less.`);
  }

  return amountCents;
}
