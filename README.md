# Mini ERP Client (React + Vite)

Frontend for the Mini ERP system. This app handles authentication, role-based navigation, dashboards, and transaction workflows for Sales, Procurement, Production, Accountant, General Manager, and System Admin roles.

## What This Client Does

- Authenticates users and stores JWT + user profile in localStorage
- Enforces role-based route access on the client
- Provides role-specific dashboards and transaction workflows
- Lets officers create transactions (sales/procurement/production)
- Lets accountants approve or reject pending transactions
- Lets managers approve/reject accountant-approved transactions
- Lets managers record credit/debt payments that immediately affect balances
- Shows credit/debt and reports for authorized roles
- Shows multi-file receipt links for each transaction

## Tech Stack

- React (Vite)
- Tailwind CSS
- React Router
- Axios

## Environment

Create `client/.env` (copy from `.env.example`):

```
VITE_API_URL=http://localhost:5000/api
```

## Install and Run

```
npm install
npm run dev
```

App runs at `http://localhost:5173` by default.

## Build

```
npm run build
```

## App Structure

```
src/
  components/
    Layout.jsx          # Shell layout and nav
    ProtectedRoute.jsx  # Route guard + role checks
  contexts/
    AuthContext.jsx     # Login/logout, token storage, role normalization
  lib/
    api.js              # Axios instance + auth interceptors
  pages/
    Login.jsx           # Sign in
    Dashboard.jsx       # Role-based dashboards
    Customers.jsx       # Customers (sales can create; others read-only)
    Suppliers.jsx       # Suppliers (procurement can create; others read-only)
    Transactions.jsx    # Create + approve + record payment
    Reports.jsx         # CSV/JSON report exports
    Users.jsx           # System admin user management
  App.jsx               # Routing
  main.jsx              # Entry
```

## Authentication and Session

- Login uses `POST /api/auth/login` and stores the JWT in localStorage.
- On app load, `GET /api/auth/me` validates the token.
- If the token expires, the app clears storage and redirects to `/login`.

## Role Normalization

The UI normalizes roles for consistency:

- `admin` (DB) is shown and treated as `system_admin`
- roles ending with `_officer` are normalized to the base role (e.g., `sales_officer` ? `sales`)

## Routing and Role Access

- `/dashboard`: all authenticated users
- `/customers`: sales, accountant, general_manager
- `/suppliers`: procurement, accountant, general_manager
- `/transactions`: sales, procurement, production, accountant, general_manager
- `/reports`: accountant, general_manager
- `/users`: system_admin only

## Key Pages and Behavior

### Dashboard
Each role sees a tailored dashboard:

- Sales: sales totals, customer credit, pending approvals
- Procurement: supplier debt, procurement totals, pending approvals
- Production: production expenses
- Accountant: all transactions + credit/debt summary
- General Manager: pending approvals + cross-department summary + credit/debt
- System Admin: user management entry point

### Customers / Suppliers

- Sales can create customers; managers/accountants can view only
- Procurement can create suppliers; managers/accountants can view only

### Transactions

#### Officer creation
- Sales: customer, amount, payment type (paid/credit), description, receipts
- Procurement: supplier, amount, payment type (paid/debt), description, receipts
- Production: amount, description, receipts (payment type is always paid)

#### Accountant approval
- Accountants can approve or reject **pending** transactions
- Approve ? `accountant_approved`
- Reject ? `rejected`

#### Manager approval
- Managers can approve or reject **accountant_approved** transactions
- Approve ? `manager_approved`
- Reject ? `rejected`

#### Manager record payment
- Managers can record a payment directly (customer credit or supplier debt)
- These entries are saved as **manager_approved paid transactions**
- Immediately affects credit/debt balances

#### Receipts (multi-file)
- Users can attach multiple receipt files to a single transaction
- The UI renders multiple links (View 1, View 2, ...)

## API Integration (Client Side)

- All requests are sent via `src/lib/api.js`
- The Authorization header is added automatically
- `FormData` requests do not set `Content-Type` manually (lets the browser set boundary)

## Common Dev Tips

- If you change backend port or base path, update `VITE_API_URL`
- If role permissions change, update `ProtectedRoute` or per-page logic

```
`ProtectedRoute` enforces role access, but server-side permissions remain authoritative.
```

## Known Defaults

- Backend URL: `http://localhost:5000/api`
- Frontend URL: `http://localhost:5173`

## Change Control

This README documents the current behavior of the client. Backend rules are enforced server-side; the UI is aligned to those rules but does not replace them.
