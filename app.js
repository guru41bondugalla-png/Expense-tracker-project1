// ==========================================
// Student Expense Tracker - JavaScript Engine
// ==========================================

// State management
let expenses = JSON.parse(localStorage.getItem('student_expenses')) || [
  { id: 1, title: 'College Textbooks', amount: 45.00, category: 'Books & Study', date: '2026-11-01' },
  { id: 2, title: 'Campus Cafeteria Lunch', amount: 8.50, category: 'Food & Dining', date: '2026-11-02' },
  { id: 3, title: 'Bus Monthly Pass', amount: 25.00, category: 'Travel & Commute', date: '2026-11-03' }
];

let monthlyBudget = parseFloat(localStorage.getItem('student_budget')) || 400.00;

// DOM Elements
const expenseForm = document.getElementById('expenseForm');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');

const budgetDisplay = document.getElementById('budgetDisplay');
const totalSpentDisplay = document.getElementById('totalSpent');
const remainingBalanceDisplay = document.getElementById('remainingBalance');
const budgetPercentDisplay = document.getElementById('budgetPercent');
const progressBar = document.getElementById('progressBar');
const budgetAlert = document.getElementById('budgetAlert');
const editBudgetBtn = document.getElementById('editBudgetBtn');

const expenseListBody = document.getElementById('expenseListBody');
const emptyMessage = document.getElementById('emptyMessage');
const filterCategory = document.getElementById('filterCategory');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const themeToggle = document.getElementById('themeToggle');

// Initialize Today's Date
dateInput.value = new Date().toISOString().split('T')[0];

// Initialize theme from storage
if (localStorage.getItem('student_theme') === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeToggle.textContent = '☀️ Theme';
}

// ------------------------------------------
// Core Functions
// ------------------------------------------

function saveData() {
  localStorage.setItem('student_expenses', JSON.stringify(expenses));
  localStorage.setItem('student_budget', monthlyBudget.toString());
}

function updateStats() {
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = monthlyBudget - totalSpent;
  const percentage = monthlyBudget > 0 ? Math.min(Math.round((totalSpent / monthlyBudget) * 100), 100) : 0;

  budgetDisplay.textContent = monthlyBudget.toFixed(2);
  totalSpentDisplay.textContent = totalSpent.toFixed(2);
  remainingBalanceDisplay.textContent = remaining.toFixed(2);
  budgetPercentDisplay.textContent = `${percentage}%`;
  progressBar.style.width = `${percentage}%`;

  // Color badges based on budget threshold
  if (remaining < 0) {
    remainingBalanceDisplay.className = 'stat-value spent';
    progressBar.className = 'progress-bar-fill danger';
    budgetAlert.textContent = `⚠️ You are over budget by $${Math.abs(remaining).toFixed(2)}!`;
    budgetAlert.style.color = 'var(--accent-red)';
  } else if (percentage >= 80) {
    remainingBalanceDisplay.className = 'stat-value';
    progressBar.className = 'progress-bar-fill warning';
    budgetAlert.textContent = '⚡ Careful! You have used over 80% of your budget.';
    budgetAlert.style.color = 'var(--accent-yellow)';
  } else {
    remainingBalanceDisplay.className = 'stat-value positive';
    progressBar.className = 'progress-bar-fill';
    budgetAlert.textContent = '✅ You are staying well within budget!';
    budgetAlert.style.color = 'var(--accent-green)';
  }
}

function renderExpenses(filter = 'all') {
  expenseListBody.innerHTML = '';
  
  const filtered = filter === 'all' 
    ? expenses 
    : expenses.filter(e => e.category === filter);

  if (filtered.length === 0) {
    emptyMessage.style.display = 'block';
  } else {
    emptyMessage.style.display = 'none';
    filtered.slice().reverse().forEach(exp => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${exp.date}</td>
        <td><strong>${escapeHtml(exp.title)}</strong></td>
        <td><span class="category-tag">${escapeHtml(exp.category)}</span></td>
        <td>$${exp.amount.toFixed(2)}</td>
        <td>
          <button class="btn-delete" title="Delete" onclick="deleteExpense(${exp.id})">🗑️</button>
        </td>
      `;
      expenseListBody.appendChild(row);
    });
  }

  updateStats();
}

function addExpense(e) {
  e.preventDefault();
  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!title || isNaN(amount) || amount <= 0 || !date) {
    alert('Please enter valid expense details.');
    return;
  }

  const newExpense = {
    id: Date.now(),
    title,
    amount,
    category,
    date
  };

  expenses.push(newExpense);
  saveData();
  renderExpenses(filterCategory.value);

  // Reset form
  expenseForm.reset();
  dateInput.value = new Date().toISOString().split('T')[0];
  titleInput.focus();
}

window.deleteExpense = function(id) {
  if (confirm('Delete this expense?')) {
    expenses = expenses.filter(exp => exp.id !== id);
    saveData();
    renderExpenses(filterCategory.value);
  }
};

function editBudget() {
  const newBudget = prompt('Set your Monthly Budget ($):', monthlyBudget);
  if (newBudget !== null) {
    const parsed = parseFloat(newBudget);
    if (!isNaN(parsed) && parsed >= 0) {
      monthlyBudget = parsed;
      saveData();
      updateStats();
    } else {
      alert('Please enter a valid numeric budget.');
    }
  }
}

function exportToCsv() {
  if (expenses.length === 0) {
    alert('No expenses to export!');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Date,Title,Category,Amount\n";
  expenses.forEach(e => {
    csvContent += `"${e.date}","${e.title.replace(/"/g, '""')}","${e.category}",${e.amount.toFixed(2)}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('student_theme', 'light');
    themeToggle.textContent = '🌙 Theme';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('student_theme', 'dark');
    themeToggle.textContent = '☀️ Theme';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ------------------------------------------
// Event Listeners
// ------------------------------------------
expenseForm.addEventListener('submit', addExpense);
editBudgetBtn.addEventListener('click', editBudget);
exportCsvBtn.addEventListener('click', exportToCsv);
themeToggle.addEventListener('click', toggleTheme);
filterCategory.addEventListener('change', (e) => renderExpenses(e.target.value));

// Initial render
renderExpenses();

