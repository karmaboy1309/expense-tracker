# Wallet Expense Tracker

A modern, responsive, privacy-first local expense tracker and wallet manager built with pure HTML5, CSS3, and Vanilla JavaScript. 

All your transaction details stay completely on your device, persisted using your browser's local storage.

---

## 🚀 Features

- 💼 **Wallet Management**: Initialize a wallet balance, add funds, and automatically deduct from or refund to your balance when adding or deleting expenses.
- 📝 **Detailed Expense Logging**: Record transactions with an amount, category (Food, Travel, Bills, Shopping, Other), optional notes, and custom dates (defaults to today).
- 📊 **Dynamic Dashboard**: Instantly view your current Wallet Balance along with total expenses compiled for **Today**, **This Month**, and **Overall**.
- 📋 **Interactive Transaction History**: Displays all logged expenses with the latest transactions on top, category tags, notes, and an easy delete option.
- 📱 **Fully Responsive Design**: Optimized layout for both desktop and mobile screens.
- 🔒 **Privacy-First**: No backend, no accounts, and no tracking. All data is stored locally using `localStorage`.

---

## 📂 Project Structure

- [`index.html`](index.html) - The layout structure, form inputs, dashboard cards, and wallet control panel.
- [`css/style.css`](css/style.css) - Responsive style definitions, theme variables, and visual design layout.
- [`js/app.js`](js/app.js) - App initialization, form submissions, and DOM event listeners.
- [`js/storage.js`](js/storage.js) - LocalStorage wrapper handling persistence for expense lists and wallet balances.
- [`js/ui.js`](js/ui.js) - Rendering utilities for updating totals, wallet balances, and building the dynamic transaction lists.

---

## 🛠️ Getting Started

Since the project uses vanilla web technologies and has zero dependencies, you can run it instantly:

### Method 1: Open Directly
Double-click `index.html` (or right-click and select **Open with Browser**) to run the app directly from your local filesystem.

### Method 2: Serve Locally (Recommended)
If you prefer running it on a local development server, run one of the following commands in the project directory:

```bash
# Using Python
python -m http.server 8000

# Using Node (if installed)
npx serve .
```
Then navigate to `http://localhost:8000` (or the port specified) in your browser.

---

## 💾 Data Model

Expenses are saved in `localStorage` under the key `'expenses'` as an array of objects structured as follows:

```json
{
  "id": 1686255833000,
  "amount": 25.50,
  "category": "Food",
  "note": "Lunch with team",
  "date": "2026-06-08"
}
```

Wallet balance is persisted separately under the key `'wallet_balance'`.
