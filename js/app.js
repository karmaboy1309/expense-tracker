/* app.js
	 App initialization and event listeners.
	 Uses `window.storage` and `window.ui` exposed by other modules.
*/

// Helper: return YYYY-MM-DD for Date or today
function toYMD(d = new Date()) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function refreshUI() {
	const expenses = window.storage.getExpenses();
	const walletBalance = window.storage.getWalletBalance();
	// compute totals
	const todayStr = toYMD();
	const monthPrefix = todayStr.slice(0,7); // YYYY-MM

	let totals = { today: 0, month: 0, overall: 0 };
	expenses.forEach(exp => {
		if (exp.type === 'credit') return;
		const amount = Number(exp.amount) || 0;
		totals.overall += amount;
		if ((exp.date || '').slice(0,10) === todayStr) totals.today += amount;
		if ((exp.date || '').slice(0,7) === monthPrefix) totals.month += amount;
	});

	window.ui.updateSummary(totals);
	// update wallet display
	if (typeof window.ui.updateWalletBalance === 'function') {
		window.ui.updateWalletBalance(walletBalance || 0);
	}
	window.ui.renderExpenses(expenses, (id) => {
		const existing = window.storage.getExpenses();
		const found = existing.find(e => String(e.id) === String(id));
		if (!found) return;

		const isCredit = found.type === 'credit';
		const confirmMsg = isCredit ? 'Delete this income record?' : 'Delete this expense?';
		if (!confirm(confirmMsg)) return;

		const amt = Number(found.amount) || 0;
		const currentBalance = window.storage.getWalletBalance() || 0;
		if (isCredit) {
			window.storage.setWalletBalance(currentBalance - amt);
		} else {
			window.storage.setWalletBalance(currentBalance + amt);
		}
		window.storage.deleteExpense(id);
		refreshUI();
	});
}

function initForm() {
	const form = document.getElementById('expense-form');
	const amountEl = document.getElementById('amount');
	const categoryEl = document.getElementById('category');
	const noteEl = document.getElementById('note');
	const dateEl = document.getElementById('date');

	// default date to today
	dateEl.value = toYMD();

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const amount = parseFloat(amountEl.value);
		const category = categoryEl.value || 'Other';
		const note = noteEl.value.trim();
		const date = dateEl.value || toYMD();

		if (isNaN(amount) || amount <= 0) {
			alert('Please enter a valid amount greater than 0.');
			return;
		}

		const expense = {
			id: Date.now(),
			amount: Number(amount),
			category,
			note,
			date
		};

		window.storage.saveExpense(expense);

		// deduct from wallet balance
		const cur = window.storage.getWalletBalance();
		window.storage.setWalletBalance((cur || 0) - Number(amount));

		// reset some fields
		amountEl.value = '';
		noteEl.value = '';
		dateEl.value = toYMD();

		refreshUI();
	});
}

function initWalletControls() {
	const addForm = document.getElementById('add-funds-form');
	const addInput = document.getElementById('add-amount');
	if (!addForm || !addInput) return;
	addForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const v = parseFloat(addInput.value);
		if (isNaN(v) || v <= 0) {
			alert('Enter an amount greater than 0 to add to wallet.');
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
		refreshUI();
	});
}

// initialize app when DOM ready
document.addEventListener('DOMContentLoaded', () => {
	if (!window.storage || !window.ui) {
		console.error('Required modules missing: storage or ui');
		return;
	}
	initForm();
	initWalletControls();
	// ensure wallet key exists
	if (typeof window.storage.getWalletBalance === 'function') {
		if (localStorage.getItem('wallet_balance') == null) {
			window.storage.setWalletBalance(0);
		}
	}
	refreshUI();
});

