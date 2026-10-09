# Ledgerly — MERN Expense Tracker

A full-stack personal finance app: track income and expenses, set category budgets, explore analytics, and export reports. React + Tailwind on the front, Express + MongoDB on the back, JWT auth throughout.

## Features

- **Auth** — register, login, logout, current user, protected routes, bcrypt-hashed passwords, JWT
- **Transactions** — add / view / edit / delete; backend search, filters (type, category, payment method, date range), sorting and pagination
- **Budgets** — per-category budgets (weekly / monthly / yearly / custom) with spent, remaining and % used; warning at 80%, exceeded at 100%; never blocks a transaction
- **Dashboard** — balance, income, expenses, savings with change vs. last month; category donut; recent transactions; budget overview
- **Analytics** — income vs expense bars, expense-by-category donut, spending trend; This Month / Last Month / Last 6 Months / This Year / Custom
- **Reports** — summary for any date range + CSV export
- **Settings** — profile (name, email, avatar), currency, date format, light/dark theme (persisted)
- **Responsive** — sidebar on desktop; top bar + drawer + bottom navigation on phones/tablets; transactions become cards on small screens

## Tech stack

| Frontend | Backend |
|---|---|
| React 18, Vite, React Router 6 | Node.js, Express 4 |
| Tailwind CSS 3 | MongoDB + Mongoose 8 |
| Axios | JWT (`jsonwebtoken`), `bcrypt` |
| Recharts | `zod` validation, Helmet, CORS, `express-rate-limit` |

The only extra frontend dependency is `lucide-react` (icons). No Next.js, Firebase, Supabase or SQL databases.

## Folder structure

```
expense-tracker/
├── backend/
│   └── src/
│       ├── config/        env + DB connection
│       ├── models/        User, Transaction, Budget
│       ├── validators/    zod schemas (the single source of input rules)
│       ├── middleware/    auth, validate, error handler, rate limiting
│       ├── routes/        URL → controller wiring only
│       ├── controllers/   HTTP in/out, no business logic
│       ├── services/      business logic + aggregations
│       ├── utils/         money, dates, csv, errors
│       ├── seed/          dev-only demo data
│       ├── app.js         Express app
│       └── server.js      entry point
└── frontend/
    └── src/
        ├── components/    ui/ primitives, charts/, feature components
        ├── pages/         one file per route
        ├── layouts/       AppLayout (sidebar/mobile nav), AuthLayout
        ├── services/      axios instance + one service per API area
        ├── store/         Auth, Preferences (theme/date), Toast, AppData contexts
        ├── hooks/         useFetch, useDebounce, useFormat
        ├── utils/  constants/
        ├── App.jsx  main.jsx
```

## Environment variables

**backend/.env** (copy `backend/.env.example`)

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | e.g. `mongodb://127.0.0.1:27017/expense-tracker` or an Atlas URI |
| `JWT_SECRET` | long random string (**required**; 32+ chars enforced in production) |
| `JWT_EXPIRES_IN` | token lifetime, default `7d` |
| `CLIENT_URL` | allowed browser origin(s), comma-separated |

**frontend/.env** (copy `frontend/.env.example`)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base URL, e.g. `http://localhost:5000/api` |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## MongoDB setup

Either:
- **Local**: install MongoDB Community, start `mongod`, and use `mongodb://127.0.0.1:27017/expense-tracker`; or
- **Docker**: `docker run -d --name mongo -p 27017:27017 mongo:7`; or
- **Atlas**: create a free cluster, allow your IP, and paste the connection string into `MONGODB_URI`.

Collections and indexes are created automatically on first run.

## Installation & running

Requires Node.js 18+.

```bash
# Backend
cd backend
cp .env.example .env        # then edit JWT_SECRET / MONGODB_URI
npm install
npm run dev                 # http://localhost:5000/api  (npm start for plain node)

# Frontend (second terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

### Optional demo data (development only)

```bash
cd backend && npm run seed
```
Creates `demo@expensetracker.dev` / `Demo@12345` with ~6 months of transactions and 4 current budgets. It only touches that one user and **refuses to run when `NODE_ENV=production`**.

## API overview

All routes are under `/api`. Everything except register/login/health requires `Authorization: Bearer <token>`.

| Method | Route | Notes |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | rate-limited (20 / 15 min / IP) |
| POST | `/auth/logout` | stateless; client discards token |
| GET / PATCH | `/auth/me` | current user / update profile & currency |
| GET | `/transactions` | `page, limit, search, type, category, paymentMethod, startDate, endDate, sort=newest\|oldest\|highest\|lowest` → `{ transactions, page, limit, total, totalPages }` |
| GET / POST | `/transactions`, `/transactions/:id` | |
| PATCH / DELETE | `/transactions/:id` | |
| GET / POST | `/budgets` | list includes `spent, remaining, percentage, status`; `?active=true` |
| PATCH / DELETE | `/budgets/:id` | |
| GET | `/analytics/summary` | totals, savings rate, change vs previous period |
| GET | `/analytics/monthly` | income/expense buckets (daily ≤ 62 days, else monthly) |
| GET | `/analytics/categories` | breakdown with percentages |
| GET | `/reports/summary` | `startDate`, `endDate` required |
| GET | `/reports/export` | streams CSV |

Analytics accept `range=this_month\|last_month\|last_6_months\|this_year\|custom` (+ `startDate`/`endDate` for custom). Errors are `{ message, details?: [{ field, message }] }`.

## Design decisions worth knowing

- **Money** is stored as integer minor units (paisa/cents) and converted at the API edge; the API accepts/returns normal decimals with ≤ 2 places. Sums happen in MongoDB on integers, so there's no floating-point drift.
- **Balance vs savings**: `Balance = all-time income − expenses`. `Savings = income − expenses` for the *selected period* (this month on the dashboard). Same formula, different scope.
- **Tenant isolation**: the user always comes from the verified JWT, never the request body. Every query includes `user`; foreign or malformed IDs return 404/400. Unknown body fields (e.g. `user`) are stripped by validation.
- **Dates** are calendar days stored at UTC midnight and displayed in UTC, so a transaction never shifts a day with the viewer's timezone. "This month" boundaries are UTC.
- **Token storage**: the JWT lives in `localStorage` (simple, works cross-origin). For stricter XSS protection, switch to an httpOnly cookie + CSRF protection.
- **Currency setting** changes display only; existing amounts are not converted.
- **CSV export** neutralises spreadsheet formula injection (`=`, `+`, `-`, `@` prefixes) and includes a UTF-8 BOM for Excel.

## Production build

```bash
# Frontend → static files in frontend/dist (serve with Nginx, Netlify, Vercel static, S3…)
cd frontend && VITE_API_URL=https://api.yourdomain.com/api npm run build

# Backend
cd backend
NODE_ENV=production MONGODB_URI=... JWT_SECRET=<48+ random chars> CLIENT_URL=https://yourdomain.com npm start
```
Run the API behind HTTPS and a reverse proxy (the app sets `trust proxy` in production for correct rate-limit IPs). Serve the SPA with a fallback to `index.html` for client-side routes.

## Sanity checks

`cd backend && npm run test:utils` runs dependency-free checks on the money, date-range and CSV helpers.
