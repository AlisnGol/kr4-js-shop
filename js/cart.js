function loadPromoDiscount() {
  try {
    return localStorage.getItem('shkolamarket-kr4-promo') === 'SCHOOL10'
      ? 10
      : 0;
  } catch {
    return 0;
  }
}

function savePromoDiscount() {
  try {
    if (promoDiscount === 10) {
      localStorage.setItem('shkolamarket-kr4-promo', 'SCHOOL10');
    } else {
      localStorage.removeItem('shkolamarket-kr4-promo');
    }

    return true;
  } catch {
    return false;
  }
}

let promoDiscount = loadPromoDiscount();
const CART_STORAGE_KEY = 'shkolamarket-kr4-cart';

function loadCart() {
  try {
    const savedCart = JSON.parse(
      localStorage.getItem(CART_STORAGE_KEY) || '[]'
    );

    if (!Array.isArray(savedCart)) {
      return [];
    }

    return savedCart.filter((entry) =>
      entry &&
      Number.isInteger(entry.productId) &&
      Number.isInteger(entry.quantity) &&
      entry.quantity > 0 &&
      products.some((item) => item.id === entry.productId)
    );
  } catch {
    return [];
  }
}

let cart = loadCart();

function getCartQuantity() {
  return cart.reduce((total, entry) => total + entry.quantity, 0);
}

function updateCartCounter() {
  document.querySelectorAll('[data-cart-count]').forEach((element) => {
    element.textContent = String(getCartQuantity());
  });
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    return true;
  } catch {
    return false;
  }
}

function addToCart(productId) {
  const selectedProduct = products.find((item) => item.id === productId);

  if (!selectedProduct || !selectedProduct.isAvailable) {
    return;
  }

  const cartEntry = cart.find((entry) => entry.productId === productId);

  if (cartEntry) {
    cartEntry.quantity += 1;
  } else {
    cart.push({
      productId,
      quantity: 1
    });
  }

  const saved = saveCart();
  updateCartCounter();

  const message = document.querySelector('#cart-message');

  if (message) {
    message.textContent = saved
      ? `«${selectedProduct.title}» добавлен в корзину.`
      : 'Товар добавлен. Браузер не смог сохранить корзину после закрытия страницы.';
  }
}

updateCartCounter();

function formatCartPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);
}

function getCartTotal() {
  return cart.reduce((total, entry) => {
    const item = products.find((product) => product.id === entry.productId);
    return total + item.price * entry.quantity;
  }, 0);
}

function createCartItem(entry) {
  const item = products.find((product) => product.id === entry.productId);

  const row = document.createElement('article');
  row.classList.add('cart-item');

  const image = document.createElement('img');
  image.src = item.image;
  image.alt = item.title;
  image.classList.add('cart-item__image');

  const info = document.createElement('div');

  const title = document.createElement('h2');
  title.classList.add('cart-item__title');
  title.textContent = item.title;

  const price = document.createElement('p');
  price.textContent = `Цена за штуку: ${formatCartPrice(item.price)}`;

  const quantityLabel = document.createElement('label');
  quantityLabel.textContent = 'Количество';
  quantityLabel.htmlFor = `cart-quantity-${item.id}`;

  const quantity = document.createElement('input');
  quantity.classList.add('order-form__input', 'cart-item__quantity');
  quantity.id = `cart-quantity-${item.id}`;
  quantity.type = 'number';
  quantity.min = '1';
  quantity.step = '1';
  quantity.value = String(entry.quantity);
  quantity.dataset.quantityId = String(item.id);

  const subtotal = document.createElement('p');
  subtotal.textContent =
    `Стоимость: ${formatCartPrice(item.price * entry.quantity)}`;

  const removeButton = document.createElement('button');
  removeButton.classList.add('button', 'button--secondary');
  removeButton.type = 'button';
  removeButton.textContent = 'Удалить';
  removeButton.dataset.removeId = String(item.id);
  removeButton.setAttribute('aria-label', `Удалить ${item.title} из корзины`);

  info.append(title, price, quantityLabel, quantity, subtotal, removeButton);
  row.append(image, info);

  return row;
}

