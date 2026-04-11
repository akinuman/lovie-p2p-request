export type RequestFormField = "amount" | "note" | "recipientContact";

export interface CreatedRequestDialogState {
  amountCents: number;
  currencyCode: string;
  note?: string | null;
  recipientLabel: string;
  requestId: string;
}

export interface CreateRequestActionState {
  createdRequest: CreatedRequestDialogState | null;
  errors: Partial<Record<RequestFormField | "form", string>>;
  values: Record<RequestFormField, string>;
}

export const initialCreateRequestActionState: CreateRequestActionState =
  createCreateRequestActionState();

export function createCreateRequestActionState(
  input?: Partial<CreateRequestActionState>,
): CreateRequestActionState {
  return {
    createdRequest: input?.createdRequest ?? null,
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

export function createCreateRequestSuccessState(
  createdRequest: CreatedRequestDialogState,
): CreateRequestActionState {
  return createCreateRequestActionState({
    createdRequest,
  });
}
