# Student Finance Tracker

A responsive, single-page web application designed for students to track income, expenses, and monthly budget limits locally with instant search, data validation, and automated unit testing.

## 🚀 Live Demo & Repository
- **VIDEO DEMO:** https://youtu.be/LCGo5KcnM5U
- **GitHub Repository:** [https://github.com/davidlael/student-finance-tracker](https://github.com/davidlael/student-finance-tracker)
  

---

## 👨‍💻 Developer Information
- **Name:** Nziza Lael David
- **Email:** d.nziza1@alustudent.com
- **Institution:** African Leadership University (Cohort 4)

---

## ✨ Key Features
- **Transaction Management:** Full CRUD (Create, Read, Update, Delete) support for income and expense records.
- **Budget Tracking & ARIA Live Regions:** Dynamic visual budget cap alerts utilizing ARIA live announcements to notify users when approaching or exceeding limits.
- **Live Regex Search Engine:** Real-time search filtering with dynamic regular expressions and safe `<mark>` text highlighting.
- **Data Analytics:** Auto-calculating total balance, expenses, income, and dynamic weekly trend visualizations.
- **Data Import & Export:** Export transactions to formatted JSON files or import datasets with schema validation.
- **Multi-Currency Toggle:** Instant currency display options for flexible international budgeting.
- **Local Persistence:** Automatic saving to browser `localStorage` with fallback handling for seamless session restoration.

---

## 🔍 Regular Expression Catalog

| Feature / Purpose | Regular Expression | Description |
| :--- | :--- | :--- |
| **Description Validation** | `/^[a-zA-Z0-9\s\-_',.()]{3,50}$/` | Validates transaction descriptions (3–50 chars, allows basic safe punctuation). |
| **Duplicate Word Check** | `/\b(\w+)\s+\1\b/i` | Advanced back-reference regex detecting accidental repetitive words in inputs (e.g., "Books Books"). |
| **Amount Validation** | `/^\d+(\.\d{1,2})?$/` | Ensures positive monetary amounts up to two decimal places. |
| **Date Validation** | `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` | Matches ISO standard date format (`YYYY-MM-DD`). |
| **Category Validation** | `/^(Tuition\|Housing\|Food\|Transport\|Entertainment\|Utilities\|Income\|Other)$/` | Restricts transaction categories to pre-approved standard values. |

---

## 🛡️ Error Handling Architecture
The application employs a 4-tier defensive error-handling strategy:
1. **Input Validation:** Strict regex rules block invalid entries before they reach the state.
2. **Safe Search Compilation:** Special characters typed in the search bar are safely escaped in a `try...catch` block to prevent runtime crashes.
3. **Schema Validation:** Imported JSON files are verified against structural requirements before being merged into storage.
4. **Storage Fallbacks:** Handled storage quotas (`QuotaExceededError`) and JSON parse failures gracefully.

---

## 🛠️ Project Structure
```text
student-finance-tracker/
├── scripts/
│   ├── app.js
│   ├── search.js
│   ├── state.js
│   ├── storage.js
│   └── validators.js
├── index.html
├── main.css
├── README.md
├── seed.json
└── tests.html
