# Ledgerly - Finance Management Dashboard

A full-stack personal finance application built with the MERN stack. Users record income and expenses, set monthly budgets, track savings goals and read their money through charts. Admins get a separate area with platform-wide statistics and user management.

## Features

- **Authentication**: registration, login, logout, JWT sessions, bcrypt password hashing, protected routes, role-based authorization (user / admin)
- **Dashboard**: total income, expenses and balance, this month's income, expenses and savings, recent transactions, expense categories, income-vs-expense chart
- **Transactions**: add, edit, delete and browse income and expenses with category, description, date and amount
- **Search and filters**: text search, income/expense, category, date range and amount range, with sorting and pagination (all done in MongoDB, not in the browser)
- **Categories**: eight built-in categories (Food, Travel, Shopping, Bills, Education, Salary, Business, Other) plus per-user custom categories
- **Budgets**: a monthly total and per-category limits, live usage computed from transactions, remaining amount, warning at 80% and over-budget alerts
- **Savings goals**: target, deadline, current amount, progress percentage, add or withdraw funds, monthly savings
- **Reports**: income vs expense, expense by category, monthly spending, savings trend, budget utilization (Recharts)
- **Admin**: total and active users, transaction totals, income and expenses recorded, user activity log, role changes, deactivation and deletion, system reports
- **Quality**: loading, empty and error states, toast notifications, responsive layout with mobile drawer navigation, keyboard focus styles, reduced-motion support

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router 6, Axios, Tailwind CSS 3, Recharts, lucide-react, react-hot-toast |
| Backend | Node.js 18+, Express 4, Mongoose 8, jsonwebtoken, bcryptjs, express-validator, helmet, cors, express-rate-limit, morgan |
| Database | MongoDB Atlas |
| Hosting | Vercel (client), Render (server), MongoDB Atlas (database) |

`bcryptjs` is the pure-JavaScript implementation of the bcrypt algorithm. It produces standard `$2a$` hashes and avoids native-compilation failures on hosted build servers.

## Architecture

```
Browser (React SPA on Vercel)
   |  HTTPS, JSON, Authorization: Bearer <JWT>
   v
Express API (Render)
   routes -> validators -> controllers -> services -> Mongoose models
   |  middleware: helmet, cors, rate limit, auth (protect/authorize), error handler
   v
MongoDB Atlas
```

Key decisions:

- **Stateless auth.** The API signs a JWT at login; the client sends it on every request. The `protect` middleware re-loads the user on each request so deactivated or deleted accounts lose access immediately, and `authorize('admin')` guards admin routes. Public registration can never set a role.
- **Aggregations in the database.** Dashboard totals, charts, budget usage and admin statistics use MongoDB aggregation pipelines scoped by `user`, so cost does not grow with the amount of data sent to the browser.
- **Ownership scoping.** Every query for user data includes `user: req.user._id`, so one user can never read or modify another user's records.
- **Centralized errors.** Controllers throw `ApiError`; one error handler maps Mongoose validation, cast and duplicate-key errors, JWT errors and database outages to clean JSON responses with the right status code. Stack traces are hidden in production.
- **Dates and months** are handled in UTC (`YYYY-MM` strings and `$dateToString`), so month boundaries are consistent between server and charts.

## Folder structure

```
finance-dashboard/
  client/
    src/
      components/        ui.jsx, charts/, TransactionForm, CategoryManager, ProtectedRoute, Logo
      pages/             Landing, Login, Register, Dashboard, Transactions, AddTransaction,
                         Budgets, Savings, Reports, Profile, NotFound, admin/*
      layouts/           DashboardLayout, AppLayout, AdminLayout
      services/          api.js (axios instance), endpoints.js (one function per API call)
      hooks/             useFetch, useDebounce, useCategories
      context/           AuthContext
      utils/             format.js, constants.js
      App.jsx  main.jsx
    vercel.json  .env.example
  server/
    config/              env.js, db.js, seed.js
    controllers/         auth, users, transactions, categories, budgets, savings, reports
    middleware/          auth.js, validate.js, error.js
    models/              User, Transaction, Category, Budget, SavingsGoal, Activity
    routes/              one router per resource
    services/            reportService.js, budgetService.js
    utils/               ApiError, asyncHandler, token, dates, activity
    scripts/smoke-test.mjs
    app.js  server.js  .env.example
  docs/                  DEPLOYMENT.md, INTERVIEW_QUESTIONS.md
  render.yaml            optional Render Blueprint
```

## Installation

Prerequisites: Node.js 18 or newer, npm, and a MongoDB Atlas cluster (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), steps 2-4, or use a local MongoDB).

```bash
git clone https://github.com/<your-username>/finance-dashboard.git
cd finance-dashboard

# backend
cd server
npm install
cp .env.example .env        # then fill in the values below

# frontend (new terminal)
cd client
npm install
cp .env.example .env
```

## Environment variables

**server/.env**

| Variable | Required | Description |
|---|---|---|
| `PORT` | no | Port to listen on. Default `5000`. Render sets this automatically. |
| `MONGODB_URI` | yes | Atlas connection string including the database name. |
| `JWT_SECRET` | yes | Long random string. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CLIENT_URL` | yes | Allowed frontend origin(s) for CORS, comma-separated, no trailing slash. |
| `JWT_EXPIRES_IN` | no | Token lifetime. Default `7d`. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | no | If set, that account is created (or promoted) as admin on startup. |

**client/.env**

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL including `/api`, e.g. `http://localhost:5000/api` or `https://<service>.onrender.com/api` |

`.env` files are git-ignored. Only `.env.example` is committed.

## Local development

