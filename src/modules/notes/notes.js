import { notesDummy } from "./notesDummyData.js";

let notes = [...notesDummy];

export function getNotes() {
    return notes;
}

export function addNote(content) {
    const newNote = {
        id: Date.now(),
        content: content,
        date: new Date().toISOString().split('T')[0],
        points: 5
    };
    notes.push(newNote);
    return newNote;
}

export function deleteNote(noteId) {
    notes = notes.filter(n => n.id !== noteId);
}

export function getTotalNotesPoints() {
    return notes.length * 5;
}