function renderCart() {
  const list = document.querySelector('#cart-list');

  if (!list) {
    return;
  }

  list.replaceChildren();

  cart.forEach((entry) => {
    list.append(createCartItem(entry));
  });

  document.querySelector('#cart-empty').hidden = cart.length > 0;
  document.querySelector('#cart-content').hidden = cart.length === 0;
  const total = getCartTotal();
  const discountAmount = Math.round(total * promoDiscount / 100);

  document.querySelector('#cart-total').textContent =
    formatCartPrice(total - discountAmount);

  const discountText = document.querySelector('#cart-discount');

  if (discountText) {
    discountText.textContent = promoDiscount > 0
        ? `Скидка ${promoDiscount}%: ${formatCartPrice(discountAmount)}`
        : '';
    }

  updateCartCounter();
}

function saveAndRenderCart(message) {
  const saved = saveCart();
  renderCart();

  const status = document.querySelector('#cart-message');

  status.textContent = saved
    ? message
    : `${message} Браузер не смог сохранить изменения.`;
}

const cartList = document.querySelector('#cart-list');

if (cartList) {
  cartList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-remove-id]');

    if (!button) {
      return;
    }

    const productId = Number(button.dataset.removeId);
    const itemIndex = cart.findIndex((entry) => entry.productId === productId);
    const item = products.find((product) => product.id === productId);

    cart = cart.filter((entry) => entry.productId !== productId);
    saveAndRenderCart(`«${item.title}» удалён из корзины.`);

    // После перерисовки переносим фокус на соседнюю кнопку.
    const remainingButtons = cartList.querySelectorAll('[data-remove-id]');
    const nextButton = remainingButtons[
      Math.min(itemIndex, remainingButtons.length - 1)
    ];

    if (nextButton) {
      nextButton.focus();
    } else {
      document.querySelector('#cart-empty a').focus();
    }
  });

  cartList.addEventListener('change', (event) => {
    const input = event.target.closest('input[data-quantity-id]');

    if (!input) {
      return;
    }

    const productId = Number(input.dataset.quantityId);
    const entry = cart.find((item) => item.productId === productId);
    const quantity = Number(input.value);

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      input.value = String(entry.quantity);
      document.querySelector('#cart-message').textContent =
        'Количество должно быть целым числом от 1.';
      return;
    }

    entry.quantity = quantity;
    saveAndRenderCart('Количество и сумма обновлены.');

    document.querySelector(`#cart-quantity-${productId}`).focus();
  });

  renderCart();
}

const promoInput = document.querySelector('#promo-code');
const applyPromoButton = document.querySelector('#apply-promo');
const removePromoButton = document.querySelector('#remove-promo');
const promoMessage = document.querySelector('#promo-message');

if (
  promoInput &&
  applyPromoButton &&
  removePromoButton &&
  promoMessage
) {
  applyPromoButton.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();

    if (code !== 'SCHOOL10') {
      promoMessage.textContent =
        'Промокод не найден. Проверь написание.';

      promoInput.setAttribute('aria-invalid', 'true');
      return;
    }

    promoDiscount = 10;

    const saved = savePromoDiscount();

    promoInput.removeAttribute('aria-invalid');
    promoMessage.textContent = saved
    ? 'Промокод применён и сохранён. Скидка 10%.'
    : 'Скидка применена на этой странице. Браузер не смог сохранить промокод.';

    renderCart();
  });

  removePromoButton.addEventListener('click', () => {
    promoDiscount = 0;

    const saved = savePromoDiscount();

    promoInput.value = '';
    promoInput.removeAttribute('aria-invalid');
    promoMessage.textContent = saved
        ? 'Скидка убрана.'
        : 'Скидка убрана на этой странице. Браузер не смог удалить сохранённый промокод.';

    renderCart();
  });

  promoInput.addEventListener('input', () => {
    promoInput.removeAttribute('aria-invalid');
    promoMessage.textContent = '';
  });
}

if (promoInput && promoMessage && promoDiscount === 10) {
  promoInput.value = 'SCHOOL10';
  promoMessage.textContent = 'Применён сохранённый промокод SCHOOL10.';
}