export interface RequestMutationInput {
  requestId: string;
}

// Phase 1 scaffold: Phase 2 will orchestrate create/pay/decline/cancel flows here.
export async function runRequestMutation(
  input: RequestMutationInput,
): Promise<never> {
  void input;
  throw new Error("runRequestMutation is not implemented yet.");
}
