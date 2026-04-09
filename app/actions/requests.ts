"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  initialCreateRequestActionState,
  type CreateRequestActionState,
  type RequestFormField,
} from "@/lib/requests/create-request-action-state";
import { createPaymentRequest, getRequestRevalidationPaths } from "@/lib/requests/mutations";
import {
  isSelfRequestRecipient,
  requestCreateSchema,
} from "@/lib/validation/requests";

function getStringValue(formData: FormData, key: RequestFormField) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
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

    return {
      errors: {
        amount: fieldErrors.amount?.[0],
        note: fieldErrors.note?.[0],
        recipientContact: fieldErrors.recipientContact?.[0],
      },
      values,
    };
  }

  if (
    isSelfRequestRecipient({
      currentUserEmail: currentUser.email,
      currentUserPhone: currentUser.phone,
      recipientContactType: parsed.data.recipientContactType,
      recipientContactValue: parsed.data.recipientContactValue,
    })
  ) {
    return {
      errors: {
        recipientContact: "You can’t create a payment request for yourself.",
      },
      values,
    };
  }

  let requestId: string;

  try {
    const request = await createPaymentRequest({
      amountCents: parsed.data.amountCents,
      note: parsed.data.note,
      recipientContactType: parsed.data.recipientContactType,
      recipientContactValue: parsed.data.recipientContactValue,
      senderUserId: currentUser.id,
    });

    requestId = request.id;

  } catch (error) {
    return {
      errors: {
        form:
          error instanceof Error
            ? error.message
            : "We couldn’t create that request. Please try again.",
      },
      values,
    };
  }

  for (const path of [...getRequestRevalidationPaths(requestId), "/requests/new"]) {
    revalidatePath(path);
  }

  redirect(`/dashboard/outgoing?created=${requestId}`);
}
