// src/utils/helpers.js

export function showToast(message, type = "info", duration = 3000) {
  // Проверяем, есть ли уже контейнер
  let container = document.getElementById("toast-container");
  
  // Создаём контейнер, если нет
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    document.body.appendChild(container);
  }
  
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️"
  };
  
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    padding: 12px 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#6366f1'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 250px;
  `;
  
  toast.innerHTML = `
    <span>${icons[type] || icons.info}</span>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Добавляем анимацию
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  if (!document.querySelector("style[data-toast]")) {
    style.setAttribute("data-toast", "true");
    document.head.appendChild(style);
  }
  
  // Удаляем через duration
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}