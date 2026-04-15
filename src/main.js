// src/main.js - точка входа приложения
import { initUI } from "./core/uiContainer.js";
import { initRouter } from "./core/router.js";
import { checkAuth } from "./core/authService.js";

async function initApp() {
  console.log("🚀 Smart Dashboard initializing...");
  
  // 1. Инициализация UI
  initUI();
  
  // 2. Проверка авторизации
  const auth = await checkAuth();
  
  if (auth.authenticated) {
    console.log("✅ User authenticated:", auth.user);
    initRouter();
  } else {
    console.log("⚠️ User not authenticated - showing auth screen");
  }
  
  // 3. Регистрация Service Worker
  registerServiceWorker();
  
  console.log("✅ App ready");
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          "/src/serviceWorker.js", 
          { scope: "/" }
        );
        console.log("✅ Service Worker registered:", registration.scope);
      } catch (error) {
        console.error("❌ Service Worker registration failed:", error);
      }
    });
  }
}

// Запуск
initApp();