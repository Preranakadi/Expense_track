const expenseList = document.getElementById('expense-list');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const addExpenseButton = document.getElementById('add-expense');
const expenseChart = document.getElementById('expense-chart').getContext('2d');

let expenses = [];

addExpenseButton.addEventListener('click', () => {
    const name = expenseNameInput.value;
    const amount = parseFloat(expenseAmountInput.value);
    if (name && !isNaN(amount)) {
        expenses.push({ name, amount });
        updateExpenseList();
        updateChart();
        localStorage.setItem('expenses', JSON.stringify(expenses));
        expenseNameInput.value = '';
        expenseAmountInput.value = '';
    }
});

function updateExpenseList() {
    expenseList.innerHTML = expenses.map(expense => `<div>${expense.name}: $${expense.amount.toFixed(2)}</div>`).join('');
}

function updateChart() {
    const chartData = expenses.map(expense => expense.amount);
    const chartLabels = expenses.map(expense => expense.name);
    new Chart(expenseChart, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Expenses',
                data: chartData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}