// Правильный API_URL для Render
const API_URL = window.location.hostname === "localhost"
  ? "http://localhost:4000/api"
  : "https://webapp-1-0c95.onrender.com/api";  // ← с /api в конце!

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
    
    // Сохраняем сессию
    if (data.success || data.session || data.user) {
      localStorage.setItem("auth_token", data.session?.access_token || "demo");
      localStorage.setItem("auth_user", JSON.stringify(data.user || data.session?.user || { email }));
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
    user: JSON.parse(user)
  };
}

export function logoutUser() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  return { success: true };
}

export function getCurrentUser() {
  const user = localStorage.getItem("auth_user");
  return user ? JSON.parse(user) : null;
}