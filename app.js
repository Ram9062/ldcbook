// app.js

let data = JSON.parse(localStorage.getItem('khatabookData')) || [];
let selectedCustomerIndex = null;
let selectedTransactionIndex = null;
let isReadOnly = false;

// Password system
const correctPassword = "1976"; // You can change this

function checkPassword() {
  const pass = document.getElementById('passwordInput').value;
  if (pass === correctPassword) {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    document.querySelectorAll('.owner-only').forEach(el => el.style.display = '');
  } else {
    document.getElementById('wrongPass').style.display = 'block';
  }
}

function enterReadOnly() {
  isReadOnly = true;
  document.getElementById('passwordModal').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
  document.querySelectorAll('.owner-only').forEach(el => el.style.display = 'none');
}

function saveData() {
  localStorage.setItem('khatabookData', JSON.stringify(data));
  render();
}

function addCustomer() {
  const name = document.getElementById('newCustomer').value.trim();
  if (name) {
    data.push({ name, transactions: [] });
    document.getElementById('newCustomer').value = '';
    saveData();
  }
}

function render() {
  let totalCredit = 0, totalDebit = 0;
  const list = document.getElementById('customerList');
  list.innerHTML = '';

  data.forEach((cust, index) => {
    const balance = cust.transactions.reduce((sum, t) => {
      return t.type === 'credit' ? sum + t.amount : sum - t.amount;
    }, 0);

    const card = document.createElement('div');
    card.className = 'card customer-card';
    card.innerHTML = `<div class="card-body d-flex justify-content-between">
      <strong>${cust.name}</strong>
      <span>₹${balance}</span>
    </div>`;
    card.onclick = () => openCustomer(index);
    list.appendChild(card);

    cust.transactions.forEach(t => {
      if (t.type === 'credit') totalCredit += t.amount;
      else totalDebit += t.amount;
    });
  });

  document.getElementById('totalCredit').innerText = totalCredit;
  document.getElementById('totalDebit').innerText = totalDebit;
  document.getElementById('totalBalance').innerText = totalCredit - totalDebit;
}

function openCustomer(index) {
  selectedCustomerIndex = index;
  const cust = data[index];
  document.getElementById('editCustomerName').value = cust.name;
  renderCustomerModal();
  new bootstrap.Modal(document.getElementById('customerModal')).show();
}

function saveCustomerName() {
  const name = document.getElementById('editCustomerName').value.trim();
  if (name) {
    data[selectedCustomerIndex].name = name;
    saveData();
  }
}

function deleteCustomer() {
  if (confirm("Are you sure to delete this customer?")) {
    data.splice(selectedCustomerIndex, 1);
    saveData();
    bootstrap.Modal.getInstance(document.getElementById('customerModal')).hide();
  }
}

function addModalTransaction() {
  const amount = parseFloat(document.getElementById('modalAmount').value);
  const type = document.getElementById('modalType').value;
  if (amount > 0) {
    const now = new Date();
    const datetime = now.toISOString();
    data[selectedCustomerIndex].transactions.push({ amount, type, datetime });
    document.getElementById('modalAmount').value = '';
    saveData();
  }
}

function renderCustomerModal() {
  const cust = data[selectedCustomerIndex];
  const modalTransactions = document.getElementById('modalTransactions');
  modalTransactions.innerHTML = '';

  let balance = 0;
  cust.transactions.forEach((t, idx) => {
    balance += t.type === 'credit' ? t.amount : -t.amount;
    const row = document.createElement('div');
    row.className = `d-flex justify-content-between mb-2`;

    const dateFormatted = new Date(t.datetime).toLocaleString();
    row.innerHTML = `
      <div>
        <span class="${t.type}">₹${t.amount} (${t.type})</span>
        <br><small>${dateFormatted}</small>
      </div>
      ${isReadOnly ? '' : `<button class="btn btn-sm btn-secondary" onclick="editTransactionDate(${idx})">Edit Date</button>`}
    `;
    modalTransactions.appendChild(row);
  });

  document.getElementById('modalBalance').innerText = balance;
}

function shareCustomer() {
  const customerData = data[selectedCustomerIndex];
  const blob = new Blob([JSON.stringify(customerData)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  document.getElementById('shareableLink').value = url;
}

function editTransactionDate(transactionIndex) {
  selectedTransactionIndex = transactionIndex;
  const transaction = data[selectedCustomerIndex].transactions[transactionIndex];
  document.getElementById('editDateInput').value = transaction.datetime.substring(0, 16);
  new bootstrap.Modal(document.getElementById('editDateModal')).show();
}

function saveEditedDate() {
  const newDate = document.getElementById('editDateInput').value;
  if (newDate) {
    data[selectedCustomerIndex].transactions[selectedTransactionIndex].datetime = new Date(newDate).toISOString();
    saveData();
    bootstrap.Modal.getInstance(document.getElementById('editDateModal')).hide();
  }
}

// Initial Render
render();
