"use server";

import { redirect } from "next/navigation";
import { DEMO_SESSION_ID, isProductChoiceId } from "@/lib/preview-flow";
import { createCheckoutOrderFromSession } from "@/server/orders";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function confirmCheckoutAction(formData: FormData) {
  const sessionId = getFormValue(formData, "sessionId") || DEMO_SESSION_ID;
  const outputId = getFormValue(formData, "outputId");
  const productId = getFormValue(formData, "productId");
  const customerName = getFormValue(formData, "customerName");
  const customerPhone = getFormValue(formData, "customerPhone");
  const deliveryAddress = getFormValue(formData, "deliveryAddress");

  if (sessionId === DEMO_SESSION_ID) {
    redirect("/create?error=session");
  }

  if (!outputId || !isProductChoiceId(productId)) {
    redirect(`/results/${sessionId}?error=checkout`);
  }

  let orderId = "";

  try {
    const order = await createCheckoutOrderFromSession({
      sessionId,
      outputId,
      productId,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      deliveryAddress: deliveryAddress || null,
    });
    orderId = order.id;
  } catch (error) {
    console.error("Failed to confirm checkout.", error);
    redirect(`/checkout/${sessionId}?output=${outputId}&product=${productId}&error=confirm`);
  }

  redirect(`/orders/${orderId}`);
}
