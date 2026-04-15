/**
 * Абстракция над localStorage с префиксами и обработкой ошибок
 */

const PREFIX = "sd_"; // smart-dashboard

export const storage = {
  /**
   * Получить значение
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  /**
   * Сохранить значение
   */
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      // Обработка переполнения квоты
      if (e.name === "QuotaExceededError") {
        console.warn("⚠️ localStorage full, cleaning old data...");
        this.cleanup();
        try {
          localStorage.setItem(PREFIX + key, JSON.stringify(value));
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  },

  /**
   * Удалить значение
   */
  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Очистка старых данных (по префиксу)
   */
  cleanup() {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(PREFIX + "temp_") || key.startsWith(PREFIX + "cache_")) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
  },

  /**
   * Получить все ключи с префиксом
   */
  keys() {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .map(k => k.replace(PREFIX, ""));
  },

  /**
   * Очистить всё с префиксом
   */
  clear() {
    this.keys().forEach(key => this.remove(key));
  },

  /**
   * Проверка поддержки
   */
  isSupported() {
    try {
      const test = "__test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
};

// Экспорт для удобства
export const { get, set, remove, clear, keys, isSupported } = storage;

// Модульные хранилища
export const moduleStorage = {
  tasks: {
    key: "tasks",
    get: () => storage.get("tasks", []),
    set: (data) => storage.set("tasks", data)
  },
  notes: {
    key: "notes",
    get: () => storage.get("notes", []),
    set: (data) => storage.set("notes", data)
  },
  tracker: {
    key: "tracker",
    get: () => storage.get("tracker", { scores: {}, streaks: {} }),
    set: (data) => storage.set("tracker", data)
  },
  settings: {
    key: "settings",
    get: () => storage.get("settings", { theme: "auto", notifications: true }),
    set: (data) => storage.set("settings", data)
  }
};