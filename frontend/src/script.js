// ============================================
// SUPER MOBILE WEB APP - OPTIMIZED VERSION
// ============================================

// Глобальная переменная для таймера напоминаний
var reminderInterval = null;

// Данные приложения
var appData = {
  tasks: [],
  notes: [],
  notifications: [],
  shoppingList: [],
  profile: {
    name: 'Александр',
    email: 'alex@example.com',
    avatar: 'https://i.pravatar.cc/150?img=11'
  },
  theme: 'light',
  settings: { notifications: true, sounds: false },
  waterToday: 0,
  waterGoal: 2000,
  waterGoalAchieved: false,
  waterLastDate: null,
  taskReminders: {},
  morningReminderSent: false,
  lastMorningReminder: null
};

// ============================================
// 1. ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SuperApp запускается...');
  loadData();
  checkNewDay();
  
  setTimeout(function() {
    hideLoader();
  }, 1500);
  
  setupAll();
  console.log('✅ Приложение готово!');
});

function hideLoader() {
  var loader = document.getElementById('app-loader');
  var appContainer = document.getElementById('app-container');
  if (loader) loader.classList.add('hidden');
  if (appContainer) appContainer.classList.remove('hidden');
  
  var cards = document.querySelectorAll('.card');
  for (var i = 0; i < cards.length; i++) {
    (function(index) {
      setTimeout(function() {
        cards[index].style.opacity = '1';
        cards[index].style.transform = 'translateY(0)';
      }, index * 100);
    })(i);
  }
}

function setupAll() {
  renderTasks();
  renderNotes();
  renderNotifications();
  renderShoppingList();
  updateProgress();
  updateProfileUI();
  updateWaterTracker();
  
  if (!appData.notifications || appData.notifications.length === 0) {
    addDemoNotifications();
  }
  
  checkTaskReminders();
  checkMorningReminders();
  
  // Очищаем старый интервал перед созданием нового
  if (reminderInterval) clearInterval(reminderInterval);
  reminderInterval = setInterval(function() {
    checkTaskReminders();
    checkMorningReminders();
  }, 30000); // Каждые 30 секунд
  
  console.log('✅ Система напоминаний активирована');
}

// ============================================
// 2. НАВИГАЦИЯ
// ============================================
function navigateTo(screenId) {
  var screens = document.querySelectorAll('.screen');
  for (var i = 0; i < screens.length; i++) screens[i].classList.remove('active');
  
  var navItems = document.querySelectorAll('.nav-item');
  for (var j = 0; j < navItems.length; j++) {
    navItems[j].classList.remove('active');
    if (navItems[j].getAttribute('data-target') === screenId) {
      navItems[j].classList.add('active');
    }
  }
  
  var target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  
  updateHeader(screenId);
  if (screenId === 'screen-notifications') markAllNotificationsRead();
  closeQuickMenu();
}

function updateHeader(screenId) {
  var titles = {
    'screen-home': 'Главная', 'screen-tasks': 'Задачи', 'screen-notes': 'Заметки',
    'screen-notifications': 'Уведомления', 'screen-shopping': 'Покупки',
    'screen-water': 'Вода', 'screen-calculator': 'Калькулятор',
    'screen-timer': 'Таймер', 'screen-profile': 'Профиль', 'screen-settings': 'Настройки'
  };
  
  var titleEl = document.getElementById('header-title');
  var subtitleEl = document.getElementById('greeting-subtitle');
  
  if (titleEl) titleEl.textContent = titles[screenId] || 'SuperApp';
  if (subtitleEl) {
    subtitleEl.textContent = 'Добро пожаловать,';
    subtitleEl.style.display = (screenId === 'screen-home') ? 'block' : 'none';
  }
}

// ============================================
// 3. БЫСТРЫЕ ДЕЙСТВИЯ И МЕНЮ
// ============================================
function quickAction(action) {
  if (action === 'task') openTaskModal();
  else if (action === 'note') openNoteModal();
  else if (action === 'shopping') navigateTo('screen-shopping');
  else if (action === 'qr') openModal('modal-qr');
}

