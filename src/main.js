import { initRouter } from "./core/router.js";
import { initUI, showAuthModal } from "./core/uiContainer.js";
import { checkAuth, getCurrentUser } from "./core/authService.js";
import { showToast } from "./utils/helpers.js";

// Точка входа приложения
async function initApp() {
  console.log("🚀 Smart Dashboard v2.0 initializing...");
  
  // Инициализация базового UI (с проверкой авторизации)
  initUI();
  
  // Проверка авторизации
  const auth = await checkAuth();
  
  if (auth.authenticated) {
    console.log("✅ User authenticated:", auth.user);
    showToast(`С возвращением, ${auth.user.email}! 👋`, "success");
    
    // Инициализация роутера
    initRouter();
  } else {
    console.log("⚠️ User not authenticated");
    // Показать форму входа автоматически (опционально)
    // showAuthModal("login");
  }
  
  // Регистрация Service Worker
  registerServiceWorker();
  
  // Глобальные обработчики
  setupGlobalHandlers();
  
  console.log("✅ App ready");
}

// Регистрация Service Worker
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("⚠️ Service Worker not supported");
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/src/serviceWorker.js", { scope: "/" });
      console.log("✅ Service Worker registered:", registration.scope);
      
      // Проверка обновлений
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("🔄 New version available");
            showToast("Доступно обновление! 🔄", "info", 5000);
          }
        });
      });
      
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
    }
  });
}

// Глобальные обработчики ошибок
function setupGlobalHandlers() {
  window.addEventListener("error", (event) => {
    console.error("💥 Global error:", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno
    });
    // Не показываем тост для каждой ошибки, чтобы не спамить
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("💥 Unhandled promise:", event.reason);
    event.preventDefault();
  });
  
  // Обработка онлайн/оффлайн
  window.addEventListener("online", () => {
    console.log("🌐 Online");
    showToast("Соединение восстановлено 🌐", "success", 2000);
  });
  
  window.addEventListener("offline", () => {
    console.log("📴 Offline");
    showToast("Нет соединения. Работа в оффлайн-режиме.", "warning", 3000);
  });
}

// Запуск
initApp();

// Экспорт для отладки в консоли
window.app = {
  showToast,
  showAuthModal,
  checkAuth: () => checkAuth().then(console.log)
};