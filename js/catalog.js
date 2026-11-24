const catalogGrid = document.querySelector('#catalog-grid');
const catalogSearch = document.querySelector('#catalog-search');
const catalogCategory = document.querySelector('#catalog-category');
const catalogSort = document.querySelector('#catalog-sort');
const catalogCount = document.querySelector('#catalog-count');
const catalogEmpty = document.querySelector('#catalog-empty');

function formatCatalogPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);
}

function createProductCard(item) {
  const card = document.createElement('article');
  card.classList.add('product-card');

  const image = document.createElement('img');
  image.classList.add('product-card__image');
  image.src = item.image;
  image.alt = item.title;
  image.loading = 'lazy';

  // Сохраняем адаптивные варианты изображения рюкзака.
  if (item.id === 1) {
    image.srcset =
      'images/backpack-400.png 400w, images/backpack-800.png 800w';
    image.sizes =
      '(max-width: 767px) calc(100vw - 66px), ' +
      '(max-width: 1023px) 45vw, 350px';
  }

  const title = document.createElement('h3');
  title.classList.add('product-card__title');
  title.textContent = item.title;

  const description = document.createElement('p');
  description.classList.add('product-card__description');
  description.textContent = item.description;

  const price = document.createElement('p');
  price.classList.add('product-card__price');
  price.textContent = formatCatalogPrice(item.price);

  const availability = document.createElement('p');
  availability.classList.add('product-card__description');
  availability.textContent = item.isAvailable
    ? 'В наличии'
    : 'Нет в наличии';

  const button = document.createElement('button');
  button.classList.add('button', 'button--primary', 'product-card__button');
  button.type = 'button';
  button.dataset.productId = String(item.id);
  button.textContent = item.isAvailable ? 'В корзину' : 'Нет в наличии';
  button.disabled = !item.isAvailable;

  card.append(image, title, description, price, availability, button);

  return card;
}

function updateCatalog() {
  const query = catalogSearch.value.trim().toLocaleLowerCase('ru-RU');
  const category = catalogCategory.value;
  const sort = catalogSort.value;

  let visibleProducts = products.filter((item) => {
    const matchesQuery = item.title
      .toLocaleLowerCase('ru-RU')
      .includes(query);

    const matchesCategory = !category || item.category === category;

    return matchesQuery && matchesCategory;
  });

  // filter() вернул новый массив, поэтому исходный products сохраняется.
  if (sort === 'price-asc') {
    visibleProducts.sort((first, second) => first.price - second.price);
  }

  if (sort === 'price-desc') {
    visibleProducts.sort((first, second) => second.price - first.price);
  }

  if (sort === 'title') {
    visibleProducts.sort((first, second) =>
      first.title.localeCompare(second.title, 'ru')
    );
  }

  catalogGrid.replaceChildren();

  visibleProducts.forEach((item) => {
    catalogGrid.append(createProductCard(item));
  });

  catalogCount.textContent = `Найдено товаров: ${visibleProducts.length}`;
  catalogEmpty.hidden = visibleProducts.length > 0;
}

if (
  catalogGrid &&
  catalogSearch &&
  catalogCategory &&
  catalogSort &&
  catalogCount &&
  catalogEmpty
) {
  catalogSearch.addEventListener('input', updateCatalog);
  catalogCategory.addEventListener('change', updateCatalog);
  catalogSort.addEventListener('change', updateCatalog);

  updateCatalog();
}

if (catalogGrid) {
  catalogGrid.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-product-id]');

    if (!button) {
      return;
    }

    addToCart(Number(button.dataset.productId));
  });
}