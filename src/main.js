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
  // Регистрация SW - ПРАВИЛЬНЫЙ ПУТЬ
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/serviceWorker.js", { scope: "/" })
    .then(reg => console.log("✅ SW registered:", reg.scope))
    .catch(err => console.log("❌ SW failed:", err));
}
  
  console.log("✅ App ready");
}

initApp();