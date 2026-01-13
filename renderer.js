// ============================================
// FILE: renderer.js
// ============================================

let tasks = [];
let isMinimized = false;

const widget = document.getElementById('widget');
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCounter = document.getElementById('taskCounter');
const minimizeBtn = document.getElementById('minimizeBtn');
const minimizedText = document.getElementById('minimizedText');

// Load tasks from storage
async function loadTasks() {
  tasks = await window.electron.getTasks();
  renderTasks();
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

// Expose functions globally for inline handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// Initialize
loadTasks();