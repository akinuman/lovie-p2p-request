"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  isSelfRequestRecipient,
  requestCreateSchema,
} from "@/lib/validation/requests";
import { createRequestMutation } from "@/use-cases/create-request";
import {
  createCreateRequestActionState,
  createCreateRequestFormErrorState,
  createCreateRequestSuccessState,
  type CreateRequestActionState,
  type RequestFormField,
} from "@/use-cases/create-request-form-state";
import {
  createRequestMutationErrorState,
  createRequestMutationSuccessState,
  initialRequestMutationActionState,
  type RequestMutationActionState,
} from "@/use-cases/request-action-state";
import {
  getRequestRevalidationPaths,
  runRequestMutation,
} from "@/use-cases/mutate-request";

function getStringValue(formData: FormData, key: RequestFormField) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getOptionalStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getRequestActionPayload(formData: FormData) {
  const requestId = getOptionalStringValue(formData, "requestId");

  if (!requestId) {
    throw new Error("Request not found.");
  }

  return { requestId };
}

function isConfirmedRequestAction(formData: FormData) {
  return getOptionalStringValue(formData, "confirmed") === "true";
}

function revalidateRequestPaths(requestId: string) {
  for (const path of [
    ...getRequestRevalidationPaths(requestId),
    "/requests/new",
  ]) {
    revalidatePath(path);
  }
}

export async function createRequestAction(
  _previousState: CreateRequestActionState,
  formData: FormData,
): Promise<CreateRequestActionState> {
  const currentUser = await requireCurrentUser();
  const values = {
    amount: getStringValue(formData, "amount"),
    note: getStringValue(formData, "note"),
    recipientContact: getStringValue(formData, "recipientContact"),
  };

  const parsed = requestCreateSchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return createCreateRequestActionState({
      errors: {
        amount: fieldErrors.amount?.[0],
        note: fieldErrors.note?.[0],
        recipientContact: fieldErrors.recipientContact?.[0],
      },
      values,
    });
  }

  if (
    isSelfRequestRecipient({
      currentUserEmail: currentUser.email,
      currentUserPhone: currentUser.phone,
      recipientContactType: parsed.data.recipientContactType,
      recipientContactValue: parsed.data.recipientContactValue,
    })
  ) {
    return createCreateRequestActionState({
      errors: {
        recipientContact: "You can’t create a payment request for yourself.",
      },
      values,
    });
  }

  let request:
    | Awaited<ReturnType<typeof createRequestMutation>>
    | undefined;

  try {
    request = await createRequestMutation({
      amountCents: parsed.data.amountCents,
      note: parsed.data.note,
      recipientContactType: parsed.data.recipientContactType,
      recipientContactValue: parsed.data.recipientContactValue,
      senderUserId: currentUser.id,
    });
  } catch (error) {
    return createCreateRequestFormErrorState(
      values,
      error instanceof Error
        ? error.message
        : "We couldn’t create that request. Please try again.",
    );
  }

  if (!request) {
    return createCreateRequestFormErrorState(
      values,
      "We couldn’t create that request. Please try again.",
    );
  }

  revalidateRequestPaths(request.id);

  return createCreateRequestSuccessState({
    amountCents: request.amountCents,
    currencyCode: request.currencyCode,
    note: request.note,
    recipientLabel: request.recipientContactValue,
    requestId: request.id,
  });
}

async function mutateRequestAction(
  formData: FormData,
  type: "cancel" | "decline" | "pay",
  successMessage: string,
  fallbackMessage: string,
): Promise<RequestMutationActionState> {
  try {
    const currentUser = await requireCurrentUser();
    const { requestId } = getRequestActionPayload(formData);

    if (type === "pay" && !isConfirmedRequestAction(formData)) {
      return createRequestMutationErrorState(
        "Confirm the payment before continuing.",
      );
    }

    const request = await runRequestMutation({
      actorUserId: currentUser.id,
      requestId,
      type,
    });

    for (const path of getRequestRevalidationPaths(request.id)) {
      revalidatePath(path);
    }

    return createRequestMutationSuccessState(successMessage);
  } catch (error) {
    return createRequestMutationErrorState(
      error instanceof Error ? error.message : fallbackMessage,
    );
  }
}

export async function declineRequestAction(
  previousState: RequestMutationActionState = initialRequestMutationActionState,
  formData: FormData,
) {
  void previousState;

  return mutateRequestAction(
    formData,
    "decline",
    "Request declined.",
    "We couldn’t decline that request.",
  );
}

export async function payRequestAction(
  previousState: RequestMutationActionState = initialRequestMutationActionState,
  formData: FormData,
) {
  void previousState;

  return mutateRequestAction(
    formData,
    "pay",
    "Request marked as paid.",
    "We couldn’t process that payment.",
  );
}

export async function cancelRequestAction(
  previousState: RequestMutationActionState = initialRequestMutationActionState,
  formData: FormData,
) {
  void previousState;

  return mutateRequestAction(
    formData,
    "cancel",
    "Request cancelled.",
    "We couldn’t cancel that request.",
  );
}
