import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Transactions from './pages/Transactions';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Suppliers from './pages/Suppliers';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute allowedRoles={['sales_officer', 'accountant', 'general_manager']}>
            <Layout>
              <Customers />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute allowedRoles={['sales_officer', 'accountant', 'general_manager']}>
            <Layout>
              <Transactions workflow="sales" />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/production"
        element={
          <ProtectedRoute allowedRoles={['production_officer', 'accountant', 'general_manager']}>
            <Layout>
              <Transactions workflow="production" />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/procurement"
        element={
          <ProtectedRoute allowedRoles={['procurement_officer', 'accountant', 'general_manager']}>
            <Layout>
              <Transactions workflow="procurement" />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute allowedRoles={["sales_officer", "procurement_officer"]}>
            <Layout>
              <Payments />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["general_manager"]}>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />      <Route
        path="/suppliers"
        element={
          <ProtectedRoute allowedRoles={["procurement_officer", "general_manager"]}>
            <Layout>
              <Suppliers />
            </Layout>
          </ProtectedRoute>
        }
      />      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
