import { isGuest, getCurrentUser } from "../../core/authService.js";
import { storage } from "../../utils/storage.js";
import { getTotalPoints } from "../tasks/tasks.js";

// Ключ для localStorage
const getStorageKey = () => {
  const user = getCurrentUser();
  return isGuest() ? `guest_tracker` : `tracker_${user?.id || 'unknown'}`;
};

// Загрузка данных
let tracker = {
  scores: {},
  streaks: {},
  achievements: []
};

function loadTracker() {
  const key = getStorageKey();
  const saved = storage.get(key);
  if (saved) {
    tracker = saved;
  }
}

// Сохранение данных
function saveTracker() {
  const key = getStorageKey();
  storage.set(key, tracker);
  window.dispatchEvent(new CustomEvent("tracker:updated", { detail: { tracker } }));
}

// Инициализация
loadTracker();

// Получить рейтинг (с демо-данными)
export function getLeaderboard() {
  const currentUser = getCurrentUser();
  const currentPoints = getTotalPoints();
  const userName = isGuest() ? "Гость" : (currentUser?.email?.split('@')[0] || "Вы");
  
  // Демо-данные + текущий пользователь
  const leaderboard = [
    { name: "Алексей", score: 245, avatar: "👨‍💻" },
    { name: "Мария", score: 198, avatar: "👩‍🎨" },
    { name: "Дмитрий", score: 156, avatar: "👨‍" },
    { name: userName, score: currentPoints, avatar: "🎯", isCurrentUser: true }
  ];
  
  return leaderboard.sort((a, b) => b.score - a.score);
}

// Обновить очки пользователя
export function updateScore(points) {
  const user = getCurrentUser();
  const userId = isGuest() ? "guest" : user?.id;
  
  if (!tracker.scores[userId]) {
    tracker.scores[userId] = 0;
  }
  tracker.scores[userId] += points;
  saveTracker();
  return tracker.scores[userId];
}

// Получить статистику
export function getStats() {
  const user = getCurrentUser();
  const userId = isGuest() ? "guest" : user?.id;
  
  return {
    score: tracker.scores[userId] || 0,
    streak: tracker.streaks[userId] || 0,
    achievements: tracker.achievements || []
  };
}

// Добавить достижение
export function addAchievement(achievement) {
  const user = getCurrentUser();
  const userId = isGuest() ? "guest" : user?.id;
  
  if (!tracker.achievements.find(a => a.id === achievement.id)) {
    tracker.achievements.push({
      ...achievement,
      userId,
      unlockedAt: new Date().toISOString()
    });
    saveTracker();
    return true;
  }
  return false;
}

// Обновить стрик
export function updateStreak(days = 1) {
  const user = getCurrentUser();
  const userId = isGuest() ? "guest" : user?.id;
  
  tracker.streaks[userId] = (tracker.streaks[userId] || 0) + days;
  saveTracker();
  return tracker.streaks[userId];
}

// Сбросить трекер
export function resetTracker() {
  const key = getStorageKey();
  storage.remove(key);
  tracker = { scores: {}, streaks: {}, achievements: [] };
  loadTracker();
}

// Синхронизация между вкладками
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key?.startsWith("guest_tracker") || e.key?.startsWith("tracker_")) {
      loadTracker();
      window.dispatchEvent(new CustomEvent("tracker:synced", { detail: { tracker } }));
    }
  });
}