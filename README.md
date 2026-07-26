# Milki ERP Client

Frontend for the Milki ERP system built with React and Vite. The client provides the public welcome page, authentication flow, role-based dashboard, and the UI for core ERP workspaces.

## What This Client Does

- Shows a professional welcome page at `/`
- Keeps the existing sign-in page at `/login`
- Supports dark mode with persistence and system preference fallback
- Authenticates users and stores the JWT and user profile in localStorage
- Routes users to role-based dashboards after login
- Displays transactions, reports, customers, suppliers, production inventory, and user management screens
- Uses role-aware navigation and protected routes

## Tech Stack

- React 19
- Vite
- Tailwind CSS 4
- React Router
- Axios

## Prerequisites

- Node.js 18 or newer
- A running Milki ERP backend API

## Environment Setup

Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Set `VITE_API_URL` to the deployed backend API when building for production.

## Local Development

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default.

## Production Build

```bash
npm run build
```

This generates a static production build in `dist/`.

To preview the production build locally:

```bash
npm run preview
```

## Deployment Notes

- Deploy `dist/` to any static hosting platform or CDN.
- Make sure the backend API is reachable from the deployed client.
- Update `VITE_API_URL` before building if the backend is not running on `http://localhost:5000/api`.
- The client relies on browser localStorage for the JWT, user profile, and theme preference.

## Route Map

- `/` - public welcome / landing page
- `/login` - existing login page
- `/dashboard` - authenticated dashboard
- `/customers` - customers workspace
- `/suppliers` - suppliers workspace
- `/transactions` - transactions workspace
- `/transactions/:id` - transaction detail page
- `/reports` - reports page
- `/production-inventory` - production inventory workspace
- `/users` - system admin user management

## Current UI Structure

```text
src/
  components/
    Layout.jsx          # Main app shell and navigation
    ProtectedRoute.jsx  # Route guard
    ThemeToggle.jsx     # Light/dark mode toggle
  contexts/
    AuthContext.jsx     # Login, logout, token handling
    ThemeContext.jsx    # Theme persistence and toggle state
  lib/
    api.js              # Axios instance
  pages/
    Welcome.jsx         # Public landing page
    Login.jsx           # Existing sign-in page
    Dashboard.jsx       # Role-based dashboard
    Customers.jsx
    Suppliers.jsx
    Transactions.jsx
    TransactionDetail.jsx
    Reports.jsx
    ProductionInventory.jsx
    Users.jsx
  App.jsx               # Router setup
  main.jsx              # App entry point
```

## Authentication Flow

- Unauthenticated users see the welcome page at `/`
- The Login button sends them to `/login`
- Successful login stores the token and user profile in localStorage
- Authenticated users are redirected to `/dashboard`
- Token validation happens on app load through the existing auth context

## Role Normalization

The app normalizes backend role names for consistency:

- `admin` becomes `system_admin`
- `manager` becomes `general_manager`
- roles ending in `_officer` are normalized to the base role

## Dark Mode

- Theme choice is stored in localStorage
- The app uses the user’s system preference on first visit
- A theme toggle is available in the welcome page, login page, and app shell

## Build and Deployment Checklist

- Confirm `VITE_API_URL` points to the correct backend
- Run `npm run build`
- Serve the generated `dist/` folder
- Verify `/` opens the welcome page
- Verify `/login` opens the existing login screen
- Verify authenticated routes still work after login

## Notes for Developers

- Do not change protected-route logic without updating the backend permissions too
- Keep API URLs in `src/lib/api.js` aligned with the deployed backend
- If you change the backend domain or path, rebuild the client with the updated environment file
- The frontend does not replace server-side authorization
