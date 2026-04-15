import { getMainContainer } from "../../core/uiContainer.js";
import { getNotes, addNote, togglePin, deleteNote, updateNote } from "./notes.js";
import { showToast } from "../../utils/helpers.js";

export async function renderNotesUI() {
  const container = getMainContainer();
  if (!container) return;
  
  const notes = getNotes();

  container.innerHTML = `
    <div class="module notes-module slide-in">
      <!-- Заголовок -->
      <div class="module-header">
        <h2>📝 Заметки</h2>
        <span class="badge">${notes.length} шт.</span>
      </div>
      
      <!-- Форма добавления -->
      <form id="note-form" style="margin-bottom: var(--space-lg);">
        <textarea id="note-text" placeholder="Напишите заметку..." required></textarea>
        <div style="display: flex; justify-content: flex-end; margin-top: var(--space-sm);">
          <button type="submit" class="btn btn-primary">💾 Сохранить</button>
        </div>
      </form>
      
      <!-- Список заметок -->
      ${notes.length === 0 ? renderEmptyState() : renderNotesList(notes)}
    </div>
  `;

  setupNoteForm();
  setupNoteInteractions();
}

function renderEmptyState() {
  return `
    <div class="empty-state fade-in">
      <div class="icon">✨</div>
      <h3>Пусто</h3>
      <p>Создайте первую заметку, чтобы ничего не забыть!</p>
    </div>
  `;
}

function renderNotesList(notes) {
  return `
    <div class="list">
      ${notes.map(note => `
        <div class="card ${note.pinned ? 'pinned' : ''}" data-id="${note.id}">
          <div class="card-header">
            <div style="display: flex; align-items: center; gap: var(--space-sm);">
              ${note.pinned ? '<span class="item-pinned">📌</span>' : ''}
              <span class="item-meta">${note.date}</span>
            </div>
            <div class="card-actions">
              <button class="btn-icon" title="${note.pinned ? 'Открепить' : 'Закрепить'}" data-action="pin">
                ${note.pinned ? '📌' : '📍'}
              </button>
              <button class="btn-icon" title="Редактировать" data-action="edit">✏️</button>
              <button class="btn-icon btn-danger" title="Удалить" data-action="delete">🗑️</button>
            </div>
          </div>
          <p class="card-title" style="white-space: pre-wrap; line-height: 1.5;">${escapeHtml(note.text)}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function setupNoteForm() {
  const form = document.getElementById("note-form");
  if (!form) return;
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const text = document.getElementById("note-text").value.trim();
    if (!text) {
      showToast("Заметка не может быть пустой", "warning");
      return;
    }
    
    addNote(text);
    showToast("Заметка сохранена! 📝", "success");
    
    form.reset();
    renderNotesUI();
  });
}

function setupNoteInteractions() {
  document.querySelectorAll(".card").forEach(card => {
    const noteId = parseInt(card.dataset.id);
    
    // Закрепить
    card.querySelector("[data-action='pin']")?.addEventListener("click", () => {
      togglePin(noteId);
      showToast(card.classList.contains("pinned") ? "Откреплено" : "Закреплено! 📌", "info", 1500);
      renderNotesUI();
    });
    
    // Удалить
    card.querySelector("[data-action='delete']")?.addEventListener("click", () => {
      if (confirm("Удалить заметку?")) {
        deleteNote(noteId);
        showToast("Заметка удалена", "info");
        renderNotesUI();
      }
    });
    
    // Редактировать
    card.querySelector("[data-action='edit']")?.addEventListener("click", () => {
      const currentText = card.querySelector(".card-title").textContent;
      const newText = prompt("Редактировать заметку:", currentText);
      
      if (newText !== null && newText.trim()) {
        updateNote(noteId, newText.trim());
        showToast("Заметка обновлена ✏️", "success");
        renderNotesUI();
      }
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}