// src/main.js
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

initApp();