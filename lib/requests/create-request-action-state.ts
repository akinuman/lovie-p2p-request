export type RequestFormField = "amount" | "note" | "recipientContact";

export interface CreateRequestActionState {
  errors: Partial<Record<RequestFormField | "form", string>>;
  values: Record<RequestFormField, string>;
}

export const initialCreateRequestActionState: CreateRequestActionState = {
  errors: {},
  values: {
    amount: "",
    note: "",
    recipientContact: "",
  },
};
