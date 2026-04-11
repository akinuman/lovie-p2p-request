export interface AsyncActionFeedbackState {
  disabled: boolean;
  errorMessage: string | null;
  pending: boolean;
  showSpinner: boolean;
}

export const initialAsyncActionFeedbackState: AsyncActionFeedbackState = {
  disabled: false,
  errorMessage: null,
  pending: false,
  showSpinner: false,
};

export function createPendingAsyncActionFeedbackState(): AsyncActionFeedbackState {
  return {
    disabled: true,
    errorMessage: null,
    pending: true,
    showSpinner: true,
  };
}

export function createAsyncActionFeedbackState(input?: {
  errorMessage?: string | null;
  pending?: boolean;
}): AsyncActionFeedbackState {
  if (input?.pending) {
    return createPendingAsyncActionFeedbackState();
  }

  return {
    disabled: false,
    errorMessage: input?.errorMessage ?? null,
    pending: false,
    showSpinner: false,
  };
}
