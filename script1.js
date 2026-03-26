let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentType = "income";

document.addEventListener("DOMContentLoaded", () => {
  renderTransactions();
  updateSummary();
});

function openModal() {
  document.getElementById("transactionModal").classList.add("open");
}

function closeModal() {
  document.getElementById("transactionModal").classList.remove("open");
}

function setTransactionType(type) {
  currentType = type;
}

function handleAddTransaction(e) {
  e.preventDefault();

  let amount = parseFloat(document.getElementById("amount").value);
  let description = document.getElementById("description").value;
  let category = document.getElementById("category").value;
  let date = document.getElementById("date").value;

  if (category === "__custom__") {
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
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  renderTransactions();
  updateSummary();
}

function updateSummary() {
  let income = 0, expense = 0;

  transactions.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  document.getElementById("totalIncome").innerText = "₹" + income;
  document.getElementById("totalExpenses").innerText = "₹" + expense;
  document.getElementById("totalBalance").innerText = "₹" + (income - expense);
}

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
  });
}
