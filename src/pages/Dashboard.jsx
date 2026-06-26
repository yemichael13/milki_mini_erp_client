import { useEffect, useState } from 'react';
import { useAuth, normalizeRole } from '../contexts/AuthContext';
import api from '../lib/api';
import Logo from '../assets/logo.png';


const Dashboard = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const roleLabel = (role || 'team member').replace(/_/g, ' ');
  const todayLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
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
  const [inventoryStats, setInventoryStats] = useState({
    total_produced_pieces: 0,
    total_produced_quintals: 0,
    total_released_pieces: 0,
    total_released_quintals: 0,
    total_returned_pieces: 0,
    total_returned_quintals: 0,
    current_inventory_pieces: 0,
    current_inventory_quintals: 0,
    pending_approvals: 0,
    pending_manager_reviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
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

        const needsInventory = ['production_recorder', 'production_approver', 'general_manager', 'accountant'];
        const inventoryRes = needsInventory.includes(role) ? await api.get('/inventory') : null;
        const inventoryData = inventoryRes?.data || inventoryStats;
        if (inventoryRes) {
          setInventoryStats(inventoryRes.data);
        }

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

        } else if (role === 'production_recorder' || role === 'production_approver') {
          statsData.productionTransactions = Number(inventoryData.total_produced_pieces || 0);
          statsData.pendingTransactions = Number(inventoryData.pending_approvals || 0);
          statsData.totalProductionExpenses = Number(inventoryData.current_inventory_pieces || 0);

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
          statsData.pendingTransactions = transactionsRes.data.filter(tx => tx.status === 'accountant_approved').length;
          statsData.totalCustomerCredit = totalCredit === 0 ? 0 : totalCredit - totalPaidSales;
          statsData.totalSupplierDebt = totalDebt === 0 ? 0 : totalDebt - totalPaidProc;

        } else if (role === 'general_manager') {
          const transactionsRes = await api.get('/transactions', { params: { status: 'all' } });
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

          statsData.pendingTransactions = transactionsRes.data.filter(tx => tx.status === 'accountant_approved').length;
          statsData.salesTransactions = transactionsRes.data.filter(tx => tx.type === 'sale').length;
          statsData.procurementTransactions = transactionsRes.data.filter(tx => tx.type === 'procurement').length;
          statsData.productionTransactions = transactionsRes.data.filter(tx => tx.type === 'production').length;
          statsData.totalCustomerCredit = totalCredit === 0 ? 0 : totalCredit - totalPaidSales;
          statsData.totalSupplierDebt = totalDebt === 0 ? 0 : totalDebt - totalPaidProc;
          statsData.totalProductionExpenses = Number(inventoryData.current_inventory_pieces || 0);
        }

        setStats(statsData);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, role]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            <div>
              <p className="text-sm font-medium text-slate-900">Loading dashboard</p>
              <p className="text-xs text-slate-500">Preparing your overview.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Role-based links and content
  const getDashboardContent = () => {
    switch (role) {
      case 'sales':
        return {
          title: 'Sales Dashboard',
          eyebrow: 'Sales workspace',
          summary: 'Track customer activity, approvals, and revenue from one clean view.',
          heroIcon: 'shopping-cart',
          links: [
            { label: 'View Transactions', to: '/transactions', icon: 'clipboard-list', description: 'Review sales activity and approvals.' },
            { label: 'Manage Customers', to: '/customers', icon: 'users', description: 'Keep customer records tidy and current.' },
            { label: 'New Sale', to: '/transactions', icon: 'shopping-cart', description: 'Start a new sales transaction quickly.' },
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
          eyebrow: 'Procurement workspace',
          summary: 'Monitor suppliers, purchases, and pending work with fewer clicks.',
          heroIcon: 'truck',
          links: [
            { label: 'View Transactions', to: '/transactions', icon: 'clipboard-list', description: 'See purchase records and status updates.' },
            { label: 'Manage Suppliers', to: '/suppliers', icon: 'truck', description: 'Keep supplier details organized in one place.' },
            { label: 'New Procurement', to: '/transactions', icon: 'package', description: 'Create a new procurement entry.' },
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
          eyebrow: 'Production workspace',
          summary: 'Keep production work organized, visible, and easy to review.',
          heroIcon: 'factory',
          links: [
            { label: 'View Transactions', to: '/transactions', icon: 'clipboard-list', description: 'Review production entries and approvals.' },
            { label: 'New Production Expense', to: '/transactions', icon: 'factory', description: 'Record a new production-related expense.' },
          ],
          stats: [
            { label: 'Production Transactions', value: stats.productionTransactions, icon: 'cog' },
            { label: 'Pending Approvals', value: stats.pendingTransactions, icon: 'clock' },
            { label: 'Production Expenses', value: `$${stats.totalProductionExpenses.toLocaleString()}`, icon: 'dollar-sign' },
          ],
        };

      case 'production_recorder':
        return {
          title: 'Production Inventory Recorder',
          eyebrow: 'Inventory workspace',
          summary: 'Record inventory movement and keep production counts accurate.',
          heroIcon: 'boxes',
          links: [
            { label: 'Open Inventory Module', to: '/production-inventory', icon: 'boxes', description: 'Open the inventory module for updates.' },
            { label: 'Production Records', to: '/production-inventory', icon: 'clipboard-list', description: 'Review recent production records.' },
          ],
          stats: [
            { label: 'Current Inventory', value: `${inventoryStats.current_inventory_pieces.toLocaleString()} pcs`, icon: 'package' },
            { label: 'Pending Approvals', value: inventoryStats.pending_approvals, icon: 'clock' },
            { label: 'Pending Manager Reviews', value: inventoryStats.pending_manager_reviews, icon: 'cog' },
            { label: 'Produced Pieces', value: inventoryStats.total_produced_pieces.toLocaleString(), icon: 'shopping-cart' },
          ],
        };

      case 'production_approver':
        return {
          title: 'Production Approval Desk',
          eyebrow: 'Approval workspace',
          summary: 'Approve production activity and review inventory changes at a glance.',
          heroIcon: 'shield-check',
          links: [
            { label: 'Review Inventory', to: '/production-inventory', icon: 'boxes', description: 'Check inventory levels and movement.' },
            { label: 'Approve Production', to: '/production-inventory', icon: 'shield-check', description: 'Approve items waiting for your review.' },
          ],
          stats: [
            { label: 'Pending Approvals', value: inventoryStats.pending_approvals, icon: 'clock' },
            { label: 'Pending Manager Reviews', value: inventoryStats.pending_manager_reviews, icon: 'cog' },
            { label: 'Current Inventory', value: `${inventoryStats.current_inventory_pieces.toLocaleString()} pcs`, icon: 'package' },
            { label: 'Produced Quintals', value: `${inventoryStats.total_produced_quintals.toLocaleString()}`, icon: 'dollar-sign' },
          ],
        };

      case 'accountant':
        return {
          title: 'Accounting Dashboard',
          eyebrow: 'Finance workspace',
          summary: 'Focus on approvals, balances, and reports without visual clutter.',
          heroIcon: 'credit-card',
          links: [
            { label: 'View All Transactions', to: '/transactions', icon: 'clipboard-list', description: 'Inspect every approved transaction.' },
            { label: 'Financial Reports', to: '/reports', icon: 'chart', description: 'Open reports for a higher-level summary.' },
            { label: 'Inventory Module', to: '/production-inventory', icon: 'boxes', description: 'Check the inventory balance when needed.' },
          ],
          stats: [
            { label: 'Total Transactions', value: stats.totalTransactions, icon: 'package' },
            { label: 'Pending Transactions', value: stats.pendingTransactions, icon: 'clock' },
            { label: 'Customer Credit', value: `$${stats.totalCustomerCredit.toLocaleString()}`, icon: 'credit-card' },
            { label: 'Supplier Debt', value: `$${stats.totalSupplierDebt.toLocaleString()}`, icon: 'dollar-sign' },
            { label: 'Inventory Balance', value: `${inventoryStats.current_inventory_pieces.toLocaleString()} pcs`, icon: 'cog' },
          ],
        };

      case 'general_manager':
        return {
          title: 'Management Dashboard',
          eyebrow: 'Leadership workspace',
          summary: 'A concise command center for approvals, performance, and oversight.',
          heroIcon: 'sparkles',
          links: [
            { label: 'Approve Transactions', to: '/transactions', icon: 'shield-check', description: 'Handle pending work from every department.' },
            { label: 'View Reports', to: '/reports', icon: 'chart', description: 'Review performance and financial reports.' },
            { label: 'Manage Customers', to: '/customers', icon: 'users', description: 'Keep customer records clean and current.' },
            { label: 'Manage Suppliers', to: '/suppliers', icon: 'truck', description: 'Oversee supplier information in one place.' },
            { label: 'Production Inventory', to: '/production-inventory', icon: 'boxes', description: 'Monitor inventory flow and approvals.' },
          ],
          stats: [
            { label: 'Pending Approvals', value: stats.pendingTransactions, icon: 'clock' },
            { label: 'Sales Transactions', value: stats.salesTransactions, icon: 'shopping-cart' },
            { label: 'Procurement Transactions', value: stats.procurementTransactions, icon: 'package' },
            { label: 'Production Transactions', value: stats.productionTransactions, icon: 'cog' },
            { label: 'Customer Credit', value: `$${stats.totalCustomerCredit.toLocaleString()}`, icon: 'credit-card' },
            { label: 'Supplier Debt', value: `$${stats.totalSupplierDebt.toLocaleString()}`, icon: 'dollar-sign' },
            { label: 'Inventory Balance', value: `${inventoryStats.current_inventory_pieces.toLocaleString()} pcs`, icon: 'package' },
            { label: 'Manager Reviews', value: inventoryStats.pending_manager_reviews, icon: 'clock' },
          ],
        };

      case 'system_admin':
        return {
          title: 'System Administration',
          eyebrow: 'Admin workspace',
          summary: 'A focused place for system access without extra noise.',
          heroIcon: 'users',
          links: [
            { label: 'Manage Users', to: '/users', icon: 'users', description: 'Review and maintain user access.' },
          ],
          stats: [],
        };

      default:
        return {
          title: 'Dashboard',
          eyebrow: 'Overview',
          summary: 'Your dashboard is ready.',
          heroIcon: 'sparkles',
          links: [],
          stats: [],
        };
    }
  };

  const dashboardContent = getDashboardContent();

  const getIcon = (iconName, className = 'h-5 w-5') => {
    const icons = {
      users: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      'shopping-cart': (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
        </svg>
      ),
      truck: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      package: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      boxes: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.3 7.5L12 12l8.7-4.5M12 22V12" />
        </svg>
      ),
      cog: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      clock: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'credit-card': (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      'dollar-sign': (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      chart: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-3" />
        </svg>
      ),
      'shield-check': (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 4v5c0 4.418-3.134 8.49-7 9-3.866-.51-7-4.582-7-9V7l7-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
        </svg>
      ),
      sparkles: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 3l.8 2.2L22 6l-2.2.8L19 9l-.8-2.2L16 6l2.2-.8L19 3z" />
        </svg>
      ),
      factory: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V10l6 3V10l6 3V8l4-2v15" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21v-5m4 5v-8m4 8v-5" />
        </svg>
      ),
      'clipboard-list': (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6a1 1 0 011 1v2H8V4a1 1 0 011-1z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 5h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11h6M9 15h6M9 9h1" />
        </svg>
      ),
    };
    return icons[iconName] || icons.users;
  };

  const getIconColor = (iconName) => {
    const colors = {
      users: 'bg-sky-50 text-sky-600 ring-1 ring-sky-100',
      'shopping-cart': 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
      truck: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100',
      package: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100',
      boxes: 'bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100',
      cog: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
      clock: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
      'credit-card': 'bg-rose-50 text-rose-600 ring-1 ring-rose-100',
      'dollar-sign': 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
      chart: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100',
      'shield-check': 'bg-green-50 text-green-600 ring-1 ring-green-100',
      sparkles: 'bg-fuchsia-50 text-fuchsia-600 ring-1 ring-fuchsia-100',
      factory: 'bg-orange-50 text-orange-600 ring-1 ring-orange-100',
      'clipboard-list': 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
    };
    return colors[iconName] || 'bg-sky-50 text-sky-600 ring-1 ring-sky-100';
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.04] blur-[1px]"
        style={{ backgroundImage: `url(${Logo})` }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-6 text-white sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-inset ring-white/15">
                  {getIcon(dashboardContent.heroIcon || 'sparkles', 'h-7 w-7')}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/90">
                    {dashboardContent.eyebrow}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {dashboardContent.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                    {dashboardContent.summary}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300">User</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {user?.full_name || 'Team member'}
                  </p>
                  <p className="text-xs text-slate-300 capitalize">{roleLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Today</p>
                  <p className="mt-1 text-sm font-semibold text-white">{todayLabel}</p>
                  <p className="text-xs text-slate-300">Current working view</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {dashboardContent.links.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Quick access
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  Shortcuts
                </h2>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {dashboardContent.links.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => (window.location.href = link.to)}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${getIconColor(link.icon)}`}>
                        {getIcon(link.icon || 'clipboard-list')}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {link.label}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {link.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1 rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-400 transition group-hover:border-slate-300 group-hover:bg-white group-hover:text-slate-700">
                      {getIcon('chart', 'h-4 w-4 -rotate-90')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {dashboardContent.stats.length > 0 && (
          <section className="mb-8">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Snapshot
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                Key metrics
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {dashboardContent.stats.map((stat, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="h-1 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500" />
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${getIconColor(stat.icon)}`}>
                        {getIcon(stat.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-500">
                          {stat.label}
                        </p>
                        <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Welcome
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Welcome, {user?.full_name || 'Team member'}!
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                You are logged in as{' '}
                <span className="font-semibold capitalize text-slate-900">
                  {roleLabel}
                </span>
                . This dashboard keeps your most important work in one calm, focused place.
              </p>
            </div>
            <div className="border-t border-slate-200 bg-slate-50 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Workspace note
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Use the shortcut cards above for day-to-day work and the metric tiles for a quick health check.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
