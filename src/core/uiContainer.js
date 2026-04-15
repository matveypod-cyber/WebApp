import { navigate } from "./router.js";

// Инициализация базового UI
export function initUI() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <header class="app-header">
            <h1>Smart Dashboard</h1>
            <nav class="app-nav">
                <button data-path="/tasks" class="nav-btn active">Задачи</button>
                <button data-path="/notes" class="nav-btn">Заметки</button>
                <button data-path="/tracker" class="nav-btn">Прогресс</button>
            </nav>
        </header>
        <main id="main-content" class="app-main"></main>
    `;
    
    // Привязка кнопок навигации
    const buttons = app.querySelectorAll("button[data-path]");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const path = btn.getAttribute("data-path");
            
            // Обновляем активную кнопку
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            navigate(path);
        });
    });
}

// Получение контейнера для рендеринга модулей
export function getMainContainer() {
    return document.getElementById("main-content");
}