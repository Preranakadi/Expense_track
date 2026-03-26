/* ===============================
Expense Tracker - script.js
(Enhanced with Charts)
=============================== */

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentType = "income";

// Chart variables
let pieChart, barChart, lineChart;

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderTransactions();
  updateSummary();
  initCharts();
  setDefaultDate();
});

/* ---------- MODAL ---------- */
function openModal() {
  document.getElementById("transactionModal").classList.add("open");
}

function closeModal() {
  document.getElementById("transactionModal").classList.remove("open");
  resetForm();
}

function resetForm() {
  document.getElementById("transactionForm").reset();
  setDefaultDate();
  document.getElementById("customCategoryGroup").style.display = "none";
}

/* ---------- SET DEFAULT DATE ---------- */
function setDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("date").value = today;
}

/* ---------- TYPE TOGGLE ---------- */
function setTransactionType(type) {
  currentType = type;
  
  // Update button states
  const incomeBtn = document.getElementById("typeIncomeBtn");
  const expenseBtn = document.getElementById("typeExpenseBtn");
  
  if (type === "income") {
    incomeBtn.classList.add("active");
    expenseBtn.classList.remove("active");
  } else {
    incomeBtn.classList.remove("active");
    expenseBtn.classList.add("active");
  }
}

/* ---------- CATEGORY CHANGE ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category");
  if (categorySelect) {
    categorySelect.addEventListener("change", function() {
      const customCategoryGroup = document.getElementById("customCategoryGroup");
      if (this.value === "__custom__") {
        customCategoryGroup.style.display = "block";
      } else {
        customCategoryGroup.style.display = "none";
      }
    });
  }
});

/* ---------- ADD TRANSACTION ---------- */
function handleAddTransaction(e) {
  e.preventDefault();

  let amount = parseFloat(document.getElementById("amount").value);
  let description = document.getElementById("description").value;
  let category = document.getElementById("category").value;
  let date = document.getElementById("date").value;

  if (category === "__custom__") {
    category = document.getElementById("customCategory").value;
    if (!category) {
      alert("Please enter a custom category name");
      return;
    }
  }

  const transaction = {
    id: Date.now(),
    amount,
    description,
    category,
    type: currentType,
    date
  };

  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  closeModal();
  renderTransactions();
  updateSummary();
  updateCharts();
}

/* ---------- DELETE ---------- */
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  renderTransactions();
  updateSummary();
  updateCharts();
}

/* ---------- SUMMARY ---------- */
function updateSummary() {
  let income = 0, expense = 0;

  transactions.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  const balance = income - expense;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  document.getElementById("totalIncome").innerText = "₹" + income.toFixed(2);
  document.getElementById("totalExpenses").innerText = "₹" + expense.toFixed(2);
  document.getElementById("totalBalance").innerText = "₹" + balance.toFixed(2);
  document.getElementById("savingsRate").innerText = savingsRate + "%";
}

/* ---------- TABLE ---------- */
function renderTransactions() {
  const body = document.getElementById("transactionsBody");
  const empty = document.getElementById("emptyState");
  const categoryFilter = document.getElementById("categoryFilter");
  const typeFilter = document.getElementById("typeFilter");

  body.innerHTML = "";

  // Update category filter options
  const categories = new Set();
  transactions.forEach(t => categories.add(t.category));
  
  // Preserve existing options and add new categories
  const existingOptions = Array.from(categoryFilter.options).map(o => o.value);
  categories.forEach(cat => {
    if (!existingOptions.includes(cat) && cat !== "all") {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    }
  });

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const categoryMatch = categoryFilter.value === "all" || t.category === categoryFilter.value;
    const typeMatch = typeFilter.value === "all" || t.type === typeFilter.value;
    return categoryMatch && typeMatch;
  });

  if (filteredTransactions.length === 0) {
    empty.classList.add("show");
    return;
  } else {
    empty.classList.remove("show");
  }

  filteredTransactions.forEach(t => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.description}</td>
      <td>${t.category}</td>
      <td><span class="badge ${t.type}">${t.type.charAt(0).toUpperCase() + t.type.slice(1)}</span></td>
      <td>₹${t.amount.toFixed(2)}</td>
      <td>
        <button class="btn-delete" onclick="deleteTransaction(${t.id})">Delete</button>
      </td>
    `;
    body.appendChild(row);
  });
}

/* ---------- INIT CHARTS ---------- */
function initCharts() {
  const ctx1 = document.getElementById("categoryPieChart");
  const ctx2 = document.getElementById("monthlyBarChart");
  const ctx3 = document.getElementById("balanceLineChart");

  pieChart = new Chart(ctx1, {
    type: "pie",
    data: { labels: [], datasets: [{ data: [], backgroundColor: [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"
    ]}] },
    options: { responsive: true, maintainAspectRatio: true }
  });

  barChart = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        { label: "Income", data: [], backgroundColor: "#4ECDC4" },
        { label: "Expense", data: [], backgroundColor: "#FF6B6B" }
      ]
    },
    options: { responsive: true, maintainAspectRatio: true }
  });

  lineChart = new Chart(ctx3, {
    type: "line",
    data: {
      labels: [],
      datasets: [{ label: "Balance", data: [], borderColor: "#45B7D1", backgroundColor: "rgba(69, 183, 209, 0.1)", tension: 0.4 }]
    },
    options: { responsive: true, maintainAspectRatio: true }
  });

  updateCharts();
}

/* ---------- UPDATE CHARTS ---------- */
function updateCharts() {
  // PIE (expenses by category)
  let categoryData = {};

  transactions.forEach(t => {
    if (t.type === "expense") {
      categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
    }
  });

  pieChart.data.labels = Object.keys(categoryData);
  pieChart.data.datasets[0].data = Object.values(categoryData);
  pieChart.update();

  // BAR (monthly)
  let months = {};

  transactions.forEach(t => {
    if (!t.date) return;
    let m = t.date.slice(0, 7);
    if (!months[m]) {
      months[m] = { income: 0, expense: 0 };
    }
    months[m][t.type] += t.amount;
  });

  barChart.data.labels = Object.keys(months);
  barChart.data.datasets[0].data = Object.values(months).map(m => m.income);
  barChart.data.datasets[1].data = Object.values(months).map(m => m.expense);
  barChart.update();

  // LINE (balance trend)
  let balance = 0;
  let trend = [];
  let labels = [];

  transactions.forEach(t => {
    balance += t.type === "income" ? t.amount : -t.amount;
    trend.push(balance);
    labels.push(t.date);
  });

  lineChart.data.labels = labels;
  lineChart.data.datasets[0].data = trend;
  lineChart.update();
}