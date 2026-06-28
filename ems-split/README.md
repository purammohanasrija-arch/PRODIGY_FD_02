# EMS Pro — Employee Management System

A full-stack Employee Management System built as part of my **Prodigy InfoTech Web Development internship (Task FD-02)**.

It started as a CRUD app and grew into something I wanted to actually be proud to show off — dark/light themes, animated charts, and a UI that doesn't feel like a default Bootstrap template.

## ✨ Features

- 🔐 **Authentication** — JWT-based admin login & registration
- 👥 **Employee CRUD** — add, edit, delete, and view detailed profiles
- 📸 **Avatar photo upload** — upload a photo per employee (stored as base64); falls back to coloured initials
- 🔍 **Live search & filters** — search by name/ID/email, filter by department, sort by name/salary/date
- 💰 **Salary range slider** — dual-handle range filter on the Employees page
- ☑️ **Bulk select & bulk delete** — check multiple rows, delete or export them in one action
- 📥 **CSV export** — export the full filtered list or just selected employees to a `.csv` file
- 📊 **Interactive dashboard** — animated stat counters, SVG donut chart (department split), animated bar chart (headcount by team)
- 📋 **Activity log** — live audit trail panel on the dashboard; logs every add, edit, delete, and login with relative timestamps
- 🌗 **Light / dark theme toggle** — persisted across sessions via `localStorage`
- ⌨️ **Keyboard shortcuts** — `/` focuses search, `N` opens the add modal, `Esc` closes any modal, `?` shows the shortcut HUD
- 📄 **Pagination** — clean, server-style pagination on the employee list
- 📱 **Fully responsive** — collapsible sidebar, mobile-friendly layout
- 🎨 **Toast notifications & modals** — for every create/update/delete action
- ✅ **Form validation** — inline field-level error messages

## 🛠 Tech Stack

**Frontend:** HTML, CSS (custom, no framework), vanilla JavaScript, SVG charts
**Backend:** Node.js, Express.js
**Database:** MongoDB with Mongoose
**Auth:** JWT + bcrypt password hashing

> **Note:** The frontend also ships with a `localStorage`-backed mock API (see `public/app.js`), so you can explore the full UI — login, CRUD, charts, theming — without ever starting the backend or a database. The Express/Mongo backend (`server.js`) is a drop-in replacement once you're ready to wire it up.

## 🚀 Getting Started

### Option A — Just explore the UI (no setup)
Open `public/index.html` directly in your browser, or serve the `public` folder with any static server:
```bash
cd ems-split/public
npx serve .
```
Log in with the demo credentials: **admin / admin123**

### Option B — Full stack with MongoDB

1. **Install dependencies**
   ```bash
   cd ems-split
   npm install
   ```

2. **Configure environment variables**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/employeeDB
   JWT_SECRET=your_jwt_secret_here
   ```

3. **Start MongoDB** (locally or via MongoDB Atlas)

4. **Run the server**
   ```bash
   npm start
   # or, for auto-reload during development
   npm run dev
   ```

5. Visit `http://localhost:5000`

## 📁 Project Structure

```
ems-split/
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   └── auth.js             # JWT auth middleware
├── models/
│   ├── admin.js
│   └── employee.js
├── public/
│   ├── index.html           # Login / register
│   ├── dashboard.html       # Dashboard with charts
│   ├── employees.html       # Employee list, search, filters
│   ├── app.js                # Shared logic + mock API
│   └── styles.css
├── server.js
└── package.json
```

## 🎯 What I Learned

Building this taught me a lot about structuring a full-stack app cleanly — separating concerns between routes, middleware, and models on the backend, and building a UI that stays maintainable across multiple pages without a frontend framework. The SVG donut/bar charts were built from scratch with plain SVG and CSS transitions rather than a charting library. Implementing the dual-handle salary slider purely in CSS/JS, the bulk-select system with an indeterminate checkbox state, and the base64 avatar upload were all interesting problems to solve without reaching for a library.

The activity log gave me a good excuse to think about audit trails — a pattern that shows up in almost every real production system.

---

Built by Srija as part of the **Prodigy InfoTech** Full-Stack Web Development internship.
