/**
 * Глобальные константы приложения
 */
export const APP = {
  NAME: "Smart Dashboard",
  VERSION: "1.0.0",
  DESCRIPTION: "PWA для управления задачами, заметками и трекингом"
};

export const ROUTES = {
  HOME: "/",
  TASKS: "/tasks",
  NOTES: "/notes",
  TRACKER: "/tracker"
};

export const STORAGE = {
  TASKS: "tasks_data",
  NOTES: "notes_data",
  TRACKER: "tracker_data",
  SETTINGS: "app_settings"
};

export const CACHE = {
  NAME: "smart-dashboard-v1",
  MAX_AGE: 7 * 24 * 60 * 60 * 1000 // 7 дней в мс
};

export const UI = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000
};