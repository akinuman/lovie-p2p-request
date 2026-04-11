export type RequestFormField = "amount" | "note" | "recipientContact";

export interface CreateRequestActionState {
  errors: Partial<Record<RequestFormField | "form", string>>;
  values: Record<RequestFormField, string>;
}

export const initialCreateRequestActionState: CreateRequestActionState =
  createCreateRequestActionState();

export function createCreateRequestActionState(
  input?: Partial<CreateRequestActionState>,
): CreateRequestActionState {
  return {
    errors: {
      ...input?.errors,
    },
    values: {
      amount: "",
      note: "",
      recipientContact: "",
      ...input?.values,
    },
  };
}

export function createCreateRequestFormErrorState(
  values: Record<RequestFormField, string>,
  message: string,
): CreateRequestActionState {
  return createCreateRequestActionState({
    errors: {
      form: message,
    },
    values,
  });
}