function openQuickMenu() {
  var existingMenu = document.querySelector('.quick-menu');
  if (existingMenu) { existingMenu.remove(); return; }
  
  var menu = document.createElement('div');
  menu.className = 'quick-menu active';
  menu.innerHTML = '<button class="quick-menu-item" onclick="navigateTo(\'screen-calculator\'); closeQuickMenu();"><div class="icon-box blue"><i class="fa-solid fa-calculator"></i></div><span>Калькулятор</span></button><button class="quick-menu-item" onclick="navigateTo(\'screen-timer\'); closeQuickMenu();"><div class="icon-box green"><i class="fa-solid fa-stopwatch"></i></div><span>Таймер</span></button><button class="quick-menu-item" onclick="navigateTo(\'screen-shopping\'); closeQuickMenu();"><div class="icon-box purple"><i class="fa-solid fa-cart-shopping"></i></div><span>Покупки</span></button><button class="quick-menu-item" onclick="navigateTo(\'screen-water\'); closeQuickMenu();"><div class="icon-box" style="background:linear-gradient(135deg,#06b6d4,#3b82f6);"><i class="fa-solid fa-glass-water"></i></div><span>Вода</span></button><button class="quick-menu-item" onclick="openModal(\'modal-qr\'); closeQuickMenu();"><div class="icon-box orange"><i class="fa-solid fa-qrcode"></i></div><span>QR</span></button><button class="quick-menu-item" onclick="showStats(); closeQuickMenu();"><div class="icon-box" style="background:linear-gradient(135deg,#ef4444,#f59e0b);"><i class="fa-solid fa-chart-pie"></i></div><span>Статистика</span></button>';
  
  document.body.appendChild(menu);
  setTimeout(function() {
    if (menu.parentNode) {
      menu.addEventListener('click', function(e) {
        if (e.target === menu) closeQuickMenu();
      });
    }
  }, 100);
}

function closeQuickMenu() {
  var menu = document.querySelector('.quick-menu');
  if (menu) menu.remove();
}

// ============================================
// 4. МОДАЛЬНЫЕ ОКНА
// ============================================
function openModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
  closeQuickMenu();
}

function closeModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function openTaskModal() {
  document.getElementById('task-title').value = '';
  document.getElementById('task-desc').value = '';
  document.getElementById('task-date').value = '';
  if(document.getElementById('task-time')) document.getElementById('task-time').value = '';
  
  var btns = document.querySelectorAll('#modal-task .p-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('active');
    if (btns[i].getAttribute('data-p') === 'mid') btns[i].classList.add('active');
  }
  openModal('modal-task');
}

function openNoteModal() {
  document.getElementById('note-title').value = '';
  document.getElementById('note-text').value = '';
  var btns = document.querySelectorAll('#modal-note .color-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('active');
    if (btns[i].getAttribute('data-color') === 'white') btns[i].classList.add('active');
  }
  openModal('modal-note');
}

