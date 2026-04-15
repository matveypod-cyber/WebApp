import { getMainContainer } from "../../core/uiContainer.js";
import { getNotes, addNote, togglePin, deleteNote, updateNote } from "./notes.js";

export function renderNotesUI() {
  const container = getMainContainer();
  const notes = getNotes();

  let html = `
    <div class="module notes-module">
      <div class="module-header">
        <h2>📝 Заметки</h2>
        <span class="count">${notes.length} шт.</span>
      </div>
      
      <form id="note-form" style="margin-bottom: 20px;">
        <textarea id="note-text" placeholder="Напишите заметку..." rows="3" required style="width: 100%; padding: 10px; border: 2px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); color: var(--text-primary); resize: vertical;"></textarea>
        <button type="submit" class="btn-primary" style="margin-top: 8px;">💾 Сохранить</button>
      </form>
      
      <div id="notes-list" style="display: grid; gap: 12px;">
        ${notes.map(note => `
          <div class="note-card ${note.pinned ? 'pinned' : ''}" style="background: var(--bg-card); border-radius: 8px; padding: 16px; border-left: 4px solid ${note.pinned ? 'var(--warning)' : 'var(--border-color)'}; transition: all 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                ${note.pinned ? '<span>📌</span>' : ''}
                <span style="font-size: 0.85rem; color: var(--text-muted);">${note.date}</span>
              </div>
              <div style="display: flex; gap: 6px;">
                <button onclick="window.handleNotePin(${note.id})" style="background: transparent; border: none; cursor: pointer; font-size: 1.1rem;">${note.pinned ? '📍' : '📌'}</button>
                <button onclick="window.handleNoteEdit(${note.id})" style="background: transparent; border: none; cursor: pointer; font-size: 1.1rem;">✏️</button>
                <button onclick="window.handleNoteDelete(${note.id})" style="background: transparent; border: none; cursor: pointer; font-size: 1.1rem;">🗑️</button>
              </div>
            </div>
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.5;">${note.text}</p>
          </div>
        `).join('')}
      </div>
      
      ${notes.length === 0 ? '<p style="text-align: center; color: var(--text-muted); padding: 40px;">✨ Пусто. Создайте первую заметку!</p>' : ''}
    </div>
  `;

  container.innerHTML = html;

  // Обработчик формы
  document.getElementById('note-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('note-text').value;
    if (text) {
      addNote(text);
      renderNotesUI();
    }
  });

  // Глобальные обработчики
  window.handleNotePin = (id) => {
    togglePin(id);
    renderNotesUI();
  };

  window.handleNoteDelete = (id) => {
    deleteNote(id);
    renderNotesUI();
  };

  window.handleNoteEdit = (id) => {
    const note = notes.find(n => n.id === id);
    const newText = prompt("Редактировать заметку:", note.text);
    if (newText !== null && newText.trim()) {
      updateNote(id, newText.trim());
      renderNotesUI();
    }
  };
}