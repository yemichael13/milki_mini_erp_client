import { useEffect, useState } from 'react';
import api from '../lib/api';

const Reports = () => {
  const [creditReport, setCreditReport] = useState([]);
  const [debtReport, setDebtReport] = useState([]);
  const [summary, setSummary] = useState(null);
  const [transactionReport, setTransactionReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');

  useEffect(() => {
    fetchReports();
  }, [fromDate, toDate, transactionType, transactionStatus]);

  const fetchReports = async () => {
    try {
      const params = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const transactionParams = { ...params };
      if (transactionType) transactionParams.type = transactionType;
      if (transactionStatus) transactionParams.status = transactionStatus;
      const [creditRes, debtRes, totalsRes, transactionsRes] = await Promise.all([
        api.get('/reports/customer-credit', { params }),
        api.get('/reports/supplier-debt', { params }),
        api.get('/reports/summary', { params }),
        api.get('/reports/transactions', { params: transactionParams }),
      ]);
      setCreditReport(creditRes.data);
      setDebtReport(debtRes.data);
      setSummary(totalsRes.data);
      setTransactionReport(transactionsRes.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async (type) => {
    try {
      const params = { format: 'csv' };
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      if (type === 'transactions') {
        if (transactionType) params.type = transactionType;
        if (transactionStatus) params.status = transactionStatus;
      }
      const res = await api.get(`/reports/${type}`, { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to export CSV');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className='p-2'>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>
      {summary && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Customer Credit</div>
            <div className="text-2xl font-semibold text-gray-900">
              ${Number(summary.total_customer_credit || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Supplier Debt</div>
            <div className="text-2xl font-semibold text-gray-900">
              ${Number(summary.total_supplier_debt || 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 block px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 block px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div><label className="block text-sm font-medium text-gray-700">Transaction Type</label><select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"><option value="">All types</option><option value="sale">Sales</option><option value="procurement">Procurement</option><option value="production">Production</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700">Transaction Status</label><select value={transactionStatus} onChange={(e) => setTransactionStatus(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"><option value="">All statuses</option><option value="pending">Pending</option><option value="accountant_approved">Accountant Approved</option><option value="manager_approved">Manager Approved</option><option value="rejected">Rejected</option></select></div>
      </div>
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-semibold">All Transaction History</h2><p className="text-sm text-gray-500">Includes pending, approved, rejected, paid, credit, and debt transactions.</p></div><button onClick={() => exportCSV('transactions')} className="text-sm text-indigo-600 hover:text-indigo-900">Export CSV</button></div>
        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{['Date','Type','Department','Amount','Payment','Status','Customer / Supplier','Created By'].map((head) => <th key={head} className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">{head}</th>)}</tr></thead><tbody className="divide-y divide-gray-200 bg-white">{transactionReport.map((row) => <tr key={row.id}><td className="px-4 py-2 text-sm">{row.date ? new Date(row.date).toLocaleString() : ''}</td><td className="px-4 py-2 text-sm capitalize">{row.type}</td><td className="px-4 py-2 text-sm capitalize">{row.source_department}</td><td className="px-4 py-2 text-sm">${Number(row.amount || 0).toLocaleString()}</td><td className="px-4 py-2 text-sm capitalize">{row.payment_type}</td><td className="px-4 py-2 text-sm">{row.status}</td><td className="px-4 py-2 text-sm">{row.customer || row.supplier || '-'}</td><td className="px-4 py-2 text-sm">{row.created_by || '-'}</td></tr>)}{!transactionReport.length && <tr><td colSpan="8" className="px-4 py-8 text-center text-sm text-gray-400">No transactions found</td></tr>}</tbody></table></div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Customer Credit Report</h2>
            <button
              onClick={() => exportCSV('customer-credit')}
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Credit Sales</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid Sales</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {creditReport.map((row) => (
                  <tr key={row.customer_id}>
                    <td className="px-4 py-2 text-sm">{row.customer_name}</td>
                    <td className="px-4 py-2 text-sm">${Number(row.total_credit_sales || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">${Number(row.total_customer_payments || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm font-medium">
                      ${parseFloat(row.credit_balance).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Supplier Debt Report</h2>
            <button
              onClick={() => exportCSV('supplier-debt')}
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Debt Purchases</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid Purchases</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {debtReport.map((row) => (
                  <tr key={row.supplier_id}>
                    <td className="px-4 py-2 text-sm">{row.supplier_name}</td>
                    <td className="px-4 py-2 text-sm">${Number(row.total_credit_procurement || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">${Number(row.total_supplier_payments || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm font-medium">
                      ${Number(row.debt_balance || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
