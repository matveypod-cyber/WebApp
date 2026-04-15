import { getTotalPoints as getTasksPoints } from "../tasks/tasks.js";
import { getTotalNotesPoints } from "../notes/notes.js";

export function getTotalActivityPoints() {
    return getTasksPoints() + getTotalNotesPoints();
}

export function getActivityLevel() {
    const points = getTotalActivityPoints();
    if (points >= 200) return "Мастер";
    if (points >= 100) return "Продвинутый";
    if (points >= 50) return "Любитель";
    return "Новичок";
}

export function getMascotMessage() {
    const points = getTotalActivityPoints();
    if (points >= 100) return "🏆 Отличная работа! Так держать!";
    if (points >= 50) return "👍 Хороший прогресс!";
    if (points >= 10) return "💪 Начало положено!";
    return "🚀 Давай начнём!";
}