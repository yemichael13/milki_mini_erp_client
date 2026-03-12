import { useEffect, useState } from 'react';
import api from '../lib/api';

const Reports = () => {
  const [creditReport, setCreditReport] = useState([]);
  const [debtReport, setDebtReport] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchReports();
  }, [fromDate, toDate]);

  const fetchReports = async () => {
    try {
      const params = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const [creditRes, debtRes, totalsRes] = await Promise.all([
        api.get('/reports/customer-credit', { params }),
        api.get('/reports/supplier-debt', { params }),
        api.get('/reports/summary', { params }),
      ]);
      setCreditReport(creditRes.data);
      setDebtReport(debtRes.data);
      setSummary(totalsRes.data);
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
    <div>
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
      <div className="mb-6 flex space-x-4">
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
