import { moduleStorage } from "../../utils/storage.js";
import { getTotalPoints } from "../tasks/tasks.js";

const STORE = moduleStorage.tracker;
let tracker = STORE.get();

// Инициализация
if (!tracker.scores) {
  tracker = {
    scores: {},
    streaks: {},
    achievements: []
  };
  STORE.set(tracker);
}

function save() {
  STORE.set(tracker);
  window.dispatchEvent(new CustomEvent("tracker:updated", { detail: { tracker } }));
}

// Обновить очки пользователя
export function updateScore(userId, points) {
  if (!tracker.scores[userId]) {
    tracker.scores[userId] = 0;
  }
  tracker.scores[userId] += points;
  save();
  return tracker.scores[userId];
}

// Получить рейтинг
export function getLeaderboard() {
  // В демо: один пользователь
  const currentUser = getCurrentUser();
  const currentPoints = getTotalPoints();
  
  return [
    { name: "Алексей", score: 245, avatar: "👨‍💻" },
    { name: "Мария", score: 198, avatar: "👩‍🎨" },
    { name: currentUser?.email?.split("@")[0] || "Вы", score: currentPoints, avatar: "🎯", isCurrentUser: true }
  ].sort((a, b) => b.score - a.score);
}

// Получить текущие данные
export function getTrackerData() {
  return { ...tracker };
}

// Сброс прогресса
export function resetTracker() {
  tracker = { scores: {}, streaks: {}, achievements: [] };
  save();
}

function getCurrentUser() {
  try {
    const user = localStorage.getItem("sd_auth_user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}