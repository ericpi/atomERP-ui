# atomERP-ui — A Lightweight Modern Frontend ERP UI Template

[English](README.md) | [繁體中文](README_zh.md)

🔗 **[Live Demo / 線上展示](https://ericpi.github.io/atomERP-ui/)**

A clean, premium, and fully offline-capable ERP frontend mockup template designed for **Mockup Inc.** It serves as an interactive flow demonstration and client presentation tool. Built entirely with Vanilla JavaScript, HTML5, and pure CSS, it runs out-of-the-box by simply double-clicking `index.html` in any web browser—no servers, build tools, or database setups required.

---

## 🚀 Key Features

* **Fully Offline-Capable (`file://` compatible):** Employs script-based dynamic data loading to avoid CORS restrictions, allowing the application to load directly from the local file system.
* **Authentication & Route Guard:** Secure solid-background login card container covering the entire viewport. Validates email against any record in the mock database (password `123`, suggested test account: `demo@mockup-erp.org`) and intercepts unauthenticated routing.
* **Componentized Architecture:** Each system module is separated into individual component files (`components/*.js`) that mount dynamically onto a single-page view router.
* **Interactive Header Profile:** Displays current user's name and ID in the top-right header, which opens their personal profile drawer details when clicked. Includes a Logout button.
* **Dual-Language i18n Support:** English by default, with Traditional Chinese activated automatically via URL query parameters (`?lang=zh`) or via the top-bar Language Selector.
* **Interactive Guided Tours:** Centralized guide module (`WorkflowGuide`) demonstrating end-to-end business scenarios with context-aware tooltip bubble prompts:
  * **Flow A:** New Employee Onboarding ➔ Leave Request ➔ Payroll calculation.
  * **Flow B:** Business Trip Request ➔ Expense Claim Form with receipt upload ➔ General Ledger integration.
* **Form Guard (FormGuard):** Form monitoring system that intercepts navigation and page resets to warn users about unsaved input data.
* **Interactive Data Visualization:** Custom, dynamic SVG charts (Trend Lines & Donut charts) that adapt automatically to database sizes.
* **Mock API Simulator:** Simulates real API network latency with animated spinner overlays.

---

## 📂 Project Structure

```bash
├── index.html             # Main single-page application entry point
├── index.css              # Industrial Clean Theme styling and design tokens
├── app.js                 # Central Application Router & State Manager
├── utils.js               # Common utilities (Toast, FormGuard, WorkflowGuide, Drawer)
├── data/
│   ├── locales.js         # Comprehensive translation dictionaries (EN / ZH)
│   ├── hr.js              # HR Database (Employees, Leaves, Trips)
│   ├── finance.js         # Finance Database (Expense claims, Ledger entries)
│   ├── project.js         # Project Management Database (Epics, Sprints, Issues)
│   ├── sales.js           # Sales Database (Reps, targets, monthly trends)
│   └── inventory.js       # Inventory Database (SKU items, stock-in logs)
├── components/
│   ├── hr.js              # HR Component (Roster, Payroll, Leave, Trips, Directory)
│   ├── finance.js         # Finance Component (Claims & General Ledger)
│   ├── project.js         # Project Component (Kanban & Hierarchical tree)
│   ├── sales.js           # Sales Component (Stats report & Dashboard charts)
│   └── inventory.js       # Inventory Component (Stock-in Form & Query table)
└── README.md              # Project documentation (English)
```

---

## ⚙️ Architecture & Technical Reference

### 1. Global Namespace Pattern
To maintain a modular structure without relying on ES Modules (which trigger CORS blockages when loaded via `file://`), the template utilizes a single global object namespace:
```javascript
window.atomERP = {
  getLocale: () => { ... },
  t: (key) => { ... },
  translateDOM: (root) => { ... }
};
```
Views are registered under `window.render*` and called by the central router in `app.js` when the `#hash` changes.

### 2. State & Data Layer
Data is stored under the global `window.globalState` which duplicates `window.MOCK_DATA[locale]` at boot. 
When the user switches the data size using the "Mock API Data" dropdown, the state expands with five times (5x) simulated mock records or resets to initial values.

### 3. Internationalization (i18n) Engine
Static text marked with `data-i18n` in `index.html` is dynamically translated at runtime using:
```javascript
window.atomERP.translateDOM(document.body);
```
Dynamic templates inside `components/*.js` fetch translation tokens directly from `window.atomERP.t('key')` to support hot swapping.

### 4. Interactive Scanner Simulation
The inventory module simulates automated hardware barcode sensing using a camera laser frame overlay, randomly choosing SKU records from the database and automatically populating the form data with a successful scan sound prompt.

### 5. Authentication & Route Guarding
Route guard validation is evaluated inside `app.js`'s `handleRouting()` before rendering elements:
- Checks if the user is authenticated (via a `sessionStorage` lookup fallback to `window.currentUser` memory variables for sandboxed local browser environments).
- Unauthenticated requests trigger the solid-colored `#login-container` view and apply `hidden` classes to prevent flashing or leakages of background system DOM layouts.
- Safely validates credentials against the active database (with general and specific locale fallbacks) and uses Null-safe DOM assertions to prevent bootstrap execution crashes.

---

## 🛠️ Getting Started

### Prerequisites
* Any modern web browser (Chrome, Safari, Edge, Firefox).

### Run Locally
1. Clone this repository.
2. Double-click [index.html](file:///Users/eric/old_backup/work-20220524/antigravity_prac/erp-frontend/index.html) or open it directly in your browser:
   ```bash
   open index.html
   ```

### Switch Language Manually
Add the query parameter `?lang=zh` to the browser URL to test the Traditional Chinese version, or use the **Language Switcher** button in the top-bar.

---

## 📄 License
This project is open-sourced under the MIT License.
