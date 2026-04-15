// src/core/uiContainer.js
import { navigate } from "./router.js";
import { 
  getCurrentUser, 
  logoutUser, 
  loginAsGuest, 
  isGuest,
  checkAuth 
} from "./authService.js";
import { showToast } from "../utils/helpers.js";

export function initUI() {
  const app = document.getElementById("app");
  if (!app) return;
  
  const auth = checkAuth();
  const user = auth.user;
  const isGuestMode = auth.isGuest;
  
  app.innerHTML = `
    <header class="app-header fade-in">
      <h1 class="app-title">🚀 Smart Dashboard</h1>
      
      ${user ? `
        <div class="user-menu" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          ${isGuestMode ? `
            <span class="guest-badge" style="background:var(--warning);color:#1f2937;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:600;">
              👤 Гостевой режим
            </span>
          ` : ''}
          <span class="user-email" style="font-size:0.9rem;color:var(--text-secondary);">
            ${user.name || user.email}
          </span>
          <button id="logout-btn" class="btn btn-secondary btn-sm">Выйти</button>
        </div>
      ` : `
        <button id="login-btn" class="btn btn-primary btn-sm">Войти</button>
      `}
      
      <nav class="app-nav ${user ? '' : 'disabled'}">
        <button data-path="/tasks" class="nav-btn active">
          <span class="icon">📋</span><span>Задачи</span>
        </button>
        <button data-path="/notes" class="nav-btn">
          <span class="icon">📝</span><span>Заметки</span>
        </button>
        <button data-path="/tracker" class="nav-btn">
          <span class="icon">📊</span><span>Трекер</span>
        </button>
      </nav>
    </header>
    
    <main id="main-content" class="main-content">
      ${user ? `
        <div class="loading"><div class="spinner"></div><p>Загрузка...</p></div>
      ` : renderAuthScreen(isGuestMode)}
    </main>
    
    <footer class="app-footer">
      <small>🚀 Smart Dashboard PWA • 
        <a href="#" onclick="showAbout();return false">О приложении</a>
        ${isGuestMode ? ' • <span style="color:var(--warning)">Данные сохраняются только в этом браузере</span>' : ''}
      </small>
    </footer>
    
    <div id="toast-container" class="toast-container"></div>
    <div id="auth-modal" class="modal-overlay" style="display:none;">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-title">Вход</h3>
          <button class="modal-close" id="modal-close">&times;</button>
        </div>
        <div class="modal-body" id="modal-body"></div>
      </div>
    </div>
  `;
  
  setupNavigation();
  setupAuthButtons();
  setupModal();
  initToastSystem();
  
  console.log("✅ UI initialized");
}

// Экран авторизации с кнопкой гостя
function renderAuthScreen(isGuestMode) {
  return `
    <div class="module slide-in" style="max-width:400px;margin:0 auto;">
      <div class="empty-state" style="padding:var(--space-lg);">
        <div class="icon" style="font-size:4rem;">🔐</div>
        <h3 style="margin:var(--space-md) 0;">Добро пожаловать!</h3>
        <p style="color:var(--text-muted);margin-bottom:var(--space-lg);">
          Войдите или зарегистрируйтесь для доступа к задачам и заметкам.
        </p>
        
        <div style="display:flex;flex-direction:column;gap:var(--space-sm);">
          <button id="show-login" class="btn btn-primary">Войти</button>
          <button id="show-register" class="btn btn-secondary">Зарегистрироваться</button>
          
          <div style="margin:var(--space-md) 0;text-align:center;color:var(--text-muted);">
            <span>или</span>
          </div>
          
          <button id="guest-btn" class="btn btn-secondary" style="border-style:dashed;">
            👤 Продолжить как гость
          </button>
        </div>
        
        ${isGuestMode ? `
          <div style="margin-top:var(--space-lg);padding:var(--space-md);background:rgba(245,158,11,0.1);border-radius:var(--border-radius);font-size:0.85rem;color:var(--text-secondary);">
            <strong>💡 Гостевой режим:</strong><br>
            • Все данные сохраняются в этом браузере<br>
            • При очистке кэша данные пропадут<br>
            • Для синхронизации между устройствами нужна регистрация
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function setupNavigation() {
  document.querySelectorAll("button[data-path]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      
      const auth = checkAuth();
      if (!auth.authenticated) {
        showToast("Требуется авторизация", "warning");
        showAuthModal("login");
        return;
      }
      
      const path = btn.getAttribute("data-path");
      btn.style.transform = "scale(0.95)";
      setTimeout(() => { 
        btn.style.transform = ""; 
        navigate(path); 
      }, 100);
    });
  });
}

