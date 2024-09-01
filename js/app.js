/* app.js
   App initialization, event wiring, search/filter/sort, CSV export,
   currency switching, monthly budget, keyboard shortcuts.
   Depends on: storage.js, ui.js, theme.js
*/

/* ── Date helpers ────────────────────────────────────────── */
function toYMD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Mon as start
  const mon = new Date(now.setDate(diff));
  return toYMD(mon);
}

/* ── Core refresh ─────────────────────────────────────────── */
function getFilteredExpenses() {
  let expenses = window.storage.getExpenses();
  const search   = (document.getElementById('search-input')  || {}).value || '';
  const catFilter = (document.getElementById('filter-category') || {}).value || '';
  const sortVal   = (document.getElementById('sort-select')   || {}).value || 'newest';

  // search filter
  if (search.trim()) {
    const q = search.toLowerCase();
    expenses = expenses.filter(e =>
      (e.note || '').toLowerCase().includes(q) ||
      (e.category || '').toLowerCase().includes(q) ||
      String(e.amount).includes(q)
    );
  }

  // category filter
  if (catFilter) {
    expenses = expenses.filter(e => e.category === catFilter);
  }

  // sort
  expenses = expenses.slice().sort((a, b) => {
    if (sortVal === 'oldest')  return Number(a.id) - Number(b.id);
    if (sortVal === 'highest') return Number(b.amount) - Number(a.amount);
    if (sortVal === 'lowest')  return Number(a.amount) - Number(b.amount);
    return Number(b.id) - Number(a.id); // newest default
  });

  return expenses;
}

function refreshUI() {
  const allExpenses = window.storage.getExpenses();
  const walletBalance = window.storage.getWalletBalance();
  const todayStr = toYMD();
  const monthPrefix = todayStr.slice(0, 7);
  const weekStart = getWeekStart();
  const budget = window.storage.getMonthlyBudget ? window.storage.getMonthlyBudget() : 0;

  let totals = { today: 0, week: 0, month: 0, overall: 0 };

  allExpenses.forEach(exp => {
    if (exp.type === 'credit') return;
    const amount = Number(exp.amount) || 0;
    totals.overall += amount;
    if ((exp.date || '').slice(0, 10) === todayStr)    totals.today += amount;
    if ((exp.date || '').slice(0, 7) === monthPrefix)  totals.month += amount;
    if ((exp.date || '') >= weekStart)                  totals.week  += amount;
  });

  window.ui.updateSummary(totals);
  window.ui.updateWalletBalance(walletBalance || 0);

  if (window.ui.renderBudgetBar) {
    window.ui.renderBudgetBar(totals.month, budget);
  }

  // render with current filters applied
  const filtered = getFilteredExpenses();
  window.ui.renderExpenses(filtered, (id) => {
    const existing = window.storage.getExpenses();
    const found = existing.find(e => String(e.id) === String(id));
    if (!found) return;

    const isCredit = found.type === 'credit';
    if (!confirm(isCredit ? 'Delete this income record?' : 'Delete this expense?')) return;

    const amt = Number(found.amount) || 0;
    const curBalance = window.storage.getWalletBalance() || 0;
    window.storage.setWalletBalance(isCredit ? curBalance - amt : curBalance + amt);
    window.storage.deleteExpense(id);

    window.ui.showToast('Expense deleted.', 'error');
    refreshUI();
  });
}

/* ── Expense Form ─────────────────────────────────────────── */
function initForm() {
  const form      = document.getElementById('expense-form');
  const amountEl  = document.getElementById('amount');
  const categoryEl = document.getElementById('category');
  const noteEl    = document.getElementById('note');
  const dateEl    = document.getElementById('date');

  dateEl.value = toYMD();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(amountEl.value);
    if (isNaN(amount) || amount <= 0) {
      window.ui.showToast('Please enter a valid amount greater than 0.', 'error');
      return;
    }

    const expense = {
      id: Date.now(),
      amount: Number(amount),
      category: categoryEl.value || 'Other',
      note: noteEl.value.trim(),
      date: dateEl.value || toYMD(),
      type: 'debit'
    };

    window.storage.saveExpense(expense);
    window.storage.setWalletBalance((window.storage.getWalletBalance() || 0) - Number(amount));

    amountEl.value = '';
    noteEl.value   = '';
    dateEl.value   = toYMD();

    window.ui.showToast(`✅ Expense added: ${categoryEl.value}`, 'success');
    refreshUI();
  });
}

