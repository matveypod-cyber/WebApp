import { initUI } from "./core/uiContainer.js";
import { initRouter } from "./core/router.js";
import { checkAuth } from "./core/authService.js";

async function initApp() {
  console.log("🚀 Smart Dashboard initializing...");
  
  initUI();
  
  const auth = checkAuth();
  if (auth.authenticated) {
    console.log("✅ User authenticated:", auth.user);
    initRouter();
  } else {
    console.log("⚠️ User not authenticated");
  }
  
  // Регистрация SW - ПРАВИЛЬНЫЙ ПУТЬ
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/serviceWorker.js",  // ← В корне public/
        { scope: "/" }
      );
      console.log("✅ SW registered:", registration.scope);
    } catch (error) {
      console.error("❌ SW registration failed:", error);
    }
  }
  
  console.log("✅ App ready");
}

initApp();