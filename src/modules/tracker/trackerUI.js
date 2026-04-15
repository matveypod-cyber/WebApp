import { getMainContainer } from "../../core/uiContainer.js";
import { getTotalActivityPoints, getActivityLevel, getMascotMessage } from "./tracker.js";
import { dummyLeaderboard } from "./dummyLeaderboard.js";

export function renderTrackerUI() {
    const container = getMainContainer();
    const totalPoints = getTotalActivityPoints();
    const level = getActivityLevel();
    const mascotMessage = getMascotMessage();
    
    container.innerHTML = `
        <div class="module-container">
            <div class="module-header">
                <h2>Прогресс</h2>
            </div>
            
            <div class="mascot-section">
                <div class="mascot-avatar">🦊</div>
                <p class="mascot-message">${mascotMessage}</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Всего баллов</h3>
                    <p class="stat-value">${totalPoints}</p>
                </div>
                <div class="stat-card">
                    <h3>Уровень</h3>
                    <p class="stat-value">${level}</p>
                </div>
            </div>
            
            <div class="progress-section">
                <h3>Таблица лидеров (демо)</h3>
                <div class="leaderboard">
                    ${dummyLeaderboard.map(player => `
                        <div class="leaderboard-row ${player.name === 'Вы' ? 'current-user' : ''}">
                            <span class="rank">#${player.rank}</span>
                            <span class="name">${player.name}</span>
                            <span class="points">${player.points} баллов</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}