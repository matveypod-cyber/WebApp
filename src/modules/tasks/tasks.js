import { moduleStorage } from "../../utils/storage.js";

const STORE = moduleStorage.tasks;

// Загрузка данных при инициализации
let tasks = STORE.get();

// Если данных нет — используем заглушки
if (!tasks || tasks.length === 0) {
  tasks = [
    { id: 1, title: "Сделать лабораторную по PWA", completed: false, points: 10, createdAt: new Date().toISOString() },
    { id: 2, title: "Настроить Docker", completed: true, points: 5, createdAt: new Date().toISOString() },
    { id: 3, title: "Протестировать offline-режим", completed: false, points: 8, createdAt: new Date().toISOString() }
  ];
  STORE.set(tasks);
}

// Сохранение в localStorage
function save() {
  STORE.set(tasks);
  // Уведомляем другие модули об изменении
  window.dispatchEvent(new CustomEvent("tasks:updated", { detail: { tasks } }));
}

// Получить все задачи
export function getTasks() {
  return [...tasks];
}

// Добавить задачу
export function addTask({ title, points = 1 }) {
  if (!title?.trim()) return null;
  
  const newTask = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: title.trim(),
    completed: false,
    points: parseInt(points) || 1,
    createdAt: new Date().toISOString()
  };
  
  tasks.unshift(newTask);
  save();
  return newTask;
}

// Переключить статус задачи
export function toggleTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    save();
  }
  return task;
}

// Удалить задачу
export function deleteTask(taskId) {
  const initial = tasks.length;
  tasks = tasks.filter(t => t.id !== taskId);
  if (tasks.length !== initial) {
    save();
    return true;
  }
  return false;
}

// Обновить задачу
export function updateTask(taskId, updates) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    Object.assign(task, updates);
    save();
    return true;
  }
  return false;
}

// Получить суммарные баллы
export function getTotalPoints() {
  return tasks.filter(t => t.completed).reduce((sum, t) => sum + (t.points || 0), 0);
}

// Получить статистику
export function getStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  return {
    total,
    completed,
    pending: total - completed,
    points: getTotalPoints(),
    progress: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}

// Очистить выполненные
export function clearCompleted() {
  const initial = tasks.length;
  tasks = tasks.filter(t => !t.completed);
  if (tasks.length !== initial) {
    save();
    return true;
  }
  return false;
}

// Синхронизация между вкладками
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key?.startsWith("sd_tasks")) {
      tasks = STORE.get();
      window.dispatchEvent(new CustomEvent("tasks:synced", { detail: { tasks } }));
    }
  });
}