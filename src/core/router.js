// src/core/router.js
let routes = {};
let defaultRoute = null;
let currentRoute = null;

// Инициализация маршрутов
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

// Программная навигация
export function navigate(path) {
  if (currentRoute === path) return;
  
  history.pushState({}, "", path);
  handleRoute();
}

// Обработка маршрута
async function handleRoute() {
  const path = window.location.pathname;
  const route = routes[path] ? path : defaultRoute;
  
  if (route !== currentRoute) {
    await loadModule(route);
  }
}

// Динамическая загрузка модуля
async function loadModule(modulePath) {
  const container = document.getElementById("main-content");
  if (!container) return;
  
  // Показываем лоадер
  container.innerHTML = `
    <div class="loading fade-in">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>
  `;
  
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
        <div class="empty-state fade-in">
          <div class="icon">⚠️</div>
          <h3>Ошибка</h3>
          <p>${error.message}</p>
          <button class="btn btn-secondary" onclick="window.location.reload()" style="margin-top:16px">🔄 Обновить</button>
        </div>
      `;
    }
  }
}

// Обновление активной кнопки
function updateActiveNav(path) {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-path") === path) {
      btn.classList.add("active");
    }
  });
}

// Экспорт для uiContainer
export { navigate as routerNavigate };