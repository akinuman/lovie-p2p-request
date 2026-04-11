export type RequestMutationActionState =
  | {
      status: "idle";
      message: null;
    }
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

export const initialRequestMutationActionState: RequestMutationActionState = {
  message: null,
  status: "idle",
};

export function createRequestMutationSuccessState(
  message: string,
): RequestMutationActionState {
  return {
    message,
    status: "success",
  };
}

export function createRequestMutationErrorState(
  message: string,
): RequestMutationActionState {
  return {
    message,
    status: "error",
  };
}
