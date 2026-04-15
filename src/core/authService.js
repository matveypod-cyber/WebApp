// src/core/authService.js

// API_URL: localhost или продакшен (Render)
const API_URL = window.location.hostname === "localhost"
  ? "http://localhost:4000/api"              // локальный бэкенд
  : "https://webapp-1-0c95.onrender.com/api"; // Render + /api префикс

/**
 * Регистрация пользователя
 */
export async function registerUser(email, password) {
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

/**
 * Логин пользователя
 */
export async function loginUser(email, password) {
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
    
    // Сохраняем сессию в localStorage
    if (data.success || data.session || data.user) {
      localStorage.setItem("auth_token", data.session?.access_token || "demo");
      localStorage.setItem("auth_user", JSON.stringify(data.user || data.session?.user || { email }));
      localStorage.setItem("auth_expires", Date.now() + 24 * 60 * 60 * 1000); // 24 часа
    }
    
    return data;
  } catch (error) {
    console.error("Login error:", error);
    return { error: error.message || "Network error" };
  }
}

/**
 * Проверка авторизации
 */
export function checkAuth() {
  const token = localStorage.getItem("auth_token");
  const user = localStorage.getItem("auth_user");
  const expires = localStorage.getItem("auth_expires");
  
  // Проверка истечения токена
  if (!token || !user || (expires && Date.now() > parseInt(expires))) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_expires");
    return { authenticated: false };
  }
  
  return {
    authenticated: true,
    user: JSON.parse(user)
  };
}

/**
 * Логаут
 */
export function logoutUser() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_expires");
  return { success: true };
}

/**
 * Получение текущего пользователя
 */
export function getCurrentUser() {
  const user = localStorage.getItem("auth_user");
  return user ? JSON.parse(user) : null;
}

/**
 * Получение токена для запросов
 */
export function getAuthToken() {
  return localStorage.getItem("auth_token");
}