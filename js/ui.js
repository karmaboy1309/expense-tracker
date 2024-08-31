/* ui.js
   Functions to render expenses and update the summary in the DOM.
   Exposes: renderExpenses(expenses, onDelete), updateSummary(totals),
            formatCurrency(amount), updateWalletBalance(amount),
            showToast(message, type)
*/

/* ── Currency symbol map ─────────────────────────────────── */
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

/** Format number as currency string using active currency */
function formatCurrency(amount) {
  const code = (window.storage && window.storage.getCurrency)
    ? window.storage.getCurrency()
    : 'INR';
  const symbol = CURRENCY_SYMBOLS[code] || code;
  const n = Number(amount) || 0;
  return n < 0
    ? `-${symbol}${Math.abs(n).toFixed(2)}`
    : `${symbol}${n.toFixed(2)}`;
}

/* ── Category icon map ───────────────────────────────────── */
const CATEGORY_ICONS = {
  Food: '🍔',
  Travel: '✈️',
  Bills: '🧾',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Health: '💊',
  Income: '💵',
  Other: '📦'
};

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || '📦';
}

/* ── Toast notifications ─────────────────────────────────── */
let toastTimer = null;

function showToast(message, type = 'success') {
  let toast = document.getElementById('et-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'et-toast';
    toast.style.cssText = [
      'position:fixed', 'bottom:20px', 'right:20px', 'z-index:9999',
      'padding:12px 18px', 'border-radius:10px', 'font-size:0.9rem',
      'font-weight:600', 'color:#fff', 'box-shadow:0 4px 12px rgba(0,0,0,0.2)',
      'transition:opacity 0.3s,transform 0.3s', 'opacity:0',
      'transform:translateY(10px)', 'pointer-events:none'
    ].join(';');
    document.body.appendChild(toast);
  }

  const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
  toast.style.background = colors[type] || colors.info;
  toast.textContent = message;

  // animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 3000);
}

/* ── Date formatter ──────────────────────────────────────── */
function formatDateDisplay(ymd) {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-').map(Number);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${months[m - 1]} ${y}`;
}

/* ── Render expense list ─────────────────────────────────── */
function renderExpenses(expenses, onDelete) {
  const list     = document.getElementById('expenses-list');
  const emptyNote = document.getElementById('empty-note');
  list.innerHTML = '';

  if (!expenses || expenses.length === 0) {
    emptyNote.style.display = 'block';
    _updateFooterCount(0);
    return;
  }

  emptyNote.style.display = 'none';
  _updateFooterCount(expenses.length);

  expenses.forEach(exp => {
    const li = document.createElement('li');
    li.className = 'expense-item';
    if (exp.type === 'credit') li.classList.add('credit');

    const left = document.createElement('div');
    left.className = 'expense-left';

    const badge = document.createElement('div');
    badge.className = 'category-badge';
    badge.textContent = `${getCategoryIcon(exp.category)} ${exp.category || 'Other'}`;

    const info = document.createElement('div');

    const noteEl = document.createElement('div');
    noteEl.className = 'note';
    noteEl.textContent = exp.note || '';

    const dateEl = document.createElement('div');
    dateEl.className = 'meta muted';
    dateEl.textContent = formatDateDisplay(exp.date || '');

    info.appendChild(noteEl);
    info.appendChild(dateEl);
    left.appendChild(badge);
    left.appendChild(info);

    const right = document.createElement('div');
    right.className = 'expense-right';

    const amount = document.createElement('div');
    amount.className = 'amount';
    amount.textContent = exp.type === 'credit'
      ? `+${formatCurrency(exp.amount)}`
      : formatCurrency(exp.amount);
    if (exp.type === 'credit') amount.style.color = 'var(--success)';

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '🗑️ Delete';
    del.setAttribute('data-id', exp.id);
    del.setAttribute('aria-label', `Delete expense ${exp.note || exp.category}`);
    del.addEventListener('click', () => {
      if (typeof onDelete === 'function') onDelete(exp.id);
    });

    right.appendChild(amount);
    right.appendChild(del);
    li.appendChild(left);
    li.appendChild(right);
    list.appendChild(li);
  });
}

/* ── Update summary values ───────────────────────────────── */
function updateSummary(totals) {
  const ids = ['today-total', 'week-total', 'month-total', 'overall-total'];
  const keys = ['today', 'week', 'month', 'overall'];
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.textContent = formatCurrency(totals[keys[i]] || 0);
  });
}

/* ── Update wallet balance display ───────────────────────── */
function updateWalletBalance(amount) {
  const el = document.getElementById('wallet-balance');
  if (!el) return;
  el.textContent = formatCurrency(amount || 0);
  el.style.color = amount < 0 ? 'var(--danger)' : '';
}

/* ── Budget progress bar ─────────────────────────────────── */
function renderBudgetBar(spent, budget) {
  let bar = document.getElementById('budget-bar-wrap');
  if (!budget || budget <= 0) {
    if (bar) bar.style.display = 'none';
    return;
  }

  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'budget-bar-wrap';
    bar.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-size:0.82rem;color:var(--muted);margin-bottom:4px;">
        <span>Monthly Budget Used</span>
        <span id="budget-bar-label"></span>
      </div>
      <div style="background:var(--border);border-radius:6px;height:8px;overflow:hidden;">
        <div id="budget-bar-fill" style="height:100%;border-radius:6px;transition:width 0.4s ease;background:var(--success);"></div>
      </div>`;
    bar.style.marginBottom = '12px';
    const sumPanel = document.querySelector('.summary-panel');
    if (sumPanel) {
      const grid = sumPanel.querySelector('.summary-grid');
      if (grid) sumPanel.insertBefore(bar, grid);
    }
  }

  bar.style.display = 'block';
  const pct = Math.min((spent / budget) * 100, 100);
  const fill = document.getElementById('budget-bar-fill');
  const label = document.getElementById('budget-bar-label');
  if (fill) {
    fill.style.width = `${pct}%`;
    fill.style.background = pct >= 90 ? 'var(--danger)' : pct >= 70 ? '#f59e0b' : 'var(--success)';
  }
  if (label) label.textContent = `${formatCurrency(spent)} / ${formatCurrency(budget)} (${pct.toFixed(0)}%)`;
}

/* ── Footer count helper ─────────────────────────────────── */
function _updateFooterCount(n) {
  const el = document.getElementById('footer-count');
  if (el) el.textContent = `${n} record${n !== 1 ? 's' : ''}`;
}

/* ── Expose ──────────────────────────────────────────────── */
window.ui = {
  renderExpenses,
  updateSummary,
  updateWalletBalance,
  formatCurrency,
  showToast,
  renderBudgetBar,
  formatDateDisplay
};

/* ts:category-icons-v1 */

/* ts:toast-notifications-v1 */

/* ts:wallet-balance-color-v1 */
