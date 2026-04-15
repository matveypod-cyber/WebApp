import { getMainContainer } from "../../core/uiContainer.js";
import { getLeaderboard, resetTracker } from "./tracker.js";
import { getTotalPoints } from "../tasks/tasks.js";
import { showToast } from "../../utils/helpers.js";

export async function renderTrackerUI() {
  const container = getMainContainer();
  if (!container) return;
  
  const leaderboard = getLeaderboard();
  const currentPoints = getTotalPoints();
  const currentUser = leaderboard.find(u => u.isCurrentUser);
  const userRank = currentUser ? leaderboard.findIndex(u => u.name === currentUser.name) + 1 : null;

  container.innerHTML = `
    <div class="module tracker-module slide-in">
      <!-- Заголовок -->
      <div class="module-header">
        <h2>📊 Трекер активности</h2>
        <button id="reset-tracker" class="btn btn-secondary btn-sm" title="Сбросить прогресс">🔄</button>
      </div>
      
      <!-- Статистика пользователя -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg);">
        <div class="card" style="text-align: center; border-left: 4px solid var(--accent-primary);">
          <div style="font-size: 2rem; font-weight: 700; color: var(--accent-primary);">${currentPoints}</div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">ваши баллы</div>
        </div>
        <div class="card" style="text-align: center; border-left: 4px solid var(--accent-secondary);">
          <div style="font-size: 2rem; font-weight: 700; color: var(--accent-secondary);">
            ${userRank ? `#${userRank}` : '—'}
          </div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">место в рейтинге</div>
        </div>
        <div class="card" style="text-align: center; border-left: 4px solid var(--accent-warning);">
          <div style="font-size: 2rem; font-weight: 700; color: var(--accent-warning);">
            ${leaderboard.filter(u => u.score > (currentUser?.score || 0)).length}
          </div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">впереди</div>
        </div>
      </div>
      
      <!-- Лидеры -->
      <h3 style="margin-bottom: var(--space-md);">🏅 Топ игроков</h3>
      <ol class="list">
        ${leaderboard.map((user, index) => `
          <li class="list-item ${user.isCurrentUser ? 'current-user' : ''}" style="${user.isCurrentUser ? 'border-left-color: var(--accent-primary); background: var(--bg-card);' : ''}">
            <span class="badge ${index < 3 ? (index === 0 ? 'error' : index === 1 ? 'warning' : 'secondary') : ''}" style="min-width: 32px; justify-content: center;">
              #${index + 1}
            </span>
            <span style="font-size: 1.5rem;">${user.avatar}</span>
            <span style="flex: 1; font-weight: ${user.isCurrentUser ? '600' : '400'};">
              ${escapeHtml(user.name)}
              ${user.isCurrentUser ? ' <span class="badge">Вы</span>' : ''}
            </span>
            <span style="font-weight: 600; color: var(--accent-primary);">${user.score} б.</span>
            ${index === 0 ? '<span style="font-size: 1.3rem;">👑</span>' : ''}
          </li>
        `).join('')}
      </ol>
      
      <!-- Подсказка -->
      <div style="margin-top: var(--space-lg); padding: var(--space-md); background: var(--bg-tertiary); border-radius: var(--radius-md); text-align: center;">
        <small style="color: var(--text-muted);">
          💡 Выполняйте задачи, чтобы подниматься в рейтинге!
        </small>
      </div>
    </div>
  `;

  // Сброс трекера
  document.getElementById("reset-tracker")?.addEventListener("click", () => {
    if (confirm("Сбросить весь прогресс? Это действие нельзя отменить.")) {
      resetTracker();
      showToast("Прогресс сброшен 🔄", "warning");
      renderTrackerUI();
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}