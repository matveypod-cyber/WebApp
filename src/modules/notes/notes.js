import { isGuest, getCurrentUser } from "../../core/authService.js";
import { storage } from "../../utils/storage.js";

// Ключ для localStorage
const getStorageKey = () => {
  const user = getCurrentUser();
  return isGuest() ? `guest_notes` : `notes_${user?.id || 'unknown'}`;
};

// Загрузка данных
let notes = [];

function loadNotes() {
  const key = getStorageKey();
  notes = storage.get(key, []);
  
  // Если данных нет, создаем демо-данные
  if (notes.length === 0) {
    notes = [
      { id: 1, text: "Купить молоко и хлеб", date: new Date().toISOString().split('T')[0], pinned: false },
      { id: 2, text: "Позвонить клиенту по проекту", date: new Date().toISOString().split('T')[0], pinned: true }
    ];
    saveNotes();
  }
}

// Сохранение данных
function saveNotes() {
  const key = getStorageKey();
  storage.set(key, notes);
  window.dispatchEvent(new CustomEvent("notes:updated", { detail: { notes } }));
}

// Инициализация
loadNotes();

// Получить все заметки
export function getNotes() {
  return [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });
}

// Добавить заметку
export function addNote(text) {
  const newNote = {
    id: Date.now(),
    text: text.trim(),
    date: new Date().toISOString().split('T')[0],
    pinned: false
  };
  notes.unshift(newNote);
  saveNotes();
  return newNote;
}

// Закрепить/открепить заметку
export function togglePin(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (note) {
    note.pinned = !note.pinned;
    saveNotes();
  }
  return note;
}

// Удалить заметку
export function deleteNote(noteId) {
  const initialLength = notes.length;
  notes = notes.filter(n => n.id !== noteId);
  if (notes.length !== initialLength) {
    saveNotes();
    return true;
  }
  return false;
}

// Обновить заметку
export function updateNote(noteId, newText) {
  const note = notes.find(n => n.id === noteId);
  if (note && newText?.trim()) {
    note.text = newText.trim();
    saveNotes();
    return true;
  }
  return false;
}

// Синхронизация между вкладками
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key?.startsWith("guest_notes") || e.key?.startsWith("notes_")) {
      loadNotes();
      window.dispatchEvent(new CustomEvent("notes:synced", { detail: { notes } }));
    }
  });
}