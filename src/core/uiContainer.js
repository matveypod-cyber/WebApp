// src/core/uiContainer.js
import { navigate } from "./router.js";
import { getCurrentUser, logoutUser, loginAsGuest, checkAuth } from "./authService.js";
import { showToast } from "../utils/helpers.js";  // ✅ ИМПОРТ (не объявлять повторно!)

export function initUI() {
  const app = document.getElementById("app");
  if (!app) {
    console.error("❌ #app container not found");
    return;
  }
  
  const auth = checkAuth();
  const user = auth.user;
  const isGuestMode = auth.isGuest;
  
  app.innerHTML = `
    <header class="app-header">
      <h1 class="app-title">🚀 Smart Dashboard</h1>
      
      ${user ? `
        <div class="user-menu">
          ${isGuestMode ? '<span class="guest-badge">👤 Гость</span>' : ''}
          <span class="user-email">${user.email || user.name}</span>
          <button id="logout-btn" class="btn-logout">Выход</button>
        </div>
      ` : `
        <button id="guest-btn" class="btn-guest">👤 Войти как гость</button>
      `}
      
      <nav class="app-nav">
        <button data-path="/tasks" class="nav-btn active">📋 Задачи</button>
        <button data-path="/notes" class="nav-btn">📝 Заметки</button>
        <button data-path="/tracker" class="nav-btn">📊 Прогресс</button>
      </nav>
    </header>
    
    <main id="main-content" class="main-content">
      ${user ? `
        <div class="loading">Загрузка модулей...</div>
      ` : renderAuthScreen()}
    </main>
    
    <footer class="app-footer">
      <p>© 2026 Smart Dashboard PWA | Работает оффлайн</p>
    </footer>
  `;
  
  setupNavigation();
  setupAuthButtons();
  
  console.log("✅ UI initialized");
}

function renderAuthScreen() {
  return `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Smart Dashboard</h2>
        <p>Вход / Регистрация</p>
        
        <div class="auth-tabs">
          <button id="tab-login" class="tab-btn active">Вход</button>
          <button id="tab-register" class="tab-btn">Регистрация</button>
        </div>
        
        <form id="auth-form">
          <div class="form-group">
            <label>Email</label>
            <input id="auth-email" type="email" placeholder="demo@gmail.com" required />
          </div>
          <div class="form-group">
            <label>Пароль</label>
            <input id="auth-password" type="password" minlength="6" placeholder="******" required />
          </div>
          <button type="submit" id="auth-submit" class="btn-primary">Войти</button>
        </form>
        
        <div id="auth-message"></div>
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
        showToast("Требуется авторизация! Войдите как гость.", "warning");
        return;
      }
      const path = btn.getAttribute("data-path");
      navigate(path);
    });
  });
}

function setupAuthButtons() {
  // Кнопка гостя
  document.getElementById("guest-btn")?.addEventListener("click", () => {
    const result = loginAsGuest();
    if (result.success) {
      showToast("👤 Гостевой режим активирован!", "success");
      setTimeout(() => location.reload(), 1000);
    }
  });
  
  // Кнопка выхода
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    if (confirm("Выйти из аккаунта?")) {
      logoutUser();
      location.reload();
    }
  });
  
  // Вкладки
  document.getElementById("tab-login")?.addEventListener("click", () => {
    document.getElementById("tab-login").classList.add("active");
    document.getElementById("tab-register").classList.remove("active");
    document.getElementById("auth-submit").textContent = "Войти";
  });
  
  document.getElementById("tab-register")?.addEventListener("click", () => {
    document.getElementById("tab-register").classList.add("active");
    document.getElementById("tab-login").classList.remove("active");
    document.getElementById("auth-submit").textContent = "Зарегистрироваться";
  });
  
  // Форма
  document.getElementById("auth-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;
    const submitBtn = document.getElementById("auth-submit");
    const message = document.getElementById("auth-message");
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Загрузка...";
    
    try {
      const isLogin = document.getElementById("tab-login").classList.contains("active");
      const url = isLogin ? "/api/login" : "/api/register";
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (data.success || data.user || data.session) {
        showToast(isLogin ? "✅ Вход выполнен!" : "✅ Регистрация успешна!", "success");
        
        if (isLogin) {
          localStorage.setItem("auth_token", data.session?.access_token || "demo");
          localStorage.setItem("auth_user", JSON.stringify(data.user || data.session?.user || { email }));
          setTimeout(() => location.reload(), 1000);
        } else {
          setTimeout(() => {
            alert("Теперь войдите с вашими данными");
            submitBtn.disabled = false;
            submitBtn.textContent = "Зарегистрироваться";
          }, 1500);
        }
      } else {
        showToast("❌ " + (data.error || "Ошибка"), "error");
        submitBtn.disabled = false;
        submitBtn.textContent = isLogin ? "Войти" : "Зарегистрироваться";
      }
    } catch (err) {
      showToast("❌ Ошибка сети: " + err.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Войти";
    }
  });
}

export function getMainContainer() {
  return document.getElementById("main-content");
}

export function updateActiveNav(path) {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-path") === path) {
      btn.classList.add("active");
    }
  });
}