import { useEffect, useState } from 'react';
import { useAuth, normalizeRole } from '../contexts/AuthContext';
import api from '../lib/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    customers: 0,
    suppliers: 0,
    pendingTransactions: 0,
    totalCustomerCredit: 0,
    totalSupplierDebt: 0,
    totalTransactions: 0,
    salesTransactions: 0,
    procurementTransactions: 0,
    productionTransactions: 0,
    totalSalesRevenue: 0,
    totalProductionExpenses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const role = normalizeRole(user?.role);

        // Role-based data fetching
        let statsData = {
          customers: 0,
          suppliers: 0,
          pendingTransactions: 0,
          totalCustomerCredit: 0,
          totalSupplierDebt: 0,
          totalTransactions: 0,
          salesTransactions: 0,
          procurementTransactions: 0,
          productionTransactions: 0,
          totalSalesRevenue: 0,
          totalProductionExpenses: 0,
        };

        if (role === 'sales') {
          const [customersRes, transactionsRes] = await Promise.all([
            api.get('/customers'),
            api.get('/transactions', { params: { source_department: 'sales' } }),
          ]);

          const salesTransactions = transactionsRes.data.filter(tx => tx.type === 'sale');
          const approvedSales = salesTransactions.filter(tx => tx.status === 'manager_approved');

          const totalCredit = approvedSales
            .filter(tx => tx.payment_type === 'credit')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);
          const totalPaid = approvedSales
            .filter(tx => tx.payment_type === 'paid')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);

          statsData.customers = customersRes.data.length;
          statsData.salesTransactions = salesTransactions.length;
          statsData.pendingTransactions = salesTransactions.filter(tx => tx.status === 'pending').length;
          statsData.totalSalesRevenue = approvedSales.reduce((sum, tx) => sum + Number(tx.amount), 0);
          statsData.totalCustomerCredit = totalCredit === 0 ? 0 : totalCredit - totalPaid;

        } else if (role === 'procurement') {
          const [suppliersRes, transactionsRes] = await Promise.all([
            api.get('/suppliers'),
            api.get('/transactions', { params: { source_department: 'procurement' } }),
          ]);

          const procurementTransactions = transactionsRes.data.filter(tx => tx.type === 'procurement');
          const approvedProcurement = procurementTransactions.filter(tx => tx.status === 'manager_approved');

          const totalDebt = approvedProcurement
            .filter(tx => tx.payment_type === 'debt')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);
          const totalPaid = approvedProcurement
            .filter(tx => tx.payment_type === 'paid')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);

          statsData.suppliers = suppliersRes.data.length;
          statsData.procurementTransactions = procurementTransactions.length;
          statsData.pendingTransactions = procurementTransactions.filter(tx => tx.status === 'pending').length;
          statsData.totalSupplierDebt = totalDebt === 0 ? 0 : totalDebt - totalPaid;

        } else if (role === 'production') {
          const transactionsRes = await api.get('/transactions', { params: { source_department: 'production' } });
          const productionTransactions = transactionsRes.data.filter(tx => tx.type === 'production');
          const approvedProduction = productionTransactions.filter(tx => tx.status === 'manager_approved');

          statsData.productionTransactions = productionTransactions.length;
          statsData.pendingTransactions = productionTransactions.filter(tx => tx.status === 'pending').length;
          statsData.totalProductionExpenses = approvedProduction.reduce((sum, tx) => sum + Number(tx.amount), 0);

        } else if (role === 'accountant') {
          const transactionsRes = await api.get('/transactions');
          const approvedTransactions = transactionsRes.data.filter(tx => tx.status === 'manager_approved');

          const totalCredit = approvedTransactions
            .filter(tx => tx.type === 'sale' && tx.payment_type === 'credit')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);
          const totalPaidSales = approvedTransactions
            .filter(tx => tx.type === 'sale' && tx.payment_type === 'paid')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);

          const totalDebt = approvedTransactions
            .filter(tx => tx.type === 'procurement' && tx.payment_type === 'debt')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);
          const totalPaidProc = approvedTransactions
            .filter(tx => tx.type === 'procurement' && tx.payment_type === 'paid')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);

          statsData.totalTransactions = transactionsRes.data.length;
          statsData.pendingTransactions = transactionsRes.data.filter(tx => tx.status === 'pending').length;
          statsData.totalCustomerCredit = totalCredit === 0 ? 0 : totalCredit - totalPaidSales;
          statsData.totalSupplierDebt = totalDebt === 0 ? 0 : totalDebt - totalPaidProc;

        } else if (role === 'general_manager') {
          const transactionsRes = await api.get('/transactions');
          const approvedTransactions = transactionsRes.data.filter(tx => tx.status === 'manager_approved');

          const totalCredit = approvedTransactions
            .filter(tx => tx.type === 'sale' && tx.payment_type === 'credit')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);
          const totalPaidSales = approvedTransactions
            .filter(tx => tx.type === 'sale' && tx.payment_type === 'paid')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);

          const totalDebt = approvedTransactions
            .filter(tx => tx.type === 'procurement' && tx.payment_type === 'debt')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);
          const totalPaidProc = approvedTransactions
            .filter(tx => tx.type === 'procurement' && tx.payment_type === 'paid')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);

          statsData.pendingTransactions = transactionsRes.data.filter(tx => tx.status === 'pending').length;
          statsData.salesTransactions = transactionsRes.data.filter(tx => tx.type === 'sale').length;
          statsData.procurementTransactions = transactionsRes.data.filter(tx => tx.type === 'procurement').length;
          statsData.productionTransactions = transactionsRes.data.filter(tx => tx.type === 'production').length;
          statsData.totalCustomerCredit = totalCredit === 0 ? 0 : totalCredit - totalPaidSales;
          statsData.totalSupplierDebt = totalDebt === 0 ? 0 : totalDebt - totalPaidProc;
        }

        setStats(statsData);
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

  // Role-based links and content
  const getDashboardContent = () => {
    const role = normalizeRole(user?.role);
    switch (role) {
      case 'sales':
        return {
          title: 'Sales Dashboard',
          links: [
            { label: 'View Transactions', to: '/transactions' },
            { label: 'Manage Customers', to: '/customers' },
            { label: 'New Sale', to: '/transactions' },
          ],
          stats: [
            { label: 'Total Customers', value: stats.customers, icon: 'users' },
            { label: 'Sales Transactions', value: stats.salesTransactions, icon: 'shopping-cart' },
            { label: 'Pending Approvals', value: stats.pendingTransactions, icon: 'clock' },
            { label: 'Customer Credit', value: `$${stats.totalCustomerCredit.toLocaleString()}`, icon: 'credit-card' },
            { label: 'Sales Total', value: `$${stats.totalSalesRevenue.toLocaleString()}`, icon: 'dollar-sign' },
          ],
        };

      case 'procurement':
        return {
          title: 'Procurement Dashboard',
          links: [
            { label: 'View Transactions', to: '/transactions' },
            { label: 'Manage Suppliers', to: '/suppliers' },
            { label: 'New Procurement', to: '/transactions' },
          ],
          stats: [
            { label: 'Total Suppliers', value: stats.suppliers, icon: 'truck' },
            { label: 'Procurement Transactions', value: stats.procurementTransactions, icon: 'package' },
            { label: 'Pending Approvals', value: stats.pendingTransactions, icon: 'clock' },
            { label: 'Supplier Debt', value: `$${stats.totalSupplierDebt.toLocaleString()}`, icon: 'dollar-sign' },
          ],
        };

      case 'production':
        return {
          title: 'Production Dashboard',
          links: [
            { label: 'View Transactions', to: '/transactions' },
            { label: 'New Production Expense', to: '/transactions' },
          ],
          stats: [
            { label: 'Production Transactions', value: stats.productionTransactions, icon: 'cog' },
            { label: 'Pending Approvals', value: stats.pendingTransactions, icon: 'clock' },
            { label: 'Production Expenses', value: `$${stats.totalProductionExpenses.toLocaleString()}`, icon: 'dollar-sign' },
          ],
        };

      case 'accountant':
        return {
          title: 'Accounting Dashboard',
          links: [
            { label: 'View All Transactions', to: '/transactions' },
            { label: 'Financial Reports', to: '/reports' },
          ],
          stats: [
            { label: 'Total Transactions', value: stats.totalTransactions, icon: 'package' },
            { label: 'Pending Transactions', value: stats.pendingTransactions, icon: 'clock' },
            { label: 'Customer Credit', value: `$${stats.totalCustomerCredit.toLocaleString()}`, icon: 'credit-card' },
            { label: 'Supplier Debt', value: `$${stats.totalSupplierDebt.toLocaleString()}`, icon: 'dollar-sign' },
          ],
        };

      case 'general_manager':
        return {
          title: 'Management Dashboard',
          links: [
            { label: 'Approve Transactions', to: '/transactions' },
            { label: 'View Reports', to: '/reports' },
            { label: 'Manage Customers', to: '/customers' },
            { label: 'Manage Suppliers', to: '/suppliers' },
          ],
          stats: [
            { label: 'Pending Approvals', value: stats.pendingTransactions, icon: 'clock' },
            { label: 'Sales Transactions', value: stats.salesTransactions, icon: 'shopping-cart' },
            { label: 'Procurement Transactions', value: stats.procurementTransactions, icon: 'package' },
            { label: 'Production Transactions', value: stats.productionTransactions, icon: 'cog' },
            { label: 'Customer Credit', value: `$${stats.totalCustomerCredit.toLocaleString()}`, icon: 'credit-card' },
            { label: 'Supplier Debt', value: `$${stats.totalSupplierDebt.toLocaleString()}`, icon: 'dollar-sign' },
          ],
        };

      case 'system_admin':
        return {
          title: 'System Administration',
          links: [
            { label: 'Manage Users', to: '/users' },
          ],
          stats: [],
        };

      default:
        return {
          title: 'Dashboard',
          links: [],
          stats: [],
        };
    }
  };

  const dashboardContent = getDashboardContent();

  const getIcon = (iconName) => {
    const icons = {
      users: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      'shopping-cart': (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
        </svg>
      ),
      truck: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      package: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      cog: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      clock: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'credit-card': (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      'dollar-sign': (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
    return icons[iconName] || icons.users;
  };

  const getIconColor = (iconName) => {
    const colors = {
      users: 'bg-indigo-500',
      'shopping-cart': 'bg-green-500',
      truck: 'bg-blue-500',
      package: 'bg-purple-500',
      cog: 'bg-gray-500',
      clock: 'bg-yellow-500',
      'credit-card': 'bg-red-500',
      'dollar-sign': 'bg-green-500',
    };
    return colors[iconName] || 'bg-indigo-500';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{dashboardContent.title}</h1>

      {dashboardContent.links.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dashboardContent.links.map((link) => (
            <button
              key={link.label}
              onClick={() => window.location.href = link.to}
              className="bg-white p-4 rounded-lg shadow hover:bg-gray-50 text-left"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}

      {dashboardContent.stats.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {dashboardContent.stats.map((stat, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${getIconColor(stat.icon)}`}>
                    {getIcon(stat.icon)}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                      <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome, {user?.full_name}!</h2>
        <p className="text-gray-600">
          You are logged in as <span className="font-medium capitalize">{user?.role.replace('_', ' ')}</span>.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
