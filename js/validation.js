const checkoutForm = document.querySelector('#checkout-form');

if (checkoutForm) {
  const fields = Array.from(
    checkoutForm.querySelectorAll('input, select, textarea')
  ).filter((field) => field.willValidate);

  const checkoutMessage = document.querySelector('#checkout-message');

  // Создаём место для ошибки и связываем его с полем.
  fields.forEach((field) => {
    const error = document.createElement('small');
    error.classList.add('form-error');
    error.id = `${field.id}-error`;
    error.hidden = true;

    const container = field.closest('.order-form__field');
    container.append(error);

    const descriptions = field.getAttribute('aria-describedby');
    field.setAttribute(
      'aria-describedby',
      [descriptions, error.id].filter(Boolean).join(' ')
    );
  });

  function getFieldError(field) {
    if (field.type === 'checkbox' && field.required && !field.checked) {
      return 'Подтверди согласие на обработку данных.';
    }

    const value = field.value.trim();

    if (field.required && !value) {
      return 'Заполни это поле.';
    }

    if (field.id === 'client-name' && value && value.length < 2) {
      return 'Введи имя длиной хотя бы два символа.';
    }

    if (field.type === 'email' && field.validity.typeMismatch) {
      return 'Введи почту в формате name@example.ru.';
    }

    if (field.id === 'client-phone' && value) {
      const digits = value.replace(/\D/g, '');
      const allowedCharacters = /^[+\d\s()-]+$/.test(value);
      const validNumber = /^[78]\d{10}$/.test(digits);

      if (!allowedCharacters || !validNumber) {
        return 'Введи 11 цифр номера, начиная с 7 или 8.';
      }
    }

    if (!field.validity.valid) {
      return field.validationMessage;
    }

    return '';
  }

  function validateField(field) {
    const message = getFieldError(field);
    const error = document.getElementById(`${field.id}-error`);

    error.textContent = message;
    error.hidden = !message;

    if (message) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }

    return !message;
  }

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      checkoutMessage.textContent = '';

      if (field.hasAttribute('aria-invalid')) {
        validateField(field);
      }
    });

    field.addEventListener('change', () => {
      validateField(field);
    });
  });

  checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let firstInvalidField = null;

    fields.forEach((field) => {
      const valid = validateField(field);

      if (!valid && !firstInvalidField) {
        firstInvalidField = field;
      }
    });

    if (firstInvalidField) {
      checkoutMessage.textContent =
        'Проверь отмеченные поля перед отправкой.';
      firstInvalidField.focus();
      return;
    }

    checkoutMessage.textContent =
      'Учебная заявка успешно проверена. Отправка на сервер пока не подключена.';
  });

  checkoutForm.addEventListener('reset', () => {
    fields.forEach((field) => {
      field.removeAttribute('aria-invalid');

      const error = document.getElementById(`${field.id}-error`);
      error.textContent = '';
      error.hidden = true;
    });

    checkoutMessage.textContent = '';
  });
}