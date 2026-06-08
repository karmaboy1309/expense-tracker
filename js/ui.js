/* ui.js
	 Functions to render expenses and update wallet summary in the DOM.
	 Exposes: renderExpenses(expenses, onDelete)
						updateSummary(totals)
*/

/** format number as currency string (USD style) */
function formatCurrency(amount) {
	const n = Number(amount) || 0;
	if (n < 0) {
		return `-$${Math.abs(n).toFixed(2)}`;
	}
	return `$${n.toFixed(2)}`;
}

/** format YYYY-MM-DD to user-friendly string (YYYY-MM-DD kept simple) */
function formatDateYMD(ymd) {
	return ymd; // keep ISO date for simplicity; can be localized if needed
}

/** Render list of expenses into #expenses-list. onDelete receives id */
function renderExpenses(expenses, onDelete) {
	const list = document.getElementById('expenses-list');
	const emptyNote = document.getElementById('empty-note');
	list.innerHTML = '';

	if (!expenses || expenses.length === 0) {
		emptyNote.style.display = 'block';
		return;
	}

	emptyNote.style.display = 'none';

	// ensure latest on top (sort by id desc)
	const sorted = expenses.slice().sort((a,b)=>Number(b.id)-Number(a.id));

	sorted.forEach(exp => {
		const li = document.createElement('li');
		li.className = 'expense-item';
		if (exp.type === 'credit') {
			li.classList.add('credit');
		}

		const left = document.createElement('div');
		left.className = 'expense-left';

		const badge = document.createElement('div');
		badge.className = 'category-badge';
		badge.textContent = exp.category || 'Other';

		const info = document.createElement('div');
		info.className = 'meta';

		const note = document.createElement('div');
		note.className = 'note';
		note.textContent = exp.note || '';

		const date = document.createElement('div');
		date.className = 'meta muted';
		date.textContent = formatDateYMD(exp.date || '');

		info.appendChild(note);
		info.appendChild(date);

		left.appendChild(badge);
		left.appendChild(info);

		const right = document.createElement('div');
		right.className = 'expense-right';
		right.style.textAlign = 'right';

		const amount = document.createElement('div');
		amount.className = 'amount';
		if (exp.type === 'credit') {
			amount.textContent = `+${formatCurrency(exp.amount)}`;
		} else {
			amount.textContent = formatCurrency(exp.amount);
		}

		const del = document.createElement('button');
		del.className = 'delete-btn';
		del.textContent = 'Delete';
		del.setAttribute('data-id', exp.id);
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

/** Update summary values in DOM. totals: {today, month, overall} */
function updateSummary(totals) {
	document.getElementById('today-total').textContent = formatCurrency(totals.today || 0);
	document.getElementById('month-total').textContent = formatCurrency(totals.month || 0);
	document.getElementById('overall-total').textContent = formatCurrency(totals.overall || 0);
}

// Export to global for app.js to use
window.ui = {
	renderExpenses,
	updateSummary,
	formatCurrency
};

/** Update wallet balance display */
function updateWalletBalance(amount) {
	const el = document.getElementById('wallet-balance');
	if (!el) return;
	el.textContent = formatCurrency(amount || 0);
}

window.ui.updateWalletBalance = updateWalletBalance;

