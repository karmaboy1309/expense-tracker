/*
	storage.js
	Functions to persist and retrieve expenses from localStorage.
	Data model per expense:
	{
		id: number (timestamp),
		amount: number,
		category: string,
		note: string,
		date: "YYYY-MM-DD"
	}
*/

const STORAGE_KEY = 'expenses';

const WALLET_KEY = 'wallet_balance';

/** Get all expenses from localStorage (returns array) */
function getExpenses() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const arr = JSON.parse(raw);
		if (Array.isArray(arr)) return arr;
		return [];
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

/** Delete expense by id (number) and persist */
function deleteExpense(id) {
	const expenses = getExpenses();
	const filtered = expenses.filter(e => String(e.id) !== String(id));
	saveExpenses(filtered);
}

/** Wallet helpers: get and set balance (number) */
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
		const n = Number(amount) || 0;
		localStorage.setItem(WALLET_KEY, JSON.stringify(n));
	} catch (e) {
		console.error('Failed to save wallet balance', e);
	}
}

function addWalletFunds(amount) {
	const cur = getWalletBalance();
	setWalletBalance(cur + Number(amount || 0));
}


// expose functions to global scope for simple usage in other scripts
window.storage = {
	getExpenses,
	saveExpense,
	deleteExpense,
	saveExpenses,
	getWalletBalance,
	setWalletBalance,
	addWalletFunds
};
