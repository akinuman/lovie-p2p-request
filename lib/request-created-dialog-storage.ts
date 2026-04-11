import type { CreatedRequestDialogState } from "@/use-cases/create-request-form-state";

const REQUEST_CREATED_DIALOG_STORAGE_KEY = "request-created-dialog";

function isCreatedRequestDialogState(
  value: unknown,
): value is CreatedRequestDialogState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CreatedRequestDialogState>;

  return (
    typeof candidate.amountCents === "number" &&
    typeof candidate.currencyCode === "string" &&
    typeof candidate.recipientLabel === "string" &&
    typeof candidate.requestId === "string" &&
    (candidate.note === null ||
      candidate.note === undefined ||
      typeof candidate.note === "string")
  );
}

export function storeCreatedRequestDialogState(
  createdRequest: CreatedRequestDialogState,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    REQUEST_CREATED_DIALOG_STORAGE_KEY,
    JSON.stringify(createdRequest),
  );
}

export function readCreatedRequestDialogState() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.sessionStorage.getItem(
    REQUEST_CREATED_DIALOG_STORAGE_KEY,
  );

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;

    if (isCreatedRequestDialogState(parsedValue)) {
      return parsedValue;
    }
  } catch {
    // Ignore malformed session data and clear it below.
  }

  clearCreatedRequestDialogState();

  return null;
}

export function clearCreatedRequestDialogState() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(REQUEST_CREATED_DIALOG_STORAGE_KEY);
}
