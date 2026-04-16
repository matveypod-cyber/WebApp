// src/main.js
// Точка входа приложения Smart Dashboard PWA

import { initUI } from "./core/uiContainer.js";
import { initRouter } from "./core/router.js";
import { checkAuth, getCurrentUser, logoutUser } from "./core/authService.js";

// Глобальный объект для отладки
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
    // 1. Инициализация UI
    initUI();
    
    // 2. Проверка авторизации
    const auth = await checkAuth();
    
    if (auth.authenticated) {
      console.log("✅ User authenticated:", auth.user);
      // 3. Инициализация роутера
      initRouter();
    } else {
      console.log("⚠️ User not authenticated");
    }
    
    // 4. Регистрация Service Worker
    registerServiceWorker();
    
    // 5. Глобальные обработчики
    setupGlobalHandlers();
    
    console.log("✅ App ready");
    
  } catch (error) {
    console.error("❌ Failed to initialize app:", error);
  }
}

/**
 * Регистрация Service Worker
 */
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("⚠️ Service Worker not supported");
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
      
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
    }
  });
}

/**
 * Глобальные обработчики
 */
function setupGlobalHandlers() {
  // Онлайн/оффлайн
  window.addEventListener("online", () => {
    console.log("🌐 Online");
  });
  
  window.addEventListener("offline", () => {
    console.log("📴 Offline");
  });
  
  // Глобальные ошибки
  window.addEventListener("error", (event) => {
    console.error("💥 Global error:", event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("💥 Unhandled promise:", event.reason);
    event.preventDefault();
  });
}

// Запуск приложения
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}