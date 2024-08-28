/*
  storage.js
  Persists expenses, wallet balance, budget, and currency preference to localStorage.
  Data model per expense:
  {
    id: number (timestamp),
    amount: number,
    category: string,
    note: string,
    date: "YYYY-MM-DD",
    type: "debit" | "credit"   // optional, default debit
  }
*/

const STORAGE_KEY   = 'expenses';
const WALLET_KEY    = 'wallet_balance';
const CURRENCY_KEY  = 'et_currency';
const BUDGET_KEY    = 'et_monthly_budget';

/** ── Expenses ──────────────────────────────────────────── */

/** Get all expenses from localStorage (returns array) */
function getExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.error('Failed to read expenses from localStorage', e);
    return [];
  }
}

/** Save full expenses array to localStorage */
function saveExpenses(expenses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses to localStorage', e);
  }
}

/** Add a single expense object and persist */
function saveExpense(expense) {
  const expenses = getExpenses();
  expenses.push(expense);
  saveExpenses(expenses);
}

/** Delete expense by id and persist */
function deleteExpense(id) {
  const expenses = getExpenses();
  saveExpenses(expenses.filter(e => String(e.id) !== String(id)));
}

/** Update a single expense by id */
function updateExpense(id, updates) {
  const expenses = getExpenses();
  const idx = expenses.findIndex(e => String(e.id) === String(id));
  if (idx === -1) return false;
  expenses[idx] = { ...expenses[idx], ...updates };
  saveExpenses(expenses);
  return true;
}

/** ── Wallet ─────────────────────────────────────────────── */

function getWalletBalance() {
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    if (raw == null) return 0;
    const n = Number(JSON.parse(raw));
    return isNaN(n) ? 0 : n;
  } catch (e) {
    console.error('Failed to read wallet balance', e);
    return 0;
  }
}

function setWalletBalance(amount) {
  try {
    localStorage.setItem(WALLET_KEY, JSON.stringify(Number(amount) || 0));
  } catch (e) {
    console.error('Failed to save wallet balance', e);
  }
}

function addWalletFunds(amount) {
  setWalletBalance(getWalletBalance() + Number(amount || 0));
}

/** ── Currency ───────────────────────────────────────────── */

function getCurrency() {
  return localStorage.getItem(CURRENCY_KEY) || 'INR';
}

function setCurrency(code) {
  localStorage.setItem(CURRENCY_KEY, code);
}

/** ── Monthly Budget ─────────────────────────────────────── */

function getMonthlyBudget() {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (raw == null) return 0;
    const n = Number(JSON.parse(raw));
    return isNaN(n) ? 0 : n;
  } catch (e) {
    return 0;
  }
}

function setMonthlyBudget(amount) {
  try {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(Number(amount) || 0));
  } catch (e) {
    console.error('Failed to save monthly budget', e);
  }
}

/** ── Export Helpers ─────────────────────────────────────── */

/** Returns a CSV string for all debit expenses */
function exportToCSV() {
  const expenses = getExpenses().filter(e => e.type !== 'credit');
  const header = ['Date', 'Category', 'Amount', 'Note'];
  const rows = expenses.map(e => [
    e.date || '',
    e.category || '',
    Number(e.amount).toFixed(2),
    `"${(e.note || '').replace(/"/g, '""')}"` // escape quotes
  ]);
  return [header, ...rows].map(r => r.join(',')).join('\n');
}

/** ── Expose ─────────────────────────────────────────────── */
window.storage = {
  getExpenses,
  saveExpense,
  saveExpenses,
  deleteExpense,
  updateExpense,
  getWalletBalance,
  setWalletBalance,
  addWalletFunds,
  getCurrency,
  setCurrency,
  getMonthlyBudget,
  setMonthlyBudget,
  exportToCSV
};
