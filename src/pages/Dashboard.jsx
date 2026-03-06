import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    customers: 0,
    suppliers: 0,
    pendingSales: 0,
    pendingProcurement: 0,
    pendingProduction: 0,
    totalCustomerCredit: 0,
    totalSupplierDebt: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const role = user?.role;

        const canViewCustomers = ['sales_officer', 'accountant', 'general_manager'].includes(role);
        const canViewSuppliers = ['procurement_officer', 'accountant', 'general_manager'].includes(role);
        const canViewSalesAll = ['accountant', 'general_manager'].includes(role);
        const canViewProcAll = ['accountant', 'general_manager'].includes(role);
        const canViewProdAll = ['accountant', 'general_manager'].includes(role);

        const [
          customersRes,
          suppliersRes,
          salesRes,
          procurementRes,
          productionRes,
          summaryRes,
        ] = await Promise.all([
          canViewCustomers ? api.get('/customers') : Promise.resolve({ data: [] }),
          canViewSuppliers ? api.get('/suppliers') : Promise.resolve({ data: [] }),
          canViewSalesAll
            ? api.get('/sales', { params: { status: 'pending' } })
            : role === 'sales_officer'
              ? api.get('/sales/mine', { params: { status: 'pending' } })
              : Promise.resolve({ data: [] }),
          canViewProcAll
            ? api.get('/procurement', { params: { status: 'pending' } })
            : role === 'procurement_officer'
              ? api.get('/procurement/mine', { params: { status: 'pending' } })
              : Promise.resolve({ data: [] }),
          canViewProdAll
            ? api.get('/production', { params: { status: 'pending' } })
            : role === 'production_officer'
              ? api.get('/production/mine', { params: { status: 'pending' } })
              : Promise.resolve({ data: [] }),
          ['accountant', 'general_manager'].includes(role)
            ? api.get('/reports/summary')
            : Promise.resolve({ data: { total_customer_credit: 0, total_supplier_debt: 0 } }),
        ]);

        setStats({
          customers: customersRes.data.length,
          suppliers: suppliersRes.data.length,
          pendingSales: salesRes.data.length,
          pendingProcurement: procurementRes.data.length,
          pendingProduction: productionRes.data.length,
          totalCustomerCredit: Number(summaryRes.data.total_customer_credit || 0),
          totalSupplierDebt: Number(summaryRes.data.total_supplier_debt || 0),
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // determine links per role
  let links = [];
  switch (user?.role) {
    case 'admin':
      links = [
        { label: 'Manage Users', to: '/users' },
        { label: 'System Settings', to: '#' },
        { label: 'Backups', to: '#' },
        { label: 'Monitor Logs', to: '#' },
      ];
      break;
    case 'general_manager':
      links = [
        { label: 'View Transactions', to: '/sales' },
        { label: 'Review Transactions', to: '/sales' },
        { label: 'Credit & Debt Overview', to: '/reports' },
        { label: 'Customers', to: '/customers' },
        { label: 'Suppliers', to: '/suppliers' },
        { label: 'Reports (CSV)', to: '/reports' },
      ];
      break;
    case 'accountant':
      links = [
        { label: 'View Transactions', to: '/sales' },
        { label: 'Review Transactions', to: '/sales' },
        { label: 'Credit & Debt Overview', to: '/reports' },
      ];
      break;
    case 'sales_officer':
      links = [
        { label: 'My Transactions', to: '/sales' },
        { label: 'Customers', to: '/customers' },
        { label: 'Customer Credit', to: '/customers' },
        { label: 'New Transaction', to: '/sales' },
      ];
      break;
    case 'procurement_officer':
      links = [
        { label: 'My Transactions', to: '/procurement' },
        { label: 'Suppliers', to: '/suppliers' },
        { label: 'Supplier Debt', to: '/suppliers' },
        { label: 'New Transaction', to: '/procurement' },
      ];
      break;
    case 'production_officer':
      links = [
        { label: 'My Transactions', to: '/production' },
        { label: 'New Production Expense', to: '/production' },
      ];
      break;
    default:
      links = [];
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      {links.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => {
                if (l.to !== '#') window.location.href = l.to;
              }}
              className="bg-white p-4 rounded-lg shadow hover:bg-gray-50 text-left"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
      {/* show stats only for roles other than admin */}
      {user?.role !== 'admin' && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* same stat cards as before */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.customers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Sales</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingSales}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Procurement</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingProcurement}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Production</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingProduction}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm text-gray-500">Total Customer Credit</div>
                <div className="text-2xl font-semibold text-gray-900">
                  ${stats.totalCustomerCredit.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm text-gray-500">Total Supplier Debt</div>
                <div className="text-2xl font-semibold text-gray-900">
                  ${stats.totalSupplierDebt.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome, {user?.full_name}!</h2>
          <p className="text-gray-600">
            You are logged in as <span className="font-medium">{user?.role}</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
