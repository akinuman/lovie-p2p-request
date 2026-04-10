"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  createCreateRequestActionState,
  createCreateRequestFormErrorState,
  type CreateRequestActionState,
  type RequestFormField,
} from "@/lib/requests/create-request-action-state";
import {
  createRequestMutation,
  getRequestRevalidationPaths,
  runRequestMutationWithRedirect,
} from "@/lib/use-cases/requests/mutations";
import {
  isSelfRequestRecipient,
  requestCreateSchema,
} from "@/lib/validation/requests";

function getStringValue(formData: FormData, key: RequestFormField) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getOptionalStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function buildRedirectUrl(
  pathname: string,
  searchParams: Record<string, string | undefined>,
) {
  const url = new URL(pathname, "http://localhost");

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return `${url.pathname}${url.search}`;
}

function getRequestActionPayload(formData: FormData) {
  const requestId = getOptionalStringValue(formData, "requestId");
  const returnTo = getOptionalStringValue(formData, "returnTo") ?? "/dashboard/incoming";

  if (!requestId) {
    throw new Error("Request not found.");
  }

  return {
    requestId,
    returnTo,
  };
}

function isConfirmedRequestAction(formData: FormData) {
  return getOptionalStringValue(formData, "confirmed") === "true";
}

function revalidateRequestPaths(requestId: string) {
  for (const path of [...getRequestRevalidationPaths(requestId), "/requests/new"]) {
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

  let requestId: string;

  try {
    const request = await createRequestMutation({
      amountCents: parsed.data.amountCents,
      note: parsed.data.note,
      recipientContactType: parsed.data.recipientContactType,
      recipientContactValue: parsed.data.recipientContactValue,
      senderUserId: currentUser.id,
    });

    requestId = request.id;

  } catch (error) {
    return createCreateRequestFormErrorState(
      values,
      error instanceof Error
        ? error.message
        : "We couldn’t create that request. Please try again.",
    );
  }

  revalidateRequestPaths(requestId);

  redirect(`/dashboard/outgoing?created=${requestId}`);
}

export async function declineRequestAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const { requestId, returnTo } = getRequestActionPayload(formData);
  const result = await runRequestMutationWithRedirect({
    actorUserId: currentUser.id,
    requestId,
    returnTo,
    type: "decline",
  });

  for (const path of result.revalidationPaths) {
    revalidatePath(path);
  }

  redirect(result.redirectPath);
}

export async function payRequestAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const { requestId, returnTo } = getRequestActionPayload(formData);

  if (!isConfirmedRequestAction(formData)) {
    redirect(
      buildRedirectUrl(returnTo, {
        requestError: "Confirm the payment before continuing.",
      }),
    );
  }

  const result = await runRequestMutationWithRedirect({
    actorUserId: currentUser.id,
    requestId,
    returnTo,
    type: "pay",
  });

  for (const path of result.revalidationPaths) {
    revalidatePath(path);
  }

  redirect(result.redirectPath);
}

export async function cancelRequestAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const requestId = getOptionalStringValue(formData, "requestId");
  const returnTo = getOptionalStringValue(formData, "returnTo") ?? "/dashboard/outgoing";

  if (!requestId) {
    throw new Error("Request not found.");
  }

  const result = await runRequestMutationWithRedirect({
    actorUserId: currentUser.id,
    requestId,
    returnTo,
    type: "cancel",
  });

  for (const path of result.revalidationPaths) {
    revalidatePath(path);
  }

  redirect(result.redirectPath);
}
