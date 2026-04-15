import { getMainContainer } from "../../core/uiContainer.js";
import { getNotes, addNote, deleteNote, getTotalNotesPoints } from "./notes.js";

export function renderNotesUI() {
    const container = getMainContainer();
    const notes = getNotes();
    const points = getTotalNotesPoints();
    
    container.innerHTML = `
        <div class="module-container">
            <div class="module-header">
                <h2>Заметки</h2>
                <span class="points-badge">Баллы: ${points}</span>
            </div>
            
            <div class="note-form">
                <textarea id="new-note-content" placeholder="Новая заметка..." rows="3"></textarea>
                <button id="add-note-btn" class="btn-primary">Добавить</button>
            </div>
            
            <div class="notes-list">
                ${notes.map(note => `
                    <div class="note-card" data-id="${note.id}">
                        <p class="note-content">${note.content}</p>
                        <div class="note-meta">
                            <span class="note-date">${note.date}</span>
                            <span class="note-points">+${note.points} баллов</span>
                            <button class="btn-delete" data-id="${note.id}">✕</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById("add-note-btn").addEventListener("click", () => {
        const contentInput = document.getElementById("new-note-content");
        
        if (contentInput.value.trim()) {
            addNote(contentInput.value.trim());
            renderNotesUI();
        }
    });
    
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const noteId = parseInt(e.target.dataset.id);
            deleteNote(noteId);
            renderNotesUI();
        });
    });
}