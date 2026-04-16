// src/main.js
// Точка входа приложения Smart Dashboard PWA

import { initUI } from "./core/uiContainer.js";
import { initRouter } from "./core/router.js";
import { checkAuth, getCurrentUser, logoutUser } from "./core/authService.js";
import { showToast } from "./utils/helpers.js";

// Глобальный объект для отладки (опционально)
window.App = {
  version: "2.0.0",
  checkAuth: () => checkAuth(),
  getCurrentUser: () => getCurrentUser(),
  logout: () => logoutUser()
};

/**
 * Инициализация приложения
 */
async function initApp() {
  console.log("🚀 Smart Dashboard v2.0 initializing...");
  
  try {
    // 1. Инициализация базового UI (с проверкой авторизации)
    initUI();
    
    // 2. Проверка авторизации
    const auth = await checkAuth();
    
    if (auth.authenticated) {
      console.log("✅ User authenticated:", auth.user);
      showToast(`С возвращением, ${auth.user?.email || auth.user?.name}! 👋`, "success", 2000);
      
      // 3. Инициализация роутера и загрузка первого модуля
      initRouter();
    } else {
      console.log("⚠️ User not authenticated - showing auth screen");
      // Auth экран уже показан в initUI()
    }
    
    // 4. Регистрация Service Worker
    registerServiceWorker();
    
    // 5. Глобальные обработчики ошибок и событий
    setupGlobalHandlers();
    
    // 6. Проверка обновлений при возврате вкладки
    setupVisibilityHandler();
    
    console.log("✅ App ready");
    
  } catch (error) {
    console.error("❌ Failed to initialize app:", error);
    showToast("Ошибка загрузки приложения", "error");
  }
}

/**
 * Регистрация Service Worker
 * Файл должен лежать в корне public/ (не в src/)
 */
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("⚠️ Service Worker not supported in this browser");
    return;
  }

  window.addEventListener("load", async () => {
    try {
      // ✅ ПРАВИЛЬНЫЙ ПУТЬ: файл в корне public/
      const registration = await navigator.serviceWorker.register(
        "/serviceWorker.js",
        { scope: "/" }
      );
      
      console.log("✅ Service Worker registered:", registration.scope);
      
      // Проверка обновлений при установке новой версии
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("🔄 New version available");
            showToast("Доступно обновление приложения! 🔄", "info", 5000);
            
            // Опционально: предложить пользователю обновить
            if (confirm("Доступна новая версия. Применить сейчас?")) {
              if (registration.waiting) {
                registration.waiting.postMessage({ type: "SKIP_WAITING" });
              }
              window.location.reload();
            }
          }
        });
      });
      
      // Проверка при активации
      if (registration.active) {
        console.log("✅ Service Worker active");
      }
      
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
      // Не показываем тост, чтобы не спамить пользователя
    }
  });
}

/**
 * Глобальные обработчики ошибок
 */
function setupGlobalHandlers() {
  // Обработка глобальных ошибок JavaScript
  window.addEventListener("error", (event) => {
    console.error("💥 Global error:", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
    // Не показываем тост для каждой ошибки, чтобы не спамить
  });

  // Обработка необработанных промисов
  window.addEventListener("unhandledrejection", (event) => {
    console.error("💥 Unhandled promise rejection:", event.reason);
    // Предотвращаем вывод ошибки в консоль (мы уже залогировали)
    event.preventDefault();
  });
  
  // Обработка онлайн/оффлайн статуса
  window.addEventListener("online", () => {
    console.log("🌐 Online");
    showToast("🌐 Соединение восстановлено", "success", 2000);
    
    // Опционально: синхронизировать данные с сервером
    syncOfflineData();
  });
  
  window.addEventListener("offline", () => {
    console.log("📴 Offline");
    showToast("📴 Работа в оффлайн-режиме", "warning", 3000);
  });
  
  // Обработка изменений в localStorage (синхронизация между вкладками)
  window.addEventListener("storage", (event) => {
    if (event.key?.startsWith("sd_")) {
      console.log("[Storage] Changed in another tab:", event.key);
      // Можно добавить логику обновления UI при изменении данных в другой вкладке
      window.dispatchEvent(new CustomEvent("storage:synced", { detail: { key: event.key } }));
    }
  });
}

/**
 * Обработчик видимости вкладки (для проверки обновлений)
 */
function setupVisibilityHandler() {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      console.log("👁️ Tab visible - checking for updates");
      
      // Проверить обновления Service Worker
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "CHECK_UPDATES" });
      }
      
      // Проверить авторизацию (токен мог истечь)
      checkAuth().then(auth => {
        if (!auth.authenticated && getCurrentUser()) {
          // Токен истёк — перезагрузить интерфейс
          console.log("🔄 Session expired, reloading UI");
          logoutUser();
          if (typeof window.initUI === "function") {
            window.initUI();
          }
        }
      });
    }
  });
}

/**
 * Синхронизация оффлайн-данных с сервером (когда появился интернет)
 */
async function syncOfflineData() {
  if (!navigator.onLine) return;
  
  const auth = checkAuth();
  if (!auth.authenticated || auth.isGuest) return;
  
  console.log("🔄 Syncing offline data...");
  
  try {
    // Здесь можно добавить логику отправки накопленных данных на сервер
    // Например: отправка новых задач, заметок, обновлений прогресса
    
    // Пример (псевдокод):
    // const pendingTasks = getPendingTasks();
    // if (pendingTasks.length > 0) {
    //   await syncTasksWithServer(pendingTasks);
    // }
    
    console.log("✅ Sync complete");
  } catch (error) {
    console.error("❌ Sync failed:", error);
  }
}

/**
 * Утилита: проверка, запущено ли приложение в режиме разработки
 */
export function isDev() {
  return window.location.hostname === "localhost" || 
         window.location.hostname === "127.0.0.1" ||
         window.location.hostname.includes(".github.dev");
}

/**
 * Утилита: получение базового URL API
 * Используется в authService.js и других модулях
 */
export function getApiBaseUrl() {
  return isDev() 
    ? "http://localhost:4000/api" 
    : "/api";  // через nginx proxy в продакшене
}

// ===== Экспорт для использования в других модулях =====

export { 
  initApp, 
  registerServiceWorker, 
  setupGlobalHandlers,
  isDev,
  getApiBaseUrl
};

// ===== Запуск приложения =====

// Если документ уже загружен — запускаем сразу
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// Для отладки в консоли
if (isDev()) {
  console.log("🔧 Dev mode: window.App available for debugging");
}