// ============================================
// 5. ЗАДАЧИ
// ============================================
function selectPriority(btn) {
  var btns = btn.parentNode.querySelectorAll('.p-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  btn.classList.add('active');
}

function saveTask() {
  var title = document.getElementById('task-title').value.trim();
  var desc = document.getElementById('task-desc').value.trim();
  var date = document.getElementById('task-date').value;
  var time = document.getElementById('task-time') ? document.getElementById('task-time').value : '';
  var priorityBtn = document.querySelector('#modal-task .p-btn.active');
  var priority = priorityBtn ? priorityBtn.getAttribute('data-p') : 'mid';
  
  if (!title) { showToast('⚠️ Введите название задачи!', 'error'); return; }
  
  var task = {
    id: Date.now(),
    title: title,
    description: desc,
    priority: priority,
    completed: false,
    date: date || new Date().toISOString().split('T')[0],
    time: time || null,
    reminded: false,
    createdAt: new Date().toISOString()
  };
  
  appData.tasks.unshift(task);
  saveData();
  renderTasks();
  updateProgress();
  updateProfileStats();
  closeModal('modal-task');
  showToast('✅ Задача добавлена!' + (time ? ' Напоминание в ' + time : ''));
  addNotification('task', 'Новая задача', 'Задача "' + title + '" создана' + (time ? ' на ' + time : ''), new Date().toISOString());
}

function renderTasks(filter) {
  var container = document.getElementById('tasks-container');
  if (!container) return;
  filter = filter || 'all';
  
  var filteredTasks = [];
  for (var i = 0; i < appData.tasks.length; i++) {
    if (filter === 'all') filteredTasks.push(appData.tasks[i]);
    else if (filter === 'active' && !appData.tasks[i].completed) filteredTasks.push(appData.tasks[i]);
    else if (filter === 'done' && appData.tasks[i].completed) filteredTasks.push(appData.tasks[i]);
  }
  
  if (filteredTasks.length === 0) {
    container.innerHTML = '<div class="empty-state" style="text-align:center;padding:60px 20px;color:var(--text-muted);"><i class="fa-regular fa-clipboard" style="font-size:3rem;margin-bottom:16px;"></i><p>Нет задач</p></div>';
    return;
  }
  
  var html = '<div class="task-group">';
  for (var k = 0; k < filteredTasks.length; k++) {
    var task = filteredTasks[k];
    var priorityClass = task.priority === 'high' ? 'priority-high' : task.priority === 'low' ? 'priority-low' : 'priority-normal';
    var tagClass = task.priority === 'high' ? 'tag-red' : task.priority === 'low' ? 'tag-green' : 'tag-blue';
    var tagName = task.priority === 'high' ? 'Важно' : task.priority === 'low' ? 'Низкий' : 'Обычная';
    var completedClass = task.completed ? 'completed' : '';
    var checked = task.completed ? 'checked' : '';
    var taskDate = new Date(task.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    
    html += '<div class="task-card ' + priorityClass + '" data-task-id="' + task.id + '">';
    html += '<div class="task-checkbox"><input type="checkbox" id="task-' + task.id + '" ' + checked + ' onchange="toggleTask(' + task.id + ')"><label for="task-' + task.id + '"></label></div>';
    html += '<div class="task-details">';
    html += '<h5 class="' + completedClass + '">' + task.title + '</h5>';
    if (task.description) html += '<p style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">' + task.description.substring(0, 50) + (task.description.length > 50 ? '...' : '') + '</p>';
    if (task.time) html += '<p style="font-size:0.75rem;color:var(--primary-color);margin-top:2px;"><i class="fa-regular fa-clock"></i> ' + task.time + '</p>';
    html += '<div style="display:flex;gap:8px;align-items:center;margin-top:6px;"><span class="tag ' + tagClass + '">' + tagName + '</span><span style="font-size:0.75rem;color:var(--text-muted);"><i class="fa-regular fa-calendar"></i> ' + taskDate + '</span></div>';
    html += '</div>';
    html += '<button class="task-menu" onclick="deleteTask(' + task.id + ')"><i class="fa-solid fa-trash"></i></button>';
    html += '</div>';
  }
  html += '</div>';
  container.innerHTML = html;
}

function filterTasks(filter, btn) {
  var btns = document.querySelectorAll('.tab-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  btn.classList.add('active');
  renderTasks(filter);
}

function toggleTask(taskId) {
  for (var i = 0; i < appData.tasks.length; i++) {
    if (appData.tasks[i].id === taskId) {
      appData.tasks[i].completed = !appData.tasks[i].completed;
      saveData();
      renderTasks();
      updateProgress();
      updateProfileStats();
      if (appData.tasks[i].completed) {
        showToast('🎉 Задача выполнена!');
        addNotification('task', 'Задача выполнена', 'Задача "' + appData.tasks[i].title + '" завершена', new Date().toISOString());
      }
      break;
    }
  }
}

function deleteTask(taskId) {
  if (!confirm('Удалить эту задачу?')) return;
  for (var i = 0; i < appData.tasks.length; i++) {
    if (appData.tasks[i].id === taskId) {
      appData.tasks.splice(i, 1);
      saveData();
      renderTasks();
      updateProgress();
      updateProfileStats();
      showToast('🗑️ Задача удалена');
      break;
    }
  }
}

// ============================================
// 6. ЗАМЕТКИ
// ============================================
function selectNoteColor(btn) {
  var btns = btn.parentNode.querySelectorAll('.color-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  btn.classList.add('active');
}

function saveNote() {
  var title = document.getElementById('note-title').value.trim();
  var text = document.getElementById('note-text').value.trim();
  var colorBtn = document.querySelector('#modal-note .color-btn.active');
  var color = colorBtn ? colorBtn.getAttribute('data-color') : 'white';
  
  if (!title && !text) { showToast('⚠️ Введите заголовок или текст!', 'error'); return; }
  
  var note = { id: Date.now(), title: title || 'Без заголовка', text: text, color: color, createdAt: new Date().toISOString() };
  appData.notes.unshift(note);
  saveData();
  renderNotes();
  updateProfileStats();
  closeModal('modal-note');
  showToast('✅ Заметка сохранена!');
  addNotification('note', 'Новая заметка', 'Заметка "' + note.title + '" создана', new Date().toISOString());
}

function renderNotes() {
  var container = document.getElementById('notes-container');
  if (!container) return;
  if (appData.notes.length === 0) {
    container.innerHTML = '<div class="empty-state" style="text-align:center;padding:60px 20px;color:var(--text-muted);grid-column:1/-1;"><i class="fa-regular fa-note-sticky" style="font-size:3rem;margin-bottom:16px;"></i><p>Нет заметок</p></div>';
    return;
  }
  var html = '';
  for (var i = 0; i < appData.notes.length; i++) {
    var note = appData.notes[i];
    var colorClass = note.color === 'white' ? '' : 'note-' + note.color;
    var date = new Date(note.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    html += '<div class="note-card ' + colorClass + ' slide-in-up" style="animation-delay:' + (i * 0.05) + 's">';
    html += '<button class="note-delete" onclick="deleteNote(' + note.id + ')"><i class="fa-solid fa-trash"></i></button>';
    if (note.title) html += '<div class="note-title">' + note.title + '</div>';
    if (note.text) html += '<div class="note-text">' + note.text + '</div>';
    html += '<div class="note-date">' + date + '</div></div>';
  }
  container.innerHTML = html;
}

function deleteNote(noteId) {
  if (!confirm('Удалить заметку?')) return;
  for (var i = 0; i < appData.notes.length; i++) {
    if (appData.notes[i].id === noteId) {
      appData.notes.splice(i, 1);
      saveData();
      renderNotes();
      updateProfileStats();
      showToast('🗑️ Заметка удалена');
      break;
    }
  }
}

// ============================================
// 7. УВЕДОМЛЕНИЯ
// ============================================
function addDemoNotifications() {
  addNotification('system', '👋 Добро пожаловать!', 'SuperApp готов к использованию', new Date().toISOString());
  addNotification('system', '💡 Совет', 'Нажмите + для быстрого добавления задач', new Date(Date.now() - 3600000).toISOString());
}

function addNotification(type, title, message, time) {
  if (!appData.notifications || !Array.isArray(appData.notifications)) appData.notifications = [];
  
  var notification = {
    id: Date.now() + Math.random(),
    type: type,
    title: title,
    message: message,
    time: time,
    read: false
  };
  
  appData.notifications.unshift(notification);
  saveData();
  updateNotificationBadge();
  renderNotifications();
}

function renderNotifications() {
  var container = document.getElementById('notifications-container');
  var emptyState = document.getElementById('empty-notifications');
  if (!container) return;
  
  if (appData.notifications.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';
  
  var html = '';
  for (var i = 0; i < appData.notifications.length; i++) {
    var notif = appData.notifications[i];
    var unreadClass = notif.read ? '' : 'unread';
    var iconClass = notif.type === 'task' ? 'task' : notif.type === 'note' ? 'note' : notif.type === 'warning' ? 'warning' : 'system';
    var icon = notif.type === 'task' ? 'fa-list-check' : notif.type === 'note' ? 'fa-note-sticky' : notif.type === 'warning' ? 'fa-triangle-exclamation' : 'fa-bell';
    var timeStr = formatTime(notif.time);
    
    html += '<div class="notification-item ' + unreadClass + ' slide-in-up" style="animation-delay:' + (i * 0.05) + 's">';
    html += '<div class="notification-icon ' + iconClass + '"><i class="fa-solid ' + icon + '"></i></div>';
    html += '<div class="notification-content"><h4>' + notif.title + '</h4><p>' + notif.message + '</p><span class="notification-time">' + timeStr + '</span></div>';
    if (!notif.read) html += '<button class="notification-mark-read" onclick="markNotificationRead(' + notif.id + ')">Прочитано</button>';
    html += '</div>';
  }
  container.innerHTML = html;
}

function markNotificationRead(id) {
  for (var i = 0; i < appData.notifications.length; i++) {
    if (appData.notifications[i].id === id) {
      appData.notifications[i].read = true;
      saveData();
      renderNotifications();
      updateNotificationBadge();
      break;
    }
  }
}

function markAllNotificationsRead() {
  var hasUnread = false;
  for (var i = 0; i < appData.notifications.length; i++) {
    if (!appData.notifications[i].read) {
      hasUnread = true;
      appData.notifications[i].read = true;
    }
  }
  if (hasUnread) { saveData(); renderNotifications(); updateNotificationBadge(); }
}

function clearAllNotifications() {
  if (appData.notifications.length === 0) return;
  if (confirm('Очистить все уведомления?')) {
    appData.notifications = [];
    saveData();
    renderNotifications();
    updateNotificationBadge();
    showToast('🗑️ Все уведомления очищены');
  }
}

function updateNotificationBadge() {
  var badge = document.getElementById('notif-badge');
  if (!badge) return;
  var unreadCount = 0;
  for (var i = 0; i < appData.notifications.length; i++) {
    if (!appData.notifications[i].read) unreadCount++;
  }
  if (unreadCount > 0) {
    badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function formatTime(isoString) {
  var date = new Date(isoString);
  var now = new Date();
  var diff = now - date;
  if (diff < 60000) return 'Только что';
  else if (diff < 3600000) return Math.floor(diff / 60000) + ' мин. назад';
  else if (diff < 86400000) return Math.floor(diff / 3600000) + ' ч. назад';
  else return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

// ============================================
// 8. СПИСОК ПОКУПОК
// ============================================
function addShoppingItem() {
  openModal('modal-shopping');
  document.getElementById('shopping-item-name').value = '';
  document.getElementById('shopping-item-qty').value = '';
}

function saveShoppingItem() {
  var name = document.getElementById('shopping-item-name').value.trim();
  var qty = document.getElementById('shopping-item-qty').value.trim();
  if (!name) { showToast('⚠️ Введите название товара!', 'error'); return; }
  
  var item = { id: Date.now(), name: name, qty: qty || '1 шт', completed: false };
  if (!appData.shoppingList) appData.shoppingList = [];
  appData.shoppingList.unshift(item);
  saveData();
  renderShoppingList();
  updateProfileStats();
  closeModal('modal-shopping');
  showToast('✅ Товар добавлен!');
  addNotification('system', 'Покупки', 'Товар "' + name + '" добавлен в список', new Date().toISOString());
}

function renderShoppingList() {
  var container = document.getElementById('shopping-container');
  var emptyState = document.getElementById('empty-shopping');
  if (!container) return;
  var list = appData.shoppingList || [];
  
  if (list.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';
  
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var completedClass = item.completed ? 'completed' : '';
    html += '<div class="shopping-item ' + completedClass + '">';
    html += '<div class="shopping-checkbox" onclick="toggleShoppingItem(' + item.id + ')"></div>';
    html += '<div class="shopping-info"><div class="shopping-name">' + item.name + '</div><div class="shopping-qty">' + item.qty + '</div></div>';
    html += '<button class="shopping-delete" onclick="deleteShoppingItem(' + item.id + ')"><i class="fa-solid fa-trash"></i></button></div>';
  }
  container.innerHTML = html;
}

function toggleShoppingItem(id) {
  var list = appData.shoppingList || [];
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list[i].completed = !list[i].completed;
      saveData();
      renderShoppingList();
      if (list[i].completed) showToast('✓ ' + list[i].name + ' куплено!');
      break;
    }
  }
}

function deleteShoppingItem(id) {
  if (!confirm('Удалить товар?')) return;
  var list = appData.shoppingList || [];
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list.splice(i, 1);
      saveData();
      renderShoppingList();
      updateProfileStats();
      showToast('🗑️ Товар удален');
      break;
    }
  }
}

// ============================================
// 9. ТРЕКЕР ВОДЫ
// ============================================
function updateWaterTracker() {
  var amount = document.getElementById('water-amount');
  var goal = document.getElementById('water-goal');
  var fill = document.getElementById('water-fill');
  if (!amount || !goal || !fill) return;
  
  var current = appData.waterToday || 0;
  var waterGoal = appData.waterGoal || 2000;
  amount.textContent = current;
  goal.textContent = waterGoal;
  
  var circumference = 565.48;
  var percentage = Math.min(current / waterGoal, 1);
  var offset = circumference - (percentage * circumference);
  
  fill.style.strokeDasharray = circumference;
  fill.style.strokeDashoffset = offset;
  
  if (percentage >= 1) fill.style.stroke = '#10b981';
  else if (percentage >= 0.5) fill.style.stroke = '#3b82f6';
  else fill.style.stroke = '#06b6d4';
  
  if (current >= waterGoal && !appData.waterGoalAchieved) {
    addNotification('system', '🎉 Поздравляем!', 'Вы достигли дневной нормы воды!', new Date().toISOString());
    showToast('🏆 Дневная норма достигнута!');
    appData.waterGoalAchieved = true;
    saveData();
  }
}

function addWater(amount) {
  appData.waterToday = (appData.waterToday || 0) + amount;
  saveData();
  updateWaterTracker();
  showToast('💧 +' + amount + ' мл воды добавлено');
  
  var current = appData.waterToday;
  var waterGoal = appData.waterGoal || 2000;
  var progress = Math.round((current / waterGoal) * 100);
  if (progress === 25 || progress === 50 || progress === 75 || progress === 100) {
    addNotification('system', '💧 Прогресс воды', 'Вы выпили ' + current + ' мл (' + progress + '% от цели)', new Date().toISOString());
  }
}

function setWaterGoal() {
  var input = document.getElementById('water-goal-input');
  var newGoal = parseInt(input.value);
  if (newGoal > 0) {
    appData.waterGoal = newGoal;
    saveData();
    updateWaterTracker();
    showToast('✅ Цель установлена: ' + newGoal + ' мл');
  } else {
    showToast('⚠️ Введите корректное значение', 'error');
  }
}

function checkNewDay() {
  var lastDate = appData.waterLastDate || null;
  var today = new Date().toDateString();
  if (lastDate !== today) {
    appData.waterToday = 0;
    appData.waterGoalAchieved = false;
    appData.waterLastDate = today;
    saveData();
    updateWaterTracker();
  }
}

// ============================================
// 10. КАЛЬКУЛЯТОР И ТАЙМЕР
// ============================================
var calcExpression = '';
function appendCalculator(value) { calcExpression += value; document.getElementById('calc-display').textContent = calcExpression; }
function clearCalculator() { calcExpression = ''; document.getElementById('calc-display').textContent = '0'; }
function deleteCalculator() { calcExpression = calcExpression.slice(0, -1); document.getElementById('calc-display').textContent = calcExpression || '0'; }
function calculateResult() {
  try {
    var result = eval(calcExpression);
    document.getElementById('calc-display').textContent = result;
    calcExpression = result.toString();
    addNotification('system', 'Калькулятор', 'Вычисление выполнено', new Date().toISOString());
  } catch (e) {
    document.getElementById('calc-display').textContent = 'Ошибка';
    calcExpression = '';
    showToast('⚠️ Ошибка вычисления', 'error');
  }
}

var timerInterval = null;
var timerSeconds = 0;
var timerRunning = false;
function updateTimerDisplay() {
  var hours = Math.floor(timerSeconds / 3600);
  var minutes = Math.floor((timerSeconds % 3600) / 60);
  var seconds = timerSeconds % 60;
  var display = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
  document.getElementById('timer-display').textContent = display;
}
function startTimer() {
  if (!timerRunning) {
    timerRunning = true;
    timerInterval = setInterval(function() { timerSeconds++; updateTimerDisplay(); }, 1000);
    showToast('⏱️ Таймер запущен');
  }
}
function pauseTimer() {
  if (timerRunning) { clearInterval(timerInterval); timerRunning = false; showToast('⏸️ Таймер на паузе'); }
}
function resetTimer() {
  clearInterval(timerInterval); timerRunning = false; timerSeconds = 0; updateTimerDisplay(); showToast('🔄 Таймер сброшен');
}
function setTimer(minutes) { resetTimer(); timerSeconds = minutes * 60; updateTimerDisplay(); showToast('⏱️ Установлено ' + minutes + ' минут'); }

// ============================================
// 11. ПРОФИЛЬ И НАСТРОЙКИ
// ============================================
function updateProfileUI() {
  document.getElementById('profile-name').textContent = appData.profile.name;
  document.getElementById('profile-email').textContent = appData.profile.email;
  document.getElementById('profile-avatar-img').src = appData.profile.avatar;
  updateProfileStats();
}

function updateProfileStats() {
  var tasksCount = document.getElementById('profile-tasks-count');
  var notesCount = document.getElementById('profile-notes-count');
  if (tasksCount) tasksCount.textContent = appData.tasks.length;
  if (notesCount) notesCount.textContent = appData.notes.length;
}

function editProfile() {
  document.getElementById('edit-name').value = appData.profile.name;
  document.getElementById('edit-email').value = appData.profile.email;
  openModal('modal-edit-profile');
}

function saveProfile() {
  var name = document.getElementById('edit-name').value.trim();
  var email = document.getElementById('edit-email').value.trim();
  if (!name) { showToast('⚠️ Введите имя!', 'error'); return; }
  appData.profile.name = name;
  appData.profile.email = email;
  saveData();
  updateProfileUI();
  closeModal('modal-edit-profile');
  showToast('✅ Профиль обновлен!');
}

function changeAvatar() {
  var avatars = ['https://i.pravatar.cc/150?img=11','https://i.pravatar.cc/150?img=12','https://i.pravatar.cc/150?img=33','https://i.pravatar.cc/150?img=53','https://i.pravatar.cc/150?img=60'];
  var currentIndex = avatars.indexOf(appData.profile.avatar);
  var nextIndex = (currentIndex + 1) % avatars.length;
  appData.profile.avatar = avatars[nextIndex];
  saveData();
  updateProfileUI();
  showToast('📸 Аватар изменен!');
}

function showStats() {
  var completedTasks = 0;
  for (var i = 0; i < appData.tasks.length; i++) { if (appData.tasks[i].completed) completedTasks++; }
  var shoppingItems = (appData.shoppingList || []).length;
  var waterToday = appData.waterToday || 0;
  var waterGoal = appData.waterGoal || 2000;
  alert('📊 Статистика:\n\n📝 ЗАДАЧИ:\nВсего: ' + appData.tasks.length + '\nВыполнено: ' + completedTasks + '\n\n📌 ЗАМЕТКИ: ' + appData.notes.length + '\n\n🛒 ПОКУПКИ: ' + shoppingItems + '\n\n💧 ВОДА:\nВыпито: ' + waterToday + ' мл\nЦель: ' + waterGoal + ' мл\n\n🔔 УВЕДОМЛЕНИЯ: ' + appData.notifications.length);
}

function toggleNotificationsSetting() {
  var toggle = document.getElementById('profile-notif-toggle');
  appData.settings.notifications = toggle.checked;
  saveData();
  showToast(toggle.checked ? '🔔 Уведомления включены' : '🔕 Уведомления выключены');
}

function showAbout() { alert('📱 SuperApp v1.0.0\n\nРазработчик: SuperDev\n© 2024'); }
function logout() { if (confirm('Вы действительно хотите выйти?')) showToast('👋 До свидания!'); }

function toggleTheme() {
  var toggle = document.getElementById('theme-toggle');
  appData.theme = toggle.checked ? 'dark' : 'light';
  applyTheme(appData.theme);
  saveData();
  showToast(appData.theme === 'dark' ? '🌙 Тёмная тема' : '☀️ Светлая тема');
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    var toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.checked = true;
  } else {
    document.documentElement.removeAttribute('data-theme');
    var toggle2 = document.getElementById('theme-toggle');
    if (toggle2) toggle2.checked = false;
  }
}

function exportData() {
  var dataStr = JSON.stringify(appData, null, 2);
  var dataBlob = new Blob([dataStr], { type: 'application/json' });
  var url = URL.createObjectURL(dataBlob);
  var link = document.createElement('a');
  link.href = url;
  link.download = 'superapp_backup.json';
  link.click();
  showToast('📥 Данные экспортированы');
}

function importData() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function(event) {
        try {
          var imported = JSON.parse(event.target.result);
          appData = imported;
          saveData();
          setupAll();
          showToast('📤 Данные импортированы');
        } catch (err) { showToast('⚠️ Ошибка импорта', 'error'); }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function clearAllData() {
  if (confirm('⚠️ ВНИМАНИЕ! Все данные будут удалены. Продолжить?')) {
    if (confirm('Вы уверены? Это действие нельзя отменить!')) {
      appData.tasks = []; appData.notes = []; appData.notifications = [];
      appData.shoppingList = []; appData.waterToday = 0;
      saveData();
      setupAll();
      showToast('🗑️ Все данные удалены');
    }
  }
}

function simulateQRScan() {
  showToast('📷 Камера открывается...');
  setTimeout(function() {
    closeModal('modal-qr');
    showToast('✅ QR код распознан: https://example.com');
    addNotification('system', 'QR сканирование', 'Ссылка распознана', new Date().toISOString());
  }, 2000);
}

// ============================================
// 12. НАПОМИНАНИЯ
// ============================================
function checkTaskReminders() {
  var now = new Date();
  var currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  var today = now.toISOString().split('T')[0];
  var hasReminded = false;
  
  if (!appData.tasks) appData.tasks = [];
  
  for (var i = 0; i < appData.tasks.length; i++) {
    var task = appData.tasks[i];
    if (task.date === today && task.time && !task.completed) {
      if (task.reminded === undefined) task.reminded = false;
      if (task.time <= currentTime && !task.reminded) {
        addNotification('task', '⏰ Напоминание о задаче', 'Пора выполнить: ' + task.title, new Date().toISOString());
        showToast('🔔 ' + task.title);
        task.reminded = true;
        hasReminded = true;
        saveData();
      }
    }
  }
  return hasReminded;
}

function checkMorningReminders() {
  var now = new Date();
  var hour = now.getHours();
  var today = now.toISOString().split('T')[0];
  
  if (hour === 9) {
    if (!appData.tasks) appData.tasks = [];
    var todayTasks = [];
    for (var i = 0; i < appData.tasks.length; i++) {
      if (appData.tasks[i].date === today && !appData.tasks[i].completed) {
        todayTasks.push(appData.tasks[i].title);
      }
    }
    if (todayTasks.length > 0 && (!appData.morningReminderSent || appData.lastMorningReminder !== today)) {
      addNotification('system', '📋 Задачи на сегодня', 'У вас ' + todayTasks.length + ' задач: ' + todayTasks.join(', '), new Date().toISOString());
      appData.morningReminderSent = true;
      appData.lastMorningReminder = today;
      saveData();
    }
  } else if (hour !== 9) {
    appData.morningReminderSent = false;
  }
}

// ============================================
// 13. УТИЛИТЫ
// ============================================
function updateProgress() {
  var circle = document.getElementById('progress-circle');
  var completedCount = document.getElementById('completed-count');
  var progressBadge = document.getElementById('progress-badge');
  if (!circle) return;
  
  var total = appData.tasks.length;
  var completed = 0;
  for (var i = 0; i < appData.tasks.length; i++) { if (appData.tasks[i].completed) completed++; }
  
  var percentage = total > 0 ? (completed / total) * 100 : 0;
  var circumference = 2 * Math.PI * 52;
  var offset = circumference - (percentage / 100) * circumference;
  
  circle.style.strokeDashoffset = offset;
  if (completedCount) completedCount.textContent = completed;
  if (progressBadge) progressBadge.textContent = Math.round(percentage) + '%';
}

function showToast(message, type) {
  var toast = document.getElementById('toast-notification');
  var toastMessage = document.getElementById('toast-message');
  var icon = toast ? toast.querySelector('i') : null;
  if (!toast || !toastMessage) return;
  
  toastMessage.textContent = message;
  if (icon) {
    icon.className = 'fa-solid ' + (type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check');
    icon.style.color = type === 'error' ? 'var(--accent-red)' : 'var(--accent-green)';
  }
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

function saveData() {
  try { localStorage.setItem('superApp_data', JSON.stringify(appData)); }
  catch (e) { console.error('Ошибка сохранения:', e); }
}

function loadData() {
  try {
    var saved = localStorage.getItem('superApp_data');
    if (saved) {
      var data = JSON.parse(saved);
      if (data.tasks) { appData.tasks = Array.isArray(data.tasks) ? data.tasks : []; }
      if (data.notes) appData.notes = Array.isArray(data.notes) ? data.notes : [];
      if (data.notifications) appData.notifications = Array.isArray(data.notifications) ? data.notifications : [];
      if (data.shoppingList) appData.shoppingList = Array.isArray(data.shoppingList) ? data.shoppingList : [];
      if (data.profile) appData.profile = data.profile;
      if (data.theme) appData.theme = data.theme;
      if (data.settings) appData.settings = data.settings;
      if (data.waterToday !== undefined) appData.waterToday = data.waterToday;
      if (data.waterGoal) appData.waterGoal = data.waterGoal;
      if (data.waterGoalAchieved !== undefined) appData.waterGoalAchieved = data.waterGoalAchieved;
      if (data.waterLastDate) appData.waterLastDate = data.waterLastDate;
      if (data.morningReminderSent !== undefined) appData.morningReminderSent = data.morningReminderSent;
      if (data.lastMorningReminder) appData.lastMorningReminder = data.lastMorningReminder;
    } else {
      appData.tasks = [{ id: 1, title: 'Подготовить отчет', description: 'Квартальный отчет', priority: 'high', completed: false, date: new Date().toISOString().split('T')[0], time: '14:00', reminded: false, createdAt: new Date().toISOString() }];
      appData.notes = [];
      appData.notifications = [];
      appData.shoppingList = [];
      appData.morningReminderSent = false;
    }
  } catch (e) { console.error('Ошибка загрузки:', e); }
}

function testNotification() {
  addNotification('task', '🔔 ТЕСТ', 'Это тестовое уведомление!', new Date().toISOString());
  showToast('Тестовое уведомление отправлено');
}

function debugTasks() {
  console.log('📋 Текущие задачи:', appData.tasks);
  var now = new Date();
  console.log('⏰ Текущее время:', now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0'));
  console.log('📅 Сегодня:', now.toISOString().split('T')[0]);
}

// ============================================
// 14. ГЛОБАЛЬНЫЕ ФУНКЦИИ
// ============================================
window.navigateTo = navigateTo;
window.quickAction = quickAction;
window.openModal = openModal;
window.closeModal = closeModal;
window.openTaskModal = openTaskModal;
window.openNoteModal = openNoteModal;
window.selectPriority = selectPriority;
window.saveTask = saveTask;
window.filterTasks = filterTasks;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.selectNoteColor = selectNoteColor;
window.saveNote = saveNote;
window.deleteNote = deleteNote;
window.openQuickMenu = openQuickMenu;
window.closeQuickMenu = closeQuickMenu;
window.markNotificationRead = markNotificationRead;
window.clearAllNotifications = clearAllNotifications;
window.addShoppingItem = addShoppingItem;
window.saveShoppingItem = saveShoppingItem;
window.toggleShoppingItem = toggleShoppingItem;
window.deleteShoppingItem = deleteShoppingItem;
window.addWater = addWater;
window.setWaterGoal = setWaterGoal;
window.appendCalculator = appendCalculator;
window.clearCalculator = clearCalculator;
window.deleteCalculator = deleteCalculator;
window.calculateResult = calculateResult;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.setTimer = setTimer;
window.editProfile = editProfile;
window.saveProfile = saveProfile;
window.changeAvatar = changeAvatar;
window.showStats = showStats;
window.toggleNotificationsSetting = toggleNotificationsSetting;
window.showAbout = showAbout;
window.logout = logout;
window.toggleTheme = toggleTheme;
window.exportData = exportData;
window.importData = importData;
window.clearAllData = clearAllData;
window.simulateQRScan = simulateQRScan;
window.testNotification = testNotification;
window.debugTasks = debugTasks;

console.log('✅ JavaScript загружен успешно!');