# Mini ERP - Frontend Client

React + Vite + Tailwind CSS frontend for the Mini ERP system.

## Features

- 🔐 Authentication (Login/Register)
- 👥 Customer Management
- 💼 Transaction Workflows (Sales/Production/Procurement)
- 💰 Payment Recording
- 📊 Financial Reports
- 👤 User Management (Admin/Manager)

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/     # Reusable components (Layout, ProtectedRoute)
├── contexts/       # React contexts (AuthContext)
├── lib/            # Utilities (API client)
├── pages/          # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Customers.jsx
│   ├── Transactions.jsx
│   ├── Payments.jsx
│   ├── Reports.jsx
│   └── Users.jsx
├── App.jsx         # Main app component with routing
└── main.jsx        # Entry point
```

## Role-Based Access

- **Sales/Production/Procurement**: Can create transactions and manage customers
- **Accountant**: Can approve transactions and record payments
- **Manager**: Can approve transactions and view reports
- **Admin**: Full access including user management

## API Integration

The frontend communicates with the backend API at `VITE_API_URL`. All API requests include JWT tokens from localStorage for authentication.
