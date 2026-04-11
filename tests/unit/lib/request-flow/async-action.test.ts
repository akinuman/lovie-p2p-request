import { describe, expect, it } from "vitest";

import {
  createAsyncActionFeedbackState,
  createPendingAsyncActionFeedbackState,
  initialAsyncActionFeedbackState,
} from "@/use-cases/async-action-feedback";

describe("async action feedback helpers", () => {
  it("exposes an idle default state", () => {
    expect(initialAsyncActionFeedbackState).toEqual({
      disabled: false,
      errorMessage: null,
      pending: false,
      showSpinner: false,
    });
  });

  it("creates a pending state with duplicate-click protection", () => {
    expect(createPendingAsyncActionFeedbackState()).toEqual({
      disabled: true,
      errorMessage: null,
      pending: true,
      showSpinner: true,
    });
  });

  it("creates a resolved error state without leaving the button pending", () => {
    expect(
      createAsyncActionFeedbackState({
        errorMessage: "Copy failed.",
      }),
    ).toEqual({
      disabled: false,
      errorMessage: "Copy failed.",
      pending: false,
      showSpinner: false,
    });
  });
});
