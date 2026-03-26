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
initCharts(); // 🔥 added
});

/* ---------- MODAL ---------- */
function openModal() {
document.getElementById("transactionModal").classList.add("open");
}

function closeModal() {
document.getElementById("transactionModal").classList.remove("open");
}

/* ---------- TYPE ---------- */
function setTransactionType(type) {
currentType = type;
}

/* ---------- ADD TRANSACTION ---------- */
function handleAddTransaction(e) {
e.preventDefault();

let amount = parseFloat(document.getElementById("amount").value);
let description = document.getElementById("description").value;
let category = document.getElementById("category").value;
let date = document.getElementById("date").value;

if (category === "**custom**") {
category = document.getElementById("customCategory").value;
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
document.getElementById("transactionForm").reset();

renderTransactions();
updateSummary();
updateCharts(); // 🔥 added
}

/* ---------- DELETE ---------- */
function deleteTransaction(id) {
transactions = transactions.filter(t => t.id !== id);
localStorage.setItem("transactions", JSON.stringify(transactions));

renderTransactions();
updateSummary();
updateCharts(); // 🔥 added
}

/* ---------- SUMMARY ---------- */
function updateSummary() {
let income = 0, expense = 0;

transactions.forEach(t => {
if (t.type === "income") income += t.amount;
else expense += t.amount;
});

document.getElementById("totalIncome").innerText = "₹" + income.toFixed(2);
document.getElementById("totalExpenses").innerText = "₹" + expense.toFixed(2);
document.getElementById("totalBalance").innerText = "₹" + (income - expense).toFixed(2);
}

/* ---------- TABLE ---------- */
function renderTransactions() {
const body = document.getElementById("transactionsBody");
const empty = document.getElementById("emptyState");

body.innerHTML = "";

if (transactions.length === 0) {
empty.classList.add("show");
return;
} else {
empty.classList.remove("show");
}

transactions.forEach(t => {
const row = document.createElement("tr");

```
row.innerHTML = `
  <td>${t.date}</td>
  <td>${t.description}</td>
  <td>${t.category}</td>
  <td>${t.type}</td>
  <td>${t.amount}</td>
  <td>
    <button onclick="deleteTransaction(${t.id})">Delete</button>
  </td>
`;

body.appendChild(row);
```

});
}

/* ---------- INIT CHARTS ---------- */
function initCharts() {
const ctx1 = document.getElementById("categoryPieChart");
const ctx2 = document.getElementById("monthlyBarChart");
const ctx3 = document.getElementById("balanceLineChart");

pieChart = new Chart(ctx1, {
type: "pie",
data: { labels: [], datasets: [{ data: [] }] }
});

barChart = new Chart(ctx2, {
type: "bar",
data: {
labels: [],
datasets: [
{ label: "Income", data: [] },
{ label: "Expense", data: [] }
]
}
});

lineChart = new Chart(ctx3, {
type: "line",
data: {
labels: [],
datasets: [{ label: "Balance", data: [] }]
}
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

```
let m = t.date.slice(0, 7);

if (!months[m]) {
  months[m] = { income: 0, expense: 0 };
}

months[m][t.type] += t.amount;
```

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