/* ── Wallet / Add Funds ───────────────────────────────────── */
function initWalletControls() {
  const addForm  = document.getElementById('add-funds-form');
  const addInput = document.getElementById('add-amount');
  if (!addForm || !addInput) return;

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = parseFloat(addInput.value);
    if (isNaN(v) || v <= 0) {
      window.ui.showToast('Enter an amount greater than 0 to add to wallet.', 'error');
      return;
    }
    const credit = {
      id: Date.now(),
      amount: Number(v),
      category: 'Income',
      type: 'credit',
      note: 'Funds added to wallet',
      date: toYMD()
    };
    window.storage.saveExpense(credit);
    window.storage.addWalletFunds(Number(v));
    addInput.value = '';

    window.ui.showToast(`💰 Wallet topped up by ${window.ui.formatCurrency(v)}`, 'success');
    refreshUI();
  });
}

/* ── Currency Selector ───────────────────────────────────── */
function initCurrencySelector() {
  const sel = document.getElementById('currency-select');
  if (!sel) return;
  sel.value = window.storage.getCurrency();
  sel.addEventListener('change', () => {
    window.storage.setCurrency(sel.value);
    refreshUI();
  });
}

/* ── Search & Filter ─────────────────────────────────────── */
function initSearchFilter() {
  const search = document.getElementById('search-input');
  const cat    = document.getElementById('filter-category');
  const sort   = document.getElementById('sort-select');
  if (search) search.addEventListener('input', refreshUI);
  if (cat)    cat.addEventListener('change', refreshUI);
  if (sort)   sort.addEventListener('change', refreshUI);
}

/* ── CSV Export ──────────────────────────────────────────── */
function initCSVExport() {
  const btn = document.getElementById('export-csv-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const csv = window.storage.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `expenses-${toYMD()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.ui.showToast('📊 Expenses exported to CSV!', 'info');
  });
}

/* ── Monthly Budget Input ────────────────────────────────── */
function initBudgetPanel() {
  // Inject budget input into summary panel header area
  const summaryPanel = document.querySelector('.summary-panel h2');
  if (!summaryPanel) return;

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;';

  const label = document.createElement('label');
  label.htmlFor = 'budget-input';
  label.textContent = '🎯 Monthly Budget:';
  label.style.cssText = 'font-size:0.85rem;color:var(--muted);white-space:nowrap;';

  const input = document.createElement('input');
  input.type = 'number';
  input.id = 'budget-input';
  input.min = '0';
  input.step = '100';
  input.placeholder = 'Set budget...';
  input.style.cssText = 'width:130px;padding:6px 10px;font-size:0.9rem;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);';
  input.value = window.storage.getMonthlyBudget() || '';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn';
  saveBtn.textContent = 'Set';
  saveBtn.style.cssText = 'font-size:0.82rem;padding:6px 12px;';
  saveBtn.addEventListener('click', () => {
    const val = parseFloat(input.value);
    if (!isNaN(val) && val >= 0) {
      window.storage.setMonthlyBudget(val);
      window.ui.showToast(`Budget set to ${window.ui.formatCurrency(val)}`, 'info');
      refreshUI();
    }
  });

  wrap.appendChild(label);
  wrap.appendChild(input);
  wrap.appendChild(saveBtn);
  summaryPanel.parentNode.insertBefore(wrap, summaryPanel.nextSibling);
}

/* ── Keyboard Shortcuts ──────────────────────────────────── */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+/ or ? → focus amount input
    if ((e.ctrlKey && e.key === '/') || (e.key === '?' && !e.ctrlKey && document.activeElement.tagName !== 'INPUT')) {
      const amt = document.getElementById('amount');
      if (amt) { amt.focus(); e.preventDefault(); }
    }
    // Escape → clear search
    if (e.key === 'Escape') {
      const search = document.getElementById('search-input');
      if (search && search === document.activeElement) {
        search.value = '';
        refreshUI();
        search.blur();
      }
    }
  });
}

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (!window.storage || !window.ui) {
    console.error('Required modules missing: storage or ui');
    return;
  }

  // ensure wallet key exists
  if (localStorage.getItem('wallet_balance') == null) {
    window.storage.setWalletBalance(0);
  }

  initForm();
  initWalletControls();
  initCurrencySelector();
  initSearchFilter();
  initCSVExport();
  initBudgetPanel();
  initKeyboardShortcuts();
  refreshUI();
});

/* ts:search-filter-v1 */

/* ts:sort-dropdown-v1 */

/* ts:keyboard-shortcuts-v1 */

/* ts:delete-toast-v1 */

/* ts:wallet-toast-v1 */
