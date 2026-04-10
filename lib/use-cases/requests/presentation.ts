export interface RequestPresentationInput {
  amountCents: number;
  currencyCode: string;
  id: string;
}

// Phase 1 scaffold: Phase 2 will normalize dialog and card presentation here.
export function buildRequestPresentation<TInput extends RequestPresentationInput>(
  input: TInput,
): TInput {
  return input;
}
