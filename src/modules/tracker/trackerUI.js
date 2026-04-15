import { getMainContainer } from "../../core/uiContainer.js";
import { getLeaderboard, getStats } from "./tracker.js";
import { getTotalPoints } from "../tasks/tasks.js";

export function renderTrackerUI() {
  const container = getMainContainer();
  const leaderboard = getLeaderboard();
  const currentPoints = getTotalPoints();
  const stats = getStats();

  let html = `
    <div class="module tracker-module">
      <div class="module-header">
        <h2>📊 Трекер активности</h2>
      </div>
      
      <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="stat-card" style="background: var(--bg-card); padding: 20px; border-radius: 12px; text-align: center; border-top: 4px solid var(--primary);">
          <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">${currentPoints}</div>
          <div style="color: var(--text-secondary); font-size: 0.9rem;">ваши баллы</div>
        </div>
        <div class="stat-card" style="background: var(--bg-card); padding: 20px; border-radius: 12px; text-align: center; border-top: 4px solid var(--secondary);">
          <div style="font-size: 2rem; font-weight: 700; color: var(--secondary);">#${stats.rank}</div>
          <div style="color: var(--text-secondary); font-size: 0.9rem;">место в рейтинге</div>
        </div>
        <div class="stat-card" style="background: var(--bg-card); padding: 20px; border-radius: 12px; text-align: center; border-top: 4px solid var(--warning);">
          <div style="font-size: 2rem; font-weight: 700; color: var(--warning);">${stats.totalUsers - stats.rank}</div>
          <div style="color: var(--text-secondary); font-size: 0.9rem;">впереди</div>
        </div>
      </div>
      
      <h3 style="margin-bottom: 16px;">🏅 Топ игроков</h3>
      <ol class="leaderboard-list" style="list-style: none; padding: 0;">
        ${leaderboard.map((user, index) => `
          <li class="leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}" style="display: grid; grid-template-columns: 40px 40px 1fr auto; align-items: center; gap: 12px; padding: 12px; margin-bottom: 8px; background: ${user.isCurrentUser ? 'var(--primary)' : 'var(--bg-card)'}; border-radius: 8px; ${user.isCurrentUser ? 'color: white;' : ''}">
            <span style="font-weight: 700; ${index < 3 ? 'color: gold; font-size: 1.2rem;' : 'color: var(--text-secondary)'}">#${index + 1}</span>
            <span style="font-size: 1.5rem; text-align: center;">${user.avatar}</span>
            <span style="font-weight: 500;">${user.name} ${user.isCurrentUser ? '(Вы)' : ''}</span>
            <span style="font-weight: 600; ${user.isCurrentUser ? 'color: white;' : 'color: var(--primary)'}">${user.score} б.</span>
            ${index === 0 ? '<span style="grid-column: 1 / -1; text-align: right; font-size: 1.2rem;">👑</span>' : ''}
          </li>
        `).join('')}
      </ol>
      
      <div style="margin-top: 24px; padding: 16px; background: var(--bg-tertiary); border-radius: 8px; text-align: center;">
        <small style="color: var(--text-muted);">💡 Выполняйте задачи, чтобы подниматься в рейтинге!</small>
      </div>
    </div>
  `;

  container.innerHTML = html;
}