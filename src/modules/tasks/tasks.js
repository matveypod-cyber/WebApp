import { tasksDummy } from "./tasksDummyData.js";

let tasks = [...tasksDummy];

export function getTasks() {
    return tasks;
}

export function addTask(task) {
    const newTask = {
        id: Date.now(),
        title: task.title,
        completed: false,
        points: task.points || 1,
        type: task.type || "custom"
    };
    tasks.push(newTask);
    return newTask;
}

export function completeTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = true;
    }
    return task;
}

export function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
}

export function getTotalPoints() {
    return tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
}