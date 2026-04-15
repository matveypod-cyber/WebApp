import { getMainContainer } from "../../core/uiContainer.js";
import { getTasks, addTask, completeTask, deleteTask, getTotalPoints } from "./tasks.js";

export function renderTasksUI() {
    const container = getMainContainer();
    const tasks = getTasks();
    const points = getTotalPoints();
    
    container.innerHTML = `
        <div class="module-container">
            <div class="module-header">
                <h2>Задачи</h2>
                <span class="points-badge">Баллы: ${points}</span>
            </div>
            
            <div class="task-form">
                <input type="text" id="new-task-title" placeholder="Новая задача..." />
                <input type="number" id="new-task-points" placeholder="Баллы" value="10" min="1" max="100" />
                <button id="add-task-btn" class="btn-primary">Добавить</button>
            </div>
            
            <div class="tasks-list">
                ${tasks.map(task => `
                    <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} class="task-checkbox" />
                        <span class="task-title">${task.title}</span>
                        <span class="task-points">+${task.points} баллов</span>
                        <button class="btn-delete" data-id="${task.id}">✕</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Обработчики событий
    document.getElementById("add-task-btn").addEventListener("click", () => {
        const titleInput = document.getElementById("new-task-title");
        const pointsInput = document.getElementById("new-task-points");
        
        if (titleInput.value.trim()) {
            addTask({
                title: titleInput.value.trim(),
                points: parseInt(pointsInput.value) || 10
            });
            renderTasksUI();
        }
    });
    
    document.querySelectorAll(".task-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", (e) => {
            const taskCard = e.target.closest(".task-card");
            const taskId = parseInt(taskCard.dataset.id);
            completeTask(taskId);
            renderTasksUI();
        });
    });
    
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const taskId = parseInt(e.target.dataset.id);
            deleteTask(taskId);
            renderTasksUI();
        });
    });
}