```bash
# terminal 1
cd server && npm run dev        # http://localhost:5000, health: /api/health

# terminal 2
cd client && npm run dev        # http://localhost:5173
```

On first start the server seeds the eight default categories and, if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, creates the admin account. Log in with that account to see the admin area; accounts created through the register page are always regular users.

### Testing

With the server running:

```bash
cd server
npm run smoke                                   # against http://localhost:5000/api
API_URL=https://<service>.onrender.com/api npm run smoke   # against production
```

The smoke test exercises health, registration, login, authorization (401 and 403), validation, category rules, transaction CRUD, search and every filter, budgets, savings goals and all report endpoints, then prints how many checks passed. It creates one throw-away `smoke_<timestamp>@example.com` user; delete it from the admin Users page.

## API documentation

Base URL: `/api`. Responses are `{ success, data, ... }`; errors are `{ success: false, message, details? }`. Protected routes need `Authorization: Bearer <token>`.

### Auth - `/api/auth`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/register` | - | `name, email, password` | Create account. Returns `{ token, user }` |
| POST | `/login` | - | `email, password` | Returns `{ token, user }` |
| POST | `/logout` | user | - | Records the logout event (client discards the token) |
| GET | `/me` | user | - | Current user |

### Users - `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| PATCH | `/me` | user | Update `name`, `currency` |
| PATCH | `/me/password` | user | `currentPassword, newPassword` |
| GET | `/` | admin | List users. Query: `q, role, page, limit` |
| GET | `/:id` | admin | One user with transaction count |
| PATCH | `/:id` | admin | Change `role` or `isActive` |
| DELETE | `/:id` | admin | Delete user and all their data |
| GET | `/activity` | admin | Activity log. Query: `userId, page, limit` |

### Transactions - `/api/transactions`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List. Query: `q, type, category, startDate, endDate, minAmount, maxAmount, sortBy (date/amount/createdAt), order, page, limit`. Returns `data`, `pagination`, and `summary` totals for the filtered set |
| POST | `/` | `type, amount, category, description?, date?` |
| GET | `/:id` | One transaction |
| PUT / PATCH | `/:id` | Update any of the fields above |
| DELETE | `/:id` | Delete |

### Categories - `/api/categories`

| Method | Path | Description |
|---|---|---|
| GET | `/` | Built-in plus your custom categories. Query: `type` |
| POST | `/` | `name, type (income/expense/both)` |
| PATCH | `/:id` | Rename or retype a custom category |
| DELETE | `/:id` | Delete a custom category (409 if in use) |

### Budgets - `/api/budgets`

| Method | Path | Description |
|---|---|---|
| GET | `/` | Your budgets with live `usage`. Query: `month=YYYY-MM` |
| POST | `/` | `month, totalAmount, categoryBudgets: [{ category, amount }]` (one per month) |
| GET | `/:id` | One budget with usage |
| PUT / PATCH | `/:id` | Update `totalAmount` and/or `categoryBudgets` |
| DELETE | `/:id` | Delete |

### Savings - `/api/savings`

| Method | Path | Description |
|---|---|---|
| GET | `/` | Goals with `progress` percentage |
| GET | `/summary` | Total saved, total target, overall progress, this month's savings |
| POST | `/` | `name, targetAmount, currentAmount?, deadline?, notes?` |
| PUT / PATCH | `/:id` | Update goal |
| POST | `/:id/contribute` | `{ amount }` positive to add, negative to withdraw |
| DELETE | `/:id` | Delete |

### Reports - `/api/reports`

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard` | Totals, current month, goals, recent transactions, category breakdown, 6-month series |
| GET | `/income-expense?months=6` | Monthly income, expense, savings |
| GET | `/expense-by-category?month=YYYY-MM` | Expense totals per category |
| GET | `/monthly-spending?months=6` | Spending per month |
| GET | `/savings-trend?months=6` | Monthly and cumulative savings |
| GET | `/budget-utilization?month=YYYY-MM` | Budget vs spent per category (`null` if no budget) |
| GET | `/admin/overview` | Admin: user and transaction statistics, recent activity |
| GET | `/admin/monthly?months=6` | Admin: monthly platform totals, sign-ups, top categories |

Status codes: `400` validation, `401` unauthenticated, `403` forbidden or CORS, `404` not found, `409` conflict, `429` rate limited, `503` database unavailable.

## MongoDB setup

Create an Atlas cluster, a database user and a network access rule, then copy the connection string into `MONGODB_URI`. Collections and indexes are created automatically by Mongoose on first use. Step-by-step instructions are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Deployment

Frontend on Vercel, backend on Render, database on MongoDB Atlas. The full walkthrough, with a list of common errors and fixes, is in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). `client/vercel.json` rewrites all paths to `index.html` so React Router deep links work, and `render.yaml` is an optional Blueprint for the backend.

## Screenshots

Run the app, then save these captures in `docs/screenshots/` and they will render below.

| File | Page |
|---|---|
| `dashboard.png` | Dashboard with charts |
| `transactions.png` | Transactions with filters |
| `budgets.png` | Budget usage with an overspending warning |
| `savings.png` | Savings goals |
| `reports.png` | Reports |
| `admin.png` | Admin overview |

![Dashboard](docs/screenshots/dashboard.png)
![Transactions](docs/screenshots/transactions.png)
![Budgets](docs/screenshots/budgets.png)
![Admin](docs/screenshots/admin.png)

## Future improvements

- Refresh tokens and httpOnly cookie sessions
- Recurring transactions and bill reminders
- CSV import and export
- Receipt uploads
- Automated test suite (Jest and Supertest for the API, Vitest and Testing Library for the client)
- Per-user timezone support for month boundaries
- Email verification and password reset

## License

MIT
