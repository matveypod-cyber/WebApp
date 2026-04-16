// src/modules/tasks/tasksUI.js
import { getMainContainer } from "../../core/uiContainer.js";
import { 
  getTasks, 
  addTask, 
  completeTask,
  deleteTask, 
  getTotalPoints, 
  clearCompleted 
} from "./tasks.js";

// Флаг: обработчики уже добавлены
let handlersInitialized = false;

export function renderTasksUI() {
  const container = getMainContainer();
  if (!container) return;
  
  const tasks = getTasks();
  const points = getTotalPoints();

  container.innerHTML = `
    <div class="module tasks-module">
      <div class="module-header">
        <h2>📋 Задачи</h2>
        <div class="stats">Баллы: <strong>${points}</strong></div>
      </div>
      
      <form id="task-form" style="margin: 16px 0; display: flex; gap: 8px;">
        <input type="text" id="task-title" placeholder="Новая задача" required style="flex: 1; padding: 8px;" />
        <input type="number" id="task-points" placeholder="Баллы" value="1" min="1" style="width: 80px; padding: 8px;" />
        <button type="submit" class="btn-primary">➕ Добавить</button>
      </form>
      
      <ul id="task-list" style="list-style: none; padding: 0;">
        ${tasks.map(task => `
          <li style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background: var(--bg-card); border-radius: 8px; ${task.completed ? 'opacity: 0.6;' : ''}">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
              <input type="checkbox" data-task-id="${task.id}" class="task-checkbox" ${task.completed ? 'checked' : ''} style="width: 20px; height: 20px;" />
              <span style="flex: 1; ${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.title}</span>
              <span style="background: var(--primary); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.85rem;">${task.points} б.</span>
            </div>
            <button data-action="delete" data-task-id="${task.id}" style="background: var(--danger); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">🗑️</button>
          </li>
        `).join('')}
      </ul>
      
      ${tasks.some(t => t.completed) ? `
        <button id="clear-completed" style="margin-top: 16px; padding: 8px 16px; background: var(--bg-tertiary); border: none; border-radius: 6px; cursor: pointer;">🧹 Очистить выполненные</button>
      ` : ''}
    </div>
  `;

  // ✅ Добавляем обработчики ТОЛЬКО ОДИН РАЗ
  if (!handlersInitialized) {
    setupEventHandlers();
    handlersInitialized = true;
  }
}

// Вынесем обработчики в отдельную функцию
function setupEventHandlers() {
  // Форма добавления задачи
  document.getElementById('task-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const points = parseInt(document.getElementById('task-points').value);
    if (title) {
      addTask({ title, points });
      renderTasksUI();
    }
  });

  // Делегирование событий для списка задач
  document.getElementById('task-list')?.addEventListener('change', (e) => {
    if (e.target.classList.contains('task-checkbox')) {
      const taskId = parseInt(e.target.dataset.taskId);
      completeTask(taskId);
      renderTasksUI();
    }
  });

  document.getElementById('task-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="delete"]');
    if (btn) {
      const taskId = parseInt(btn.dataset.taskId);
      deleteTask(taskId);
      renderTasksUI();
    }
  });

  // Кнопка очистки выполненных
  document.getElementById('clear-completed')?.addEventListener('click', () => {
    clearCompleted();
    renderTasksUI();
  });
}

// Экспорт для использования в других модулях (если нужно)
export { renderTasksUI };