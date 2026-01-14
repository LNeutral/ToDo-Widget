let tasks = [];
let isMinimized = false;
let currentTheme = 'mischka';

const widget = document.getElementById('widget');
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCounter = document.getElementById('taskCounter');
const minimizeBtn = document.getElementById('minimizeBtn');
const minimizedText = document.getElementById('minimizedText');
const settingsBtn = document.getElementById('settingsBtn');
const themeSelector = document.getElementById('themeSelector');

// Normalize stored tasks to an array for backward compatibility.
function normalizeTasks(stored) {
  if (Array.isArray(stored)) return stored;
  if (stored && typeof stored === 'object') {
    if (Array.isArray(stored.tasks)) return stored.tasks;
    if (stored.tasksByList && typeof stored.tasksByList === 'object') {
      if (stored.activeListId && Array.isArray(stored.tasksByList[stored.activeListId])) {
        return stored.tasksByList[stored.activeListId];
      }
      const firstList = Object.values(stored.tasksByList).find(Array.isArray);
      if (firstList) return firstList;
    }
  }
  return [];
}

// Load tasks and theme from storage
async function loadTasks() {
  const stored = await window.electron.getTasks();
  tasks = normalizeTasks(stored);
  renderTasks();
}

async function loadTheme() {
  currentTheme = await window.electron.getTheme();
  applyTheme(currentTheme);
}

// Apply theme
function applyTheme(theme) {
  currentTheme = theme;
  document.body.setAttribute('data-theme', theme);
  
  // Update selected state
  document.querySelectorAll('.theme-option').forEach(option => {
    option.classList.toggle('selected', option.dataset.theme === theme);
  });
}

// Change theme
async function changeTheme(theme) {
  await window.electron.saveTheme(theme);
  applyTheme(theme);
  themeSelector.classList.remove('active');
}

// Save tasks to storage
async function saveTasks() {
  await window.electron.saveTasks(tasks);
}

// Add task
function addTask() {
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({
      id: Date.now(),
      text: text,
      completed: false
    });
    taskInput.value = '';
    saveTasks();
    renderTasks();
  }
}

// Toggle task completion
function toggleTask(id) {
  tasks = tasks.map(task => 
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

// Delete task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// Render tasks
function renderTasks() {
  const remaining = tasks.filter(t => !t.completed).length;
  taskCounter.textContent = `${remaining} of ${tasks.length} tasks remaining`;
  minimizedText.textContent = `My Tasks (${remaining})`;

  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <p>No tasks yet</p>
        <p>Add a task to get started</p>
      </div>
    `;
    return;
  }

  taskList.innerHTML = tasks.map(task => `
    <div class="task-item">
      <input 
        type="checkbox" 
        class="task-checkbox" 
        ${task.completed ? 'checked' : ''}
        onchange="toggleTask(${task.id})"
      >
      <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
      <button class="delete-btn" onclick="deleteTask(${task.id})">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `).join('');
}

// Toggle minimize
function toggleMinimize() {
  isMinimized = !isMinimized;
  widget.classList.toggle('minimized', isMinimized);
  if (isMinimized) {
    window.electron.minimizeWindow();
  }
}

// Event listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});
minimizeBtn.addEventListener('click', toggleMinimize);
widget.addEventListener('click', () => {
  if (isMinimized) toggleMinimize();
});

// Theme selector
settingsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  themeSelector.classList.toggle('active');
});

document.addEventListener('click', (e) => {
  if (!themeSelector.contains(e.target) && !settingsBtn.contains(e.target)) {
    themeSelector.classList.remove('active');
  }
});

document.querySelectorAll('.theme-option').forEach(option => {
  option.addEventListener('click', (e) => {
    e.stopPropagation();
    changeTheme(option.dataset.theme);
  });
});

// Expose functions globally for inline handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// Initialize
loadTasks();
loadTheme();
