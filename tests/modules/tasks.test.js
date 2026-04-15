import { addTask, toggleTask, deleteTask, getTotalPoints } from '../../src/modules/tasks/tasks.js';

describe('Tasks Module', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('addTask creates new task', () => {
    const task = addTask('Test task', 5);
    expect(task).toHaveProperty('id');
    expect(task.title).toBe('Test task');
    expect(task.points).toBe(5);
    expect(task.completed).toBe(false);
  });

  test('toggleTask changes completion status', () => {
    const task = addTask('Toggle test', 10);
    expect(task.completed).toBe(false);
    
    const toggled = toggleTask(task.id);
    expect(toggled.completed).toBe(true);
    
    const toggledAgain = toggleTask(task.id);
    expect(toggledAgain.completed).toBe(false);
  });

  test('getTotalPoints sums completed tasks', () => {
    addTask('Task 1', 5);
    addTask('Task 2', 10);
    addTask('Task 3', 15);
    
    const tasks = JSON.parse(localStorage.getItem('tasks_data'));
    tasks[0].completed = true;
    tasks[1].completed = true;
    localStorage.setItem('tasks_data', JSON.stringify(tasks));
    
    expect(getTotalPoints()).toBe(15); // 5 + 10
  });

  test('deleteTask removes task', () => {
    const task = addTask('Delete me', 1);
    const result = deleteTask(task.id);
    expect(result).toBe(true);
    
    const tasks = JSON.parse(localStorage.getItem('tasks_data'));
    expect(tasks.find(t => t.id === task.id)).toBeUndefined();
  });
});