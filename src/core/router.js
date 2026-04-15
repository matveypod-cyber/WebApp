// src/core/router.js
import { getMainContainer, updateActiveNav } from "./uiContainer.js";

let routes = {};
let defaultRoute = null;
let currentRoute = null;

export function initRouter() {
  console.log("🧭 Router initializing...");
  
  routes = {
    "/": () => loadModule("/tasks"),
    "/tasks": () => loadModule("/tasks"),
    "/notes": () => loadModule("/notes"),
    "/tracker": () => loadModule("/tracker")
  };
  
  defaultRoute = "/tasks";
  
  window.addEventListener("popstate", handleRoute);
  handleRoute();
  
  console.log("✅ Router ready");
}

export function navigate(path) {
  if (currentRoute === path) return;
  
  history.pushState({}, "", path);
  handleRoute();
}

async function handleRoute() {
  const path = window.location.pathname;
  const route = routes[path] ? path : defaultRoute;
  
  if (route !== currentRoute) {
    await loadModule(route);
  }
}

async function loadModule(modulePath) {
  const container = getMainContainer();
  if (!container) return;
  
  container.innerHTML = '<div class="loading">Загрузка...</div>';
  
  try {
    const moduleMap = {
      "/tasks": "../modules/tasks/tasksUI.js",
      "/notes": "../modules/notes/notesUI.js",
      "/tracker": "../modules/tracker/trackerUI.js"
    };
    
    const moduleFile = moduleMap[modulePath];
    if (!moduleFile) throw new Error(`Маршрут не найден: ${modulePath}`);
    
    const module = await import(moduleFile);
    const renderFn = module.renderTasksUI || module.renderNotesUI || module.renderTrackerUI;
    
    if (typeof renderFn === "function") {
      await renderFn();
      currentRoute = modulePath;
      updateActiveNav(modulePath);
      console.log(`✅ Module loaded: ${modulePath}`);
    } else {
      throw new Error("Функция рендера не найдена");
    }
    
  } catch (error) {
    console.error(`❌ Failed to load ${modulePath}:`, error);
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <h3>Ошибка загрузки</h3>
          <p>${error.message}</p>
          <button onclick="location.reload()">Обновить</button>
        </div>
      `;
    }
  }
}

export { navigate as routerNavigate };