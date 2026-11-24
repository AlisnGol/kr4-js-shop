const checkoutSummary = document.querySelector('#checkout-summary');

if (checkoutSummary && cart.length > 0) {
  const itemsList = document.querySelector('#checkout-items');
  const totalText = document.querySelector('#checkout-total');

  cart.forEach((entry) => {
    const item = products.find(
      (product) => product.id === entry.productId
    );

    const listItem = document.createElement('li');

    listItem.textContent =
      `${item.title} — ${entry.quantity} шт. × ` +
      `${formatCartPrice(item.price)} = ` +
      `${formatCartPrice(item.price * entry.quantity)}`;

    itemsList.append(listItem);
  });

  const total = getCartTotal();
  const discountAmount = Math.round(total * promoDiscount / 100);
  const finalTotal = total - discountAmount;

  if (promoDiscount > 0) {
    totalText.textContent =
      `Сумма товаров: ${formatCartPrice(total)}. ` +
      `Скидка ${promoDiscount}%: ${formatCartPrice(discountAmount)}. ` +
      `К оплате: ${formatCartPrice(finalTotal)}.`;
  } else {
    totalText.textContent = `К оплате: ${formatCartPrice(finalTotal)}.`;
  }

  checkoutSummary.hidden = false;

  // При заказе корзины отдельный выбор товара и количества скрываем.
  const productSelect = document.querySelector('#order-product');
  const amountInput = document.querySelector('#order-amount');

  [productSelect, amountInput].forEach((field) => {
    if (field) {
      field.disabled = true;

      const container = field.closest('.order-form__field');

      if (container) {
        container.hidden = true;
      }
    }
  });
}