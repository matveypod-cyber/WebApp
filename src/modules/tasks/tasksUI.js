import { getMainContainer } from "../../core/uiContainer.js";
import { getTasks, addTask, toggleTask, deleteTask, getTotalPoints, clearCompleted } from "./tasks.js";
import { showToast } from "../../utils/helpers.js";

export async function renderTasksUI() {
  const container = getMainContainer();
  if (!container) return;
  
  const tasks = getTasks();
  const points = getTotalPoints();
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  container.innerHTML = `
    <div class="module tasks-module slide-in">
      <!-- Заголовок -->
      <div class="module-header">
        <h2>📋 Задачи</h2>
        <div class="module-stats">
          <span class="stat">💰 <span class="stat-value">${points}</span> баллов</span>
          <span class="stat">✅ ${completedCount}/${tasks.length} выполнено</span>
        </div>
      </div>
      
      <!-- Прогресс бар -->
      <div style="margin-bottom: var(--space-lg);">
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs); font-size: 0.85rem; color: var(--text-muted);">
          <span>Прогресс</span>
          <span>${progress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
      
      <!-- Форма добавления -->
      <form id="task-form" class="form-row" style="margin-bottom: var(--space-lg);">
        <input type="text" id="task-title" placeholder="Что нужно сделать?" required autocomplete="off" />
        <input type="number" id="task-points" placeholder="Баллы" value="1" min="1" max="100" />
        <button type="submit" class="btn btn-primary">
          <span>➕</span> Добавить
        </button>
      </form>
      
      <!-- Список задач -->
      ${tasks.length === 0 ? renderEmptyState() : renderTaskList(tasks)}
      
      <!-- Действия -->
      ${tasks.some(t => t.completed) ? `
        <div style="margin-top: var(--space-lg); text-align: right;">
          <button id="clear-completed" class="btn btn-secondary btn-sm">
            🗑️ Очистить выполненные
          </button>
        </div>
      ` : ''}
    </div>
  `;

  // Обработчики
  setupTaskForm();
  setupTaskInteractions();
  setupClearCompleted();
}

// Пустое состояние
function renderEmptyState() {
  return `
    <div class="empty-state fade-in">
      <div class="icon">✨</div>
      <h3>Нет задач</h3>
      <p>Добавьте первую задачу, чтобы начать отслеживать прогресс!</p>
    </div>
  `;
}

// Список задач
function renderTaskList(tasks) {
  return `
    <ul class="list">
      ${tasks.map(task => `
        <li class="list-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="item-content">
            <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''} />
            <span class="item-title">${escapeHtml(task.title)}</span>
            <span class="item-points">+${task.points}</span>
          </div>
          <div class="card-actions">
            <button class="btn-icon btn-danger" title="Удалить" data-action="delete">🗑️</button>
          </div>
        </li>
      `).join('')}
    </ul>
  `;
}

// Настройка формы
function setupTaskForm() {
  const form = document.getElementById("task-form");
  if (!form) return;
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const titleInput = document.getElementById("task-title");
    const pointsInput = document.getElementById("task-points");
    
    const title = titleInput.value.trim();
    const points = parseInt(pointsInput.value) || 1;
    
    if (!title) {
      showToast("Введите название задачи", "warning");
      titleInput.focus();
      return;
    }
    
    addTask({ title, points });
    showToast("Задача добавлена! 🎯", "success");
    
    form.reset();
    renderTasksUI();
  });
}

// Обработчики задач
function setupTaskInteractions() {
  // Чекбоксы
  document.querySelectorAll(".task-check").forEach(checkbox => {
    checkbox.addEventListener("change", (e) => {
      const taskId = parseInt(e.target.closest(".list-item").dataset.id);
      const task = toggleTask(taskId);
      
      if (task?.completed) {
        showToast(`+${task.points} баллов! 🎉`, "success", 2000);
      }
      
      renderTasksUI();
    });
  });
  
  // Удаление
  document.querySelectorAll("[data-action='delete']").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const taskId = parseInt(e.target.closest(".list-item").dataset.id);
      
      if (confirm("Удалить задачу?")) {
        deleteTask(taskId);
        showToast("Задача удалена", "info");
        renderTasksUI();
      }
    });
  });
}

// Очистка выполненных
function setupClearCompleted() {
  const btn = document.getElementById("clear-completed");
  if (!btn) return;
  
  btn.addEventListener("click", () => {
    if (confirm("Удалить все выполненные задачи?")) {
      clearCompleted();
      showToast("Выполненные задачи очищены 🧹", "success");
      renderTasksUI();
    }
  });
}

// XSS защита
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}