function setupAuthButtons() {
  // Кнопка входа
  document.getElementById("login-btn")?.addEventListener("click", () => showAuthModal("login"));
  document.getElementById("show-login")?.addEventListener("click", () => showAuthModal("login"));
  
  // Кнопка регистрации
  document.getElementById("show-register")?.addEventListener("click", () => showAuthModal("register"));
  
  // 🔥 Кнопка гостя
  document.getElementById("guest-btn")?.addEventListener("click", () => {
    const result = loginAsGuest();
    if (result.success) {
      showToast("👤 Гостевой режим активирован", "info", 3000);
      initUI();
      navigate("/tasks");
    }
  });
  
  // Кнопка выхода
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    const auth = checkAuth();
    const message = auth.isGuest 
      ? "Завершить гостевой сеанс?" 
      : "Выйти из аккаунта?";
    
    if (confirm(message)) {
      await logoutUser();
      showToast(auth.isGuest ? "Гостевой сеанс завершён" : "Вы вышли из аккаунта", "info");
      initUI();
      navigate("/");
    }
  });
}

function setupModal() {
  const modal = document.getElementById("auth-modal");
  const closeBtn = document.getElementById("modal-close");
  
  closeBtn?.addEventListener("click", () => { modal.style.display = "none"; });
  modal?.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });
}

export function showAuthModal(type = "login") {
  const modal = document.getElementById("auth-modal");
  const title = document.getElementById("modal-title");
  const body = document.getElementById("modal-body");
  
  if (!modal || !body) return;
  
  title.textContent = type === "login" ? "Вход" : "Регистрация";
  
  body.innerHTML = `
    <form id="auth-form" class="form-group">
      <div class="form-group" style="margin-bottom:var(--space-md);">
        <label for="email" style="display:block;margin-bottom:var(--space-xs);font-weight:500;">Email</label>
        <input type="email" id="email" name="email" required placeholder="you@example.com" style="width:100%;padding:var(--space-sm) var(--space-md);" />
      </div>
      <div class="form-group" style="margin-bottom:var(--space-lg);">
        <label for="password" style="display:block;margin-bottom:var(--space-xs);font-weight:500;">Пароль</label>
        <input type="password" id="password" name="password" required placeholder="••••••••" minlength="6" style="width:100%;padding:var(--space-sm) var(--space-md);" />
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;">${type === "login" ? "Войти" : "Зарегистрироваться"}</button>
    </form>
    <p style="text-align:center;margin-top:var(--space-md);font-size:0.9rem;color:var(--text-muted);">
      ${type === "login" 
        ? 'Нет аккаунта? <a href="#" id="switch-to-register" style="color:var(--accent-secondary);">Зарегистрироваться</a>' 
        : 'Уже есть аккаунт? <a href="#" id="switch-to-login" style="color:var(--accent-secondary);">Войти</a>'}
    </p>
  `;
  
  document.getElementById("switch-to-login")?.addEventListener("click", (e) => { e.preventDefault(); showAuthModal("login"); });
  document.getElementById("switch-to-register")?.addEventListener("click", (e) => { e.preventDefault(); showAuthModal("register"); });
  
  document.getElementById("auth-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const submitBtn = e.target.querySelector("button[type='submit']");
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Загрузка...";
    
    try {
      const { registerUser, loginUser } = await import("./authService.js");
      const result = type === "login" 
        ? await loginUser(email, password) 
        : await registerUser(email, password);
      
      if (result.success) {
        showToast(type === "login" ? "Добро пожаловать! 👋" : "Регистрация успешна! Теперь войдите.", "success");
        modal.style.display = "none";
        initUI();
        if (type === "login") navigate("/tasks");
        else showAuthModal("login");
      } else {
        showToast(result.error || "Ошибка", "error");
      }
    } catch {
      showToast("Ошибка сети", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = type === "login" ? "Войти" : "Зарегистрироваться";
    }
  });
  
  modal.style.display = "flex";
}

export function updateActiveNav(path) {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-path") === path) btn.classList.add("active");
  });
}

export function getMainContainer() {
  return document.getElementById("main-content");
}

// Toast system
function initToastSystem() {
  setInterval(() => {
    document.querySelectorAll(".toast").forEach(toast => {
      const timeout = parseInt(toast.dataset.timeout);
      const created = parseInt(toast.dataset.created);
      if (Date.now() - created > timeout) {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100px)";
        setTimeout(() => toast.remove(), 300);
      }
    });
  }, 500);
}

export function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  const toast = document.createElement("div");
  toast.className = `toast ${type} fade-in`;
  toast.dataset.timeout = duration;
  toast.dataset.created = Date.now();
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100px)";
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Экспорт для использования в других модулях
window.showToast = showToast;
window.showAuthModal = showAuthModal;
window.showAbout = () => showToast("Smart Dashboard PWA v2.0\nГостевой режим + Offline + CRUD", "info", 5000);