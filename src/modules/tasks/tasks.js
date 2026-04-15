import { isGuest, getCurrentUser } from "../../core/authService.js";
import { storage } from "../../utils/storage.js";

// Ключ для localStorage
const getStorageKey = () => {
  const user = getCurrentUser();
  return isGuest() ? `guest_tasks` : `tasks_${user?.id || 'unknown'}`;
};

// Загрузка данных
let tasks = [];

function loadTasks() {
  const key = getStorageKey();
  tasks = storage.get(key, []);
  
  // Если данных нет, создаем демо-данные
  if (tasks.length === 0) {
    tasks = [
      { id: 1, title: "Сделать лабораторную по PWA", completed: false, points: 10 },
      { id: 2, title: "Настроить Docker", completed: true, points: 5 },
      { id: 3, title: "Протестировать offline-режим", completed: false, points: 8 }
    ];
    saveTasks();
  }
}

// Сохранение данных
function saveTasks() {
  const key = getStorageKey();
  storage.set(key, tasks);
  // Уведомляем другие модули
  window.dispatchEvent(new CustomEvent("tasks:updated", { detail: { tasks } }));
}

// Инициализация
loadTasks();

// Получить все задачи
export function getTasks() {
  return [...tasks];
}

// Добавить задачу
export function addTask(task) {
  const newTask = {
    id: Date.now(),
    title: task.title,
    completed: false,
    points: task.points || 1,
    createdAt: new Date().toISOString()
  };
  tasks.unshift(newTask);
  saveTasks();
  return newTask;
}

// Отметить задачу как выполненную
export function completeTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = true;
    saveTasks();
  }
  return task;
}

// Удалить задачу
export function deleteTask(taskId) {
  const initialLength = tasks.length;
  tasks = tasks.filter(t => t.id !== taskId);
  if (tasks.length !== initialLength) {
    saveTasks();
    return true;
  }
  return false;
}

// Получить суммарные баллы
export function getTotalPoints() {
  return tasks.filter(t => t.completed).reduce((sum, t) => sum + (t.points || 0), 0);
}

// Обновить задачу
export function updateTask(taskId, updates) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    Object.assign(task, updates);
    saveTasks();
    return true;
  }
  return false;
}

// Очистить выполненные
export function clearCompleted() {
  const initialLength = tasks.length;
  tasks = tasks.filter(t => !t.completed);
  if (tasks.length !== initialLength) {
    saveTasks();
    return true;
  }
  return false;
}

// Синхронизация между вкладками
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key?.startsWith("guest_tasks") || e.key?.startsWith("tasks_")) {
      loadTasks();
      window.dispatchEvent(new CustomEvent("tasks:synced", { detail: { tasks } }));
    }
  });
}