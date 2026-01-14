let tasks = [];
let isMinimized = false;
let currentTheme = 'mischka';
let taskLists = { personal: [] };
let listNames = { personal: 'Personal' };
let activeListId = 'personal';
let listCounter = 1;

const widget = document.getElementById('widget');
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCounter = document.getElementById('taskCounter');
const minimizeBtn = document.getElementById('minimizeBtn');
const minimizedText = document.getElementById('minimizedText');
const settingsBtn = document.getElementById('settingsBtn');
const themeSelector = document.getElementById('themeSelector');
const addListBtn = document.getElementById('addListBtn');
const tabsContainer = document.getElementById('tabsContainer');
const listNameModal = document.getElementById('listNameModal');
const listNameInput = document.getElementById('listNameInput');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');

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
  
  if (stored && typeof stored === 'object' && stored.taskLists) {
    taskLists = stored.taskLists;
    listNames = stored.listNames || { personal: 'Personal' };
    activeListId = stored.activeListId || 'personal';
    
    // Find the highest counter from existing lists
    Object.keys(taskLists).forEach(listId => {
      if (listId.startsWith('list-')) {
        const num = parseInt(listId.replace('list-', ''));
        listCounter = Math.max(listCounter, num);
      }
    });
  } else {
    // Backward compatibility
    taskLists = { personal: normalizeTasks(stored) };
    listNames = { personal: 'Personal' };
  }
  
  // Create tabs for each list
  Object.entries(taskLists).forEach(([listId, _]) => {
    if (listId !== 'personal') {
      const listName = listNames[listId] || listId.replace('list-', 'List ');
      createTabButton(listId, listName);
    }
  });
  
  switchList(activeListId);
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
  await window.electron.saveTasks({ taskLists, listNames, activeListId });
}

// Add new task list
function addNewList() {
  listNameInput.value = '';
  listNameModal.classList.add('active');
  listNameInput.focus();
}

// Create list from modal input
function createListFromModal() {
  const listName = listNameInput.value.trim();
  if (listName) {
    listCounter++;
    const listId = `list-${listCounter}`;
    taskLists[listId] = [];
    listNames[listId] = listName;
    createTabButton(listId, listName);
    switchList(listId);
    saveTasks();
    listNameModal.classList.remove('active');
  }
}

// Close modal
function closeListModal() {
  listNameModal.classList.remove('active');
}
function createTabButton(listId, listName) {
  const tab = document.createElement('button');
  tab.className = 'tab';
  tab.dataset.listId = listId;
  tab.textContent = listName;
  
  // Insert before the add button
  tabsContainer.insertBefore(tab, addListBtn);
}

// Switch active task list
function switchList(listId) {
  activeListId = listId;
  tasks = taskLists[listId] || [];
  
  // Update active tab styling
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.listId === listId);
  });
  
  renderTasks();
  saveTasks();
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
console.log('addListBtn:', addListBtn);
console.log('tabsContainer:', tabsContainer);
addBtn.addEventListener('click', addTask);
if (addListBtn) {
  addListBtn.addEventListener('click', () => {
    console.log('Add list button clicked!');
    addNewList();
  });
}
confirmBtn.addEventListener('click', createListFromModal);
cancelBtn.addEventListener('click', closeListModal);
listNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') createListFromModal();
});

// Tab switching with event delegation
tabsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('tab')) {
    const listId = e.target.dataset.listId;
    switchList(listId);
  }
});
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
