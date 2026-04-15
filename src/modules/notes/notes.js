import { moduleStorage } from "../../utils/storage.js";

const STORE = moduleStorage.notes;
let notes = STORE.get();

if (!notes || notes.length === 0) {
  notes = [
    { id: 1, text: "Купить молоко и хлеб", date: "2024-03-26", pinned: false },
    { id: 2, text: "Позвонить клиенту", date: "2024-03-25", pinned: true }
  ];
  STORE.set(notes);
}

function save() {
  STORE.set(notes);
  window.dispatchEvent(new CustomEvent("notes:updated", { detail: { notes } }));
}

export function getNotes() {
  return [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });
}

export function addNote(text) {
  if (!text?.trim()) return null;
  const note = {
    id: Date.now(),
    text: text.trim(),
    date: new Date().toISOString().split("T")[0],
    pinned: false
  };
  notes.unshift(note);
  save();
  return note;
}

export function togglePin(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (note) {
    note.pinned = !note.pinned;
    save();
  }
  return note;
}

export function deleteNote(noteId) {
  const initial = notes.length;
  notes = notes.filter(n => n.id !== noteId);
  if (notes.length !== initial) {
    save();
    return true;
  }
  return false;
}

export function updateNote(noteId, newText) {
  const note = notes.find(n => n.id === noteId);
  if (note && newText?.trim()) {
    note.text = newText.trim();
    save();
    return true;
  }
  return false;
}