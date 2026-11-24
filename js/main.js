// Форматируем число как цену в рублях.
function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);
}

// Вычисляем цену после скидки.
function calculateDiscountPrice(price, discountPercent) {
  return Math.round(price * (1 - discountPercent / 100));
}

// Определяем статус товара.
function getAvailabilityText(isAvailable) {
  if (isAvailable) {
    return 'В наличии';
  }

  return 'Нет в наличии';
}

// Собираем краткое описание из данных товара.
function getProductSummary(item) {
  return `${item.title} — ${formatPrice(item.price)}. ${getAvailabilityText(item.isAvailable)}.`;
}

console.log('JavaScript подключён');
console.log('Товар:', product);
console.log('Описание:', getProductSummary(product));
console.log(
  'Цена со скидкой 10%:',
  formatPrice(calculateDiscountPrice(product.price, 10))
);

// Поиск по части названия без учёта регистра.
function searchProducts(items, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU');

  return items.filter((item) =>
    item.title.toLocaleLowerCase('ru-RU').includes(normalizedQuery)
  );
}

// Пустая категория означает показ всех товаров.
function filterProductsByCategory(items, category) {
  if (!category) {
    return [...items];
  }

  return items.filter((item) => item.category === category);
}

// Сортируем копию, сохраняя исходный порядок массива.
function sortProductsByPrice(items) {
  return [...items].sort((first, second) => first.price - second.price);
}

// Считаем общую стоимость по одной штуке каждого товара.
function calculateTotalPrice(items) {
  return items.reduce((total, item) => total + item.price, 0);
}

console.table(products);
console.log('Количество товаров:', products.length);
console.log('Поиск пенала:', searchProducts(products, 'пенал'));
console.log('Книги:', filterProductsByCategory(products, 'books'));
console.log('По возрастанию цены:', sortProductsByPrice(products));
console.log('Стоимость всех товаров:', formatPrice(calculateTotalPrice(products)));