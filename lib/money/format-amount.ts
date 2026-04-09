export function formatAmountFromCents(amountCents: number): string {
  if (!Number.isInteger(amountCents)) {
    throw new Error("Amount cents must be an integer.");
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amountCents / 100);
}
