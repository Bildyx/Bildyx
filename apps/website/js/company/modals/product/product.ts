import { $, modalContent } from "../../dom";

export function hydrateProductModal(
  name: string,
  payload: Record<string, string>,
) {
  if (name !== "edit-product" || !modalContent) {
    return;
  }

  const productId = $<HTMLInputElement>(
    '[data-field="productId"]',
    modalContent,
  );

  if (productId) {
    productId.value = payload.productId ?? "";
  }
}
