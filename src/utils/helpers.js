/**
 * Вспомогательные функции для приложения
 */

/**
 * Дебаунс функции
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Форматирование даты
 */
export function formatDate(date, locale = 'ru-RU') {
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Генерация уникального ID
 */
export function generateId() {
  return Date.now() + Math.floor(Math.random() * 10000);
}

/**
 * Безопасное экранирование HTML
 */
export function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Показать тост-уведомление
 */
export function showToast(message, type = 'info', duration = 3000) {
  // Если контейнер тостов существует — используем его
  const container = document.getElementById('toast-container');
  if (container && typeof window.showToast === 'function') {
    window.showToast(message, type, duration);
    return;
  }
  
  // Fallback через alert/console
  console.log(`[${type.toUpperCase()}] ${message}`);
  if (type === 'error') {
    console.error(message);
  }
}

/**
 * Проверка онлайн-статуса
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Валидация формы
 */
export function validateForm(formData, rules) {
  const errors = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];
    
    if (rule.required && !value?.trim()) {
      errors.push(`${field} обязателен`);
      continue;
    }
    
    if (rule.minLength && value?.length < rule.minLength) {
      errors.push(`${field} должен быть не короче ${rule.minLength} символов`);
    }
    
    if (rule.maxLength && value?.length > rule.maxLength) {
      errors.push(`${field} не должен превышать ${rule.maxLength} символов`);
    }
    
    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors.push(rule.errorMessage || `Неверный формат ${field}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Копирование в буфер обмена
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Скопировано! 📋", "success", 1500);
    return true;
  } catch {
    showToast("Не удалось скопировать", "error");
    return false;
  }
}

/**
 * Локальное хранилище с обработкой ошибок
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      showToast("Не удалось сохранить данные", "error");
      return false;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};