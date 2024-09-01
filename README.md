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

## 🌐 Live Demo

The application is deployed and ready to use at:
👉 **[expense-trackerdarshan.vercel.app](https://expense-trackerdarshan.vercel.app/)**

Since the app runs entirely in your browser, all your data stays private and is stored locally in your browser's local storage.

---

## 📸 Application Walkthrough

Here is a quick glimpse of how the Wallet Expense Tracker works:

### 1. Adding an Expense
You can easily log expenses by entering an amount, selecting a category, adding an optional note (e.g., *Lunch with friends in CAFE*), and choosing the date.
![Adding an Expense](screenshots/1.png)

### 2. Live Dashboard & History Update
As soon as you add expenses (such as the Cafe lunch and a Bus ticket), they appear in the transaction history. The **Wallet Summary** automatically calculates and displays your spending for Today, This Month, and Overall.
![Dashboard and History](screenshots/2.png)

### 3. Adding Funds to Wallet
When you receive money (e.g., from parents, salary, or a friend), you can add funds directly to your wallet using the amount input field.
![Adding Funds](screenshots/3.png)

### 4. Updated Wallet Balance & Transaction Record
The wallet balance instantly reflects the added funds. In addition, an **Income** record is automatically created and logged in your transaction history (e.g., `+$1,000.00`) so you always have a complete record of both income and expenses. Any subsequent expenses will be deducted from this balance, and deleting a credit or expense will adjust your balance accordingly.
![Updated Balance](screenshots/4.png)

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

## New Features (v2.0)

- Dark Mode - Toggle light/dark, persisted to localStorage
- Multi-Currency - Switch between INR, USD, EUR, GBP
- Search and Filter - Instant search by note/category/amount
- CSV Export - Download expenses as CSV with one click
- Monthly Budget - Set limit with colour-coded progress bar
- Sort Options - Sort by newest, oldest, highest, lowest
- PWA / Offline - Installable; works offline via service worker
- Toast Notifications - Non-blocking feedback for every action
- Print Stylesheet - Clean expense report printing
- Keyboard Shortcuts - Ctrl+/ to focus amount, Esc clears search
- Weekly Summary - New 'This Week' stat alongside today/month/overall
- Health and Entertainment - Two new expense categories with emoji icons
