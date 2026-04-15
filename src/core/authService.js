// src/core/authService.js

const API_URL = window.location.hostname === "localhost"
  ? "http://localhost:4000/api"
  : "https://webapp-1-0c95.onrender.com/api";

// ===== ГОСТЕВОЙ РЕЖИМ =====

/**
 * Войти как гость
 */
export function loginAsGuest() {
  const guestUser = {
    id: "guest_" + Date.now(),
    email: "guest@demo.local",
    isGuest: true,
    name: "Гость"
  };
  
  // Сохраняем в localStorage (не sessionStorage, чтобы не терялось при обновлении)
  localStorage.setItem("auth_token", "guest_token_" + guestUser.id);
  localStorage.setItem("auth_user", JSON.stringify(guestUser));
  localStorage.setItem("auth_mode", "guest");
  
  return { success: true, user: guestUser };
}

/**
 * Проверка, является ли пользователь гостем
 */
export function isGuest() {
  const mode = localStorage.getItem("auth_mode");
  const user = getCurrentUser();
  return mode === "guest" || user?.isGuest === true;
}

/**
 * Выход из гостевого режима
 */
export function logoutGuest() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_mode");
  return { success: true };
}

// ===== ОБЫЧНАЯ АВТОРИЗАЦИЯ =====

export async function registerUser(email, password) {
  if (isGuest()) {
    // Если гость пытается зарегистрироваться — сначала выходим
    logoutGuest();
  }
  
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });
    
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || `HTTP ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error("Registration error:", error);
    return { error: error.message || "Network error" };
  }
}

export async function loginUser(email, password) {
  if (isGuest()) {
    logoutGuest();
  }
  
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });
    
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || `HTTP ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.success || data.session || data.user) {
      localStorage.setItem("auth_token", data.session?.access_token || "demo");
      localStorage.setItem("auth_user", JSON.stringify(data.user || data.session?.user || { email }));
      localStorage.setItem("auth_mode", "user");
    }
    
    return data;
  } catch (error) {
    console.error("Login error:", error);
    return { error: error.message || "Network error" };
  }
}

export function checkAuth() {
  const token = localStorage.getItem("auth_token");
  const user = localStorage.getItem("auth_user");
  
  if (!token || !user) {
    return { authenticated: false };
  }
  
  return {
    authenticated: true,
    user: JSON.parse(user),
    isGuest: isGuest()
  };
}

export function logoutUser() {
  if (isGuest()) {
    return logoutGuest();
  }
  
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_mode");
  return { success: true };
}

export function getCurrentUser() {
  const user = localStorage.getItem("auth_user");
  return user ? JSON.parse(user) : null;
}

export function getAuthToken() {
  return localStorage.getItem("auth_